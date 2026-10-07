import { supabaseAdmin } from '../config/supabase.js';
import { runProfilingAgent } from './profiling.agent.js';
import { runDiscoveryAgent } from './discovery.agent.js';
import { runReasoningAgent } from './reasoning.agent.js';
import { runDeadlineAgent } from './deadline.agent.js';
import { runVerificationAgent } from './verification.agent.js';
import { retrieveRelevantKnowledge, getAllKnowledgeForDomains, getExistingRequirements } from '../services/rag.service.js';

export async function runComplianceDiscoveryWorkflow(business, userId) {
  const { data: run, error: runErr } = await supabaseAdmin
    .from('agent_runs')
    .insert({
      business_id: business.id,
      user_id: userId,
      workflow_type: 'compliance_discovery',
      status: 'Running',
      input: { business_id: business.id, business_name: business.business_name },
    })
    .select()
    .single();

  if (runErr) throw new Error('Failed to create agent run');

  const steps = [
    'Business Profiling Agent',
    'Compliance Discovery Agent',
    'Compliance Reasoning Agent',
    'Document Intelligence Agent',
    'Deadline & Action Agent',
    'Verification Agent',
  ];

  const stepRecords = [];
  for (let i = 0; i < steps.length; i++) {
    const { data } = await supabaseAdmin
      .from('agent_steps')
      .insert({
        agent_run_id: run.id,
        agent_name: steps[i],
        step_order: i + 1,
        status: 'Waiting',
      })
      .select()
      .single();
    stepRecords.push(data);
  }

  try {
    // Step 1: Business Profiling
    await updateStep(stepRecords[0].id, 'Running', { business });
    const businessProfile = await runProfilingAgent(business);
    await updateStep(stepRecords[0].id, 'Completed', { business }, { profile: businessProfile }, 
      `Identified ${businessProfile.compliance_domains.length} compliance domains for ${businessProfile.industry} business in ${businessProfile.jurisdiction.state}`);

    // Step 2: Compliance Discovery with RAG
    await updateStep(stepRecords[1].id, 'Running', { domains: businessProfile.compliance_domains });
    
    const query = `Indian compliance requirements for ${businessProfile.industry} ${businessProfile.business_type} in ${businessProfile.jurisdiction.state} with ${businessProfile.characteristics.join(', ')}`;
    const knowledgeContext = await retrieveRelevantKnowledge(query, 15);
    const domainKnowledge = await getAllKnowledgeForDomains(businessProfile.compliance_domains);
    const allKnowledge = deduplicateKnowledge([...knowledgeContext, ...domainKnowledge]);
    
    const discoveryResult = await runDiscoveryAgent(businessProfile, allKnowledge);
    await updateStep(stepRecords[1].id, 'Completed', { knowledge_count: allKnowledge.length }, 
      { requirements_found: discoveryResult.requirements.length },
      `Discovered ${discoveryResult.requirements.length} potential requirements from ${allKnowledge.length} knowledge sources`);

    // Step 3: Compliance Reasoning
    await updateStep(stepRecords[2].id, 'Running', { candidate_count: discoveryResult.requirements.length });

    const existingReqs = await getExistingRequirements();
    const allSources = allKnowledge.map(k => k.source || k).filter(Boolean);
    
    const reasoningResult = await runReasoningAgent(businessProfile, discoveryResult.requirements, [...allSources, ...existingReqs]);
    await updateStep(stepRecords[2].id, 'Completed', {}, 
      { recommendations_count: reasoningResult.recommendations.length },
      `Evaluated ${reasoningResult.recommendations.length} requirements with evidence-based reasoning`);

    // Step 4: Document Intelligence (check existing docs)
    await updateStep(stepRecords[3].id, 'Running');
    const { data: existingDocs } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('business_id', business.id);
    
    const missingDocSummary = identifyMissingDocuments(reasoningResult.recommendations, existingDocs || []);
    await updateStep(stepRecords[3].id, 'Completed', { existing_docs: (existingDocs || []).length },
      { missing_documents: missingDocSummary },
      `Found ${(existingDocs || []).length} existing documents. Identified missing documents for compliance items.`);

    // Step 5: Deadline & Action Agent
    await updateStep(stepRecords[4].id, 'Running');
    const deadlineResult = await runDeadlineAgent(reasoningResult.recommendations, existingDocs || [], businessProfile);
    await updateStep(stepRecords[4].id, 'Completed', {},
      { actions_count: deadlineResult.actions.length },
      `Created ${deadlineResult.actions.length} actionable tasks`);

    // Step 6: Verification
    await updateStep(stepRecords[5].id, 'Running');
    const verificationResult = await runVerificationAgent(businessProfile, reasoningResult.recommendations, allSources);
    await updateStep(stepRecords[5].id, verificationResult.verified ? 'Completed' : 'Needs Review', {},
      { verified: verificationResult.verified, issues: verificationResult.issues.length, warnings: verificationResult.warnings.length },
      `Verification ${verificationResult.verified ? 'passed' : 'flagged issues'}. ${verificationResult.issues.length} issues, ${verificationResult.warnings.length} warnings.`);

    // Store results
    const finalRecommendations = verificationResult.final_recommendations || reasoningResult.recommendations;
    await storeComplianceResults(business.id, finalRecommendations, existingReqs);
    await storeActions(business.id, deadlineResult.actions);
    await createNotifications(userId, business.id, finalRecommendations);

    await supabaseAdmin
      .from('agent_runs')
      .update({
        status: 'Completed',
        output: {
          total_requirements: finalRecommendations.length,
          applicable: finalRecommendations.filter(r => r.decision === 'Applicable').length,
          potentially_applicable: finalRecommendations.filter(r => r.decision === 'Potentially Applicable').length,
          needs_verification: finalRecommendations.filter(r => r.decision === 'Needs Verification').length,
          actions: deadlineResult.actions.length,
          verification: { verified: verificationResult.verified, issues: verificationResult.issues },
        },
        completed_at: new Date().toISOString(),
      })
      .eq('id', run.id);

    return {
      run_id: run.id,
      profile: businessProfile,
      recommendations: finalRecommendations,
      actions: deadlineResult.actions,
      verification: verificationResult,
    };
  } catch (error) {
    console.error('Workflow error:', error.message);
    await supabaseAdmin
      .from('agent_runs')
      .update({ status: 'Failed', error_message: error.message, completed_at: new Date().toISOString() })
      .eq('id', run.id);

    const runningSteps = stepRecords.filter(s => s);
    for (const step of runningSteps) {
      await supabaseAdmin
        .from('agent_steps')
        .update({ status: 'Failed', completed_at: new Date().toISOString() })
        .eq('id', step.id)
        .in('status', ['Waiting', 'Running']);
    }

    throw error;
  }
}

async function updateStep(stepId, status, input = {}, output = {}, reasoning = null) {
  const update = { status, output };
  if (Object.keys(input).length) update.input = input;
  if (reasoning) update.reasoning_summary = reasoning;
  if (status === 'Running') update.started_at = new Date().toISOString();
  if (['Completed', 'Failed', 'Needs Review'].includes(status)) update.completed_at = new Date().toISOString();
  
  await supabaseAdmin.from('agent_steps').update(update).eq('id', stepId);
}

function deduplicateKnowledge(chunks) {
  const seen = new Set();
  return chunks.filter(c => {
    const key = c.title || c.content?.substring(0, 100);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function identifyMissingDocuments(recommendations, existingDocs) {
  const allRequired = [];
  const existingTypes = new Set((existingDocs || []).map(d => d.document_type?.toLowerCase()));

  for (const rec of recommendations) {
    if (rec.decision === 'Not Applicable') continue;
    for (const doc of (rec.required_documents || [])) {
      const found = existingTypes.has(doc.toLowerCase());
      allRequired.push({ document: doc, requirement: rec.requirement_name, available: found });
    }
  }
  return allRequired;
}

async function storeComplianceResults(businessId, recommendations, existingReqs) {
  const reqMap = {};
  existingReqs.forEach(r => { reqMap[r.name.toLowerCase()] = r; });

  for (const rec of recommendations) {
    if (rec.decision === 'Not Applicable') continue;

    let reqId = reqMap[rec.requirement_name.toLowerCase()]?.id;

    if (!reqId) {
      const { data: newReq } = await supabaseAdmin
        .from('compliance_requirements')
        .insert({
          name: rec.requirement_name,
          category: rec.category || 'General',
          description: rec.reason,
          authority: rec.authority || null,
          jurisdiction: rec.jurisdiction || 'Central',
          frequency: rec.frequency || null,
          required_documents: rec.required_documents || [],
          confidence: rec.confidence,
          verification_status: rec.confidence >= 0.8 ? 'verified' : 'unverified',
        })
        .select()
        .single();
      if (newReq) reqId = newReq.id;
    }

    if (reqId) {
      await supabaseAdmin
        .from('business_compliance')
        .upsert({
          business_id: businessId,
          requirement_id: reqId,
          status: 'Not Started',
          priority: rec.priority || 'Medium',
          applicability_reason: rec.reason,
          ai_explanation: rec.reason,
          confidence: rec.confidence,
          due_date: rec.deadline || null,
          next_action: rec.next_action,
        }, { onConflict: 'business_id,requirement_id' });
    }
  }
}

async function storeActions(businessId, actions) {
  if (!actions.length) return;

  const actionRecords = actions.map(a => ({
    business_id: businessId,
    title: a.title,
    description: a.description,
    priority: a.priority,
    due_date: a.due_date,
    status: 'Pending',
  }));

  await supabaseAdmin.from('actions').insert(actionRecords);
}

async function createNotifications(userId, businessId, recommendations) {
  const applicable = recommendations.filter(r => r.decision === 'Applicable' || r.decision === 'Potentially Applicable');
  
  if (applicable.length > 0) {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      business_id: businessId,
      type: 'compliance_update',
      title: 'Compliance Discovery Complete',
      message: `ComplyAI identified ${applicable.length} compliance requirements for your business. Review your compliance dashboard for details.`,
      severity: 'Info',
    });
  }

  const critical = recommendations.filter(r => r.priority === 'Critical');
  for (const item of critical) {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      business_id: businessId,
      type: 'action_required',
      title: `Critical: ${item.requirement_name}`,
      message: `${item.requirement_name} has been identified as a critical compliance requirement. ${item.next_action}`,
      severity: 'Critical',
    });
  }
}
