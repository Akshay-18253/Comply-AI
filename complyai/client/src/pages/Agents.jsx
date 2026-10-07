import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Play, CheckCircle2, AlertTriangle, Clock, Terminal,
  Cpu, Sparkles, ChevronRight, RefreshCw, ArrowRight, ShieldCheck,
  Search, Database, FileCheck, Layers, Eye
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingState, EmptyState, StatusBadge } from '../components/shared/UIComponents';
import toast from 'react-hot-toast';

const ROLE_ICONS = {
  1: Cpu,
  2: Database,
  3: Search,
  4: Bot,
  5: Clock,
  6: ShieldCheck,
};

export default function Agents() {
  const { t } = useLanguage();
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRun, setLoadingRun] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

  const agentRoles = [1, 2, 3, 4, 5, 6].map(order => ({
    order,
    name: t(`agents_role_${order}_name`),
    description: t(`agents_role_${order}_desc`),
    icon: ROLE_ICONS[order],
  }));

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const res = await api.get('/agents/runs');
      const fetchedRuns = res.data.runs || [];
      setRuns(fetchedRuns);
      if (fetchedRuns.length > 0 && !selectedRun) {
        selectRun(fetchedRuns[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load agent runs');
    } finally {
      setLoading(false);
    }
  };

  const selectRun = async (runId) => {
    setLoadingRun(true);
    try {
      const res = await api.get(`/agents/runs/${runId}`);
      setSelectedRun(res.data.run);
      setSteps(res.data.steps || []);
      if (res.data.steps && res.data.steps.length > 0) {
        setSelectedStep(res.data.steps[0]);
      } else {
        setSelectedStep(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load run details');
    } finally {
      setLoadingRun(false);
    }
  };

  const handleTriggerRun = async () => {
    setExecuting(true);
    toast('Orchestrating 6-Agent AI Compliance Workflow...', { icon: '🤖' });
    try {
      const res = await api.post('/compliance/discover');
      toast.success('Agent workflow executed successfully!');
      await loadRuns();
      if (res.data?.run_id) {
        selectRun(res.data.run_id);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Agent execution failed');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <LoadingState message={t('agents_loading_telemetry')} />;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary-400" />
            {t('agents_title')}
          </h1>
          <p className="text-surface-400 mt-1">
            {t('agents_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRuns}
            className="btn-secondary text-sm py-2 px-3 flex items-center gap-2"
            title={t('action_refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleTriggerRun}
            disabled={executing}
            className="btn-primary text-sm py-2.5 px-4 flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            {executing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('agents_running')}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                {t('agents_trigger_btn')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Agent Pipeline Diagram */}
      <div className="glass-card p-6 overflow-hidden">
        <h2 className="text-sm font-bold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-400" />
          {t('agents_arch_title')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {agentRoles.map((agent) => {
            const stepData = steps.find(s => s.step_order === agent.order);
            const isCompleted = stepData?.status === 'Completed';
            const isFailed = stepData?.status === 'Failed';
            const isRunning = stepData?.status === 'Running' || (executing && !isCompleted);

            return (
              <div
                key={agent.order}
                className={`p-3.5 rounded-xl border transition-all duration-300 relative flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : isFailed
                    ? 'bg-red-950/20 border-red-500/30'
                    : isRunning
                    ? 'bg-primary-950/30 border-primary-500/50 shadow-lg shadow-primary-500/10'
                    : 'bg-surface-900/40 border-surface-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-surface-500 font-bold uppercase">
                      {t('agents_step')} 0{agent.order}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isRunning ? (
                      <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-surface-600" />
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-primary-400 mb-2">
                    <agent.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white leading-tight">
                    {agent.name}
                  </h3>
                  <p className="text-[10px] text-surface-400 mt-1 line-clamp-3">
                    {agent.description}
                  </p>
                </div>

                {stepData?.duration_ms && (
                  <div className="text-[10px] text-surface-500 mt-3 pt-2 border-t border-surface-800/80 font-mono">
                    {stepData.duration_ms}ms
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content: Left Run History, Right Detailed Telemetry */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Runs List */}
        <div className="space-y-4">
          <div className="glass-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span>{t('agents_runs_title')}</span>
              <span className="text-xs text-surface-400 font-normal">({runs.length} total)</span>
            </h2>

            {runs.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-8 h-8 text-surface-600 mx-auto mb-2" />
                <p className="text-xs text-surface-400">{t('agents_runs_empty')}</p>
                <button
                  onClick={handleTriggerRun}
                  disabled={executing}
                  className="btn-primary text-xs mt-3 py-1.5 px-3"
                >
                  {t('agents_runs_run_first')}
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {runs.map(run => {
                  const isSelected = selectedRun?.id === run.id;
                  return (
                    <button
                      key={run.id}
                      onClick={() => selectRun(run.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-primary-500/15 border-primary-500/40 text-white'
                          : 'bg-surface-800/40 border-surface-700/40 hover:bg-surface-800/80 text-surface-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">
                          {run.workflow_type || 'Compliance Discovery'}
                        </span>
                        <StatusBadge status={run.status || 'Completed'} />
                      </div>
                      <div className="text-[11px] text-surface-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(run.started_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Step-by-Step Telemetry & JSON payload */}
        <div className="lg:col-span-2 space-y-6">
          {loadingRun ? (
            <div className="glass-card p-12 text-center">
              <span className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin inline-block mb-3" />
              <p className="text-xs text-surface-400">{t('agents_loading_telemetry')}</p>
            </div>
          ) : !selectedRun ? (
            <div className="glass-card p-12 text-center">
              <p className="text-surface-400 text-sm">{t('agents_select_run')}</p>
            </div>
          ) : (
            <>
              {/* Run Summary Card */}
              <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedRun.workflow_type || 'Full Compliance Discovery'}
                  </h3>
                  <p className="text-xs text-surface-400 mt-0.5">
                    ID: <span className="font-mono text-surface-300">{selectedRun.id}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedRun.status} />
                  {selectedRun.completed_at && (
                    <span className="text-xs text-surface-400 font-mono">
                      Completed: {new Date(selectedRun.completed_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Steps Tabs */}
              <div className="glass-card p-4 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary-400" />
                  {t('agents_trace_title')} ({steps.length} Steps)
                </h3>

                <div className="flex flex-wrap gap-2">
                  {steps.map((st, idx) => {
                    const active = selectedStep?.id === st.id;
                    const stepRole = agentRoles.find(r => r.order === st.step_order);
                    return (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStep(st)}
                        className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                          active
                            ? 'bg-primary-500 text-white border-primary-400 shadow'
                            : 'bg-surface-800/60 text-surface-300 border-surface-700 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] font-mono opacity-80">#{idx + 1}</span>
                        <span>{stepRole?.name || st.agent_name || `Agent ${idx + 1}`}</span>
                        {st.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Step Inspector */}
                {selectedStep && (
                  <div className="space-y-4 pt-3 border-t border-surface-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {agentRoles.find(r => r.order === selectedStep.step_order)?.name || selectedStep.agent_name}
                        </h4>
                        <span className="text-xs text-surface-400">
                          {t('agents_status')}: <span className="text-emerald-400 font-semibold">{selectedStep.status}</span> · {t('agents_duration')}: {selectedStep.duration_ms || 0}ms
                        </span>
                      </div>
                    </div>

                    {/* Step Output Payload (Formatted JSON or Text) */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-primary-400" /> {t('agents_output_artifact')}
                      </span>
                      <pre className="bg-surface-950/90 rounded-xl p-4 border border-surface-800 font-mono text-xs text-primary-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {typeof selectedStep.output_payload === 'string'
                          ? selectedStep.output_payload
                          : JSON.stringify(selectedStep.output_payload, null, 2)}
                      </pre>
                    </div>

                    {/* Step Input Context */}
                    {selectedStep.input_context && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-accent-400" /> {t('agents_input_context')}
                        </span>
                        <pre className="bg-surface-950/60 rounded-xl p-3 border border-surface-800 font-mono text-[11px] text-surface-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {typeof selectedStep.input_context === 'string'
                            ? selectedStep.input_context
                            : JSON.stringify(selectedStep.input_context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
