import { supabaseAdmin } from '../config/supabase.js';
import { generateEmbedding } from './gemini.service.js';

export async function retrieveRelevantKnowledge(query, matchCount = 10, threshold = 0.3) {
  try {
    const embedding = await generateEmbedding(query);

    const { data, error } = await supabaseAdmin.rpc('match_knowledge_chunks', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: matchCount,
    });

    if (error) {
      console.error('RAG retrieval error:', error.message);
      const { data: fallback } = await supabaseAdmin
        .from('knowledge_chunks')
        .select('*, sources(*)')
        .limit(matchCount);
      return fallback || [];
    }

    if (data && data.length > 0) {
      const sourceIds = [...new Set(data.map(d => d.source_id))];
      const { data: sources } = await supabaseAdmin
        .from('sources')
        .select('*')
        .in('id', sourceIds);

      const sourceMap = {};
      (sources || []).forEach(s => { sourceMap[s.id] = s; });

      return data.map(chunk => ({
        ...chunk,
        source: sourceMap[chunk.source_id] || null,
      }));
    }

    const { data: fallback } = await supabaseAdmin
      .from('knowledge_chunks')
      .select('*, sources:source_id(*)')
      .limit(matchCount);
    return (fallback || []).map(k => ({ ...k, source: k.sources }));
  } catch (error) {
    console.error('RAG error:', error.message);
    const { data: fallback } = await supabaseAdmin
      .from('knowledge_chunks')
      .select('*, sources:source_id(*)')
      .limit(matchCount);
    return (fallback || []).map(k => ({ ...k, source: k.sources }));
  }
}

export async function getSourcesForDomains(domains) {
  const { data, error } = await supabaseAdmin
    .from('sources')
    .select('*')
    .in('category', domains)
    .eq('status', 'Active');

  if (error) {
    console.error('Source retrieval error:', error.message);
    return [];
  }
  return data || [];
}

export async function getAllKnowledgeForDomains(domains) {
  const { data, error } = await supabaseAdmin
    .from('knowledge_chunks')
    .select('*, sources:source_id(*)')
    .limit(50);

  if (error) return [];
  return (data || []).filter(k => {
    const meta = k.metadata || {};
    return domains.some(d =>
      (meta.category || '').toLowerCase().includes(d.toLowerCase()) ||
      (k.sources?.category || '').toLowerCase().includes(d.toLowerCase())
    );
  }).map(k => ({ ...k, source: k.sources }));
}

export async function getExistingRequirements() {
  const { data, error } = await supabaseAdmin
    .from('compliance_requirements')
    .select('*, sources:source_id(*)');
  if (error) return [];
  return data || [];
}
