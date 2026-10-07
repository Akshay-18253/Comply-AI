import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Search, Filter, Bot, Calendar, AlertTriangle,
  CheckCircle2, ArrowRight, LayoutGrid, List, RefreshCw, ShieldAlert,
  Clock, FileText, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { LoadingState, EmptyState, StatusBadge, PriorityBadge, ConfidenceMeter } from '../components/shared/UIComponents';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Compliance() {
  const { t, translateText, translateCategory } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    loadCompliance();
  }, []);

  const loadCompliance = async () => {
    try {
      const res = await api.get('/compliance');
      setItems(res.data.compliance || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load compliance records');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    toast('Triggering AI Compliance Multi-Agent Workflow...', { icon: '🤖' });
    try {
      const res = await api.post('/compliance/discover');
      toast.success(`Discovered ${res.data?.requirements_count || 'applicable'} compliance requirements!`);
      await loadCompliance();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to run discovery workflow');
    } finally {
      setDiscovering(false);
    }
  };

  const handleMarkComplete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/compliance/${id}/complete`);
      toast.success('Marked compliance obligation as completed');
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'Completed', completed_at: new Date().toISOString() } : item));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const categories = ['All', ...new Set(items.map(i => i.compliance_requirements?.category).filter(Boolean))];

  const filteredItems = items.filter(item => {
    const req = item.compliance_requirements || {};
    const transName = translateText(req.name || '');
    const transAct = translateText(req.act_name || '');
    const transCat = translateCategory(req.category || '');
    const transDesc = translateText(item.applicability_reason || req.description || '');

    const matchesSearch = !search ||
      (req.name || '').toLowerCase().includes(search.toLowerCase()) ||
      transName.toLowerCase().includes(search.toLowerCase()) ||
      (req.description || '').toLowerCase().includes(search.toLowerCase()) ||
      transDesc.toLowerCase().includes(search.toLowerCase()) ||
      (item.applicability_reason || '').toLowerCase().includes(search.toLowerCase()) ||
      (req.act_name || '').toLowerCase().includes(search.toLowerCase()) ||
      transAct.toLowerCase().includes(search.toLowerCase()) ||
      transCat.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const stats = {
    total: items.length,
    completed: items.filter(i => i.status === 'Completed').length,
    overdue: items.filter(i => i.status === 'Overdue').length,
    inProgress: items.filter(i => i.status === 'In Progress' || i.status === 'Documents Pending').length,
    critical: items.filter(i => i.priority === 'Critical' || i.priority === 'High').length,
  };

  if (loading) return <LoadingState message="Fetching regulatory compliance obligations..." />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-primary-400" />
            {t('comp_title')}
          </h1>
          <p className="text-surface-400 mt-1">
            {t('comp_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCompliance}
            className="btn-secondary text-sm py-2.5 px-3 flex items-center gap-2"
            title={t('action_refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDiscover}
            disabled={discovering}
            className="btn-primary text-sm py-2.5 flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            {discovering ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('agents_running')}
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                {t('action_discover')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center text-primary-400 font-bold">
            {stats.total}
          </div>
          <div>
            <div className="text-xs text-surface-400">{t('comp_total_applicable')}</div>
            <div className="text-sm font-semibold text-surface-200">{t('comp_total_applicable')}</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold">
            {stats.completed}
          </div>
          <div>
            <div className="text-xs text-surface-400">{t('status_completed')}</div>
            <div className="text-sm font-semibold text-surface-200">{t('status_verified')}</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold">
            {stats.inProgress}
          </div>
          <div>
            <div className="text-xs text-surface-400">{t('status_in_progress')}</div>
            <div className="text-sm font-semibold text-surface-200">{t('comp_active_work')}</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 font-bold">
            {stats.critical}
          </div>
          <div>
            <div className="text-xs text-surface-400">{t('priority_high')}</div>
            <div className="text-sm font-semibold text-surface-200">{t('comp_high_risk')}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder={t('comp_search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field py-2 text-xs bg-surface-900"
            >
              <option value="All">{t('comp_all_categories')}</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{translateCategory(cat)}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field py-2 text-xs bg-surface-900"
            >
              <option value="All">{t('comp_all_statuses')}</option>
              <option value="Not Started">{t('status_not_started')}</option>
              <option value="In Progress">{t('status_in_progress')}</option>
              <option value="Documents Pending">{t('status_documents_pending')}</option>
              <option value="Ready to File">{t('status_ready_to_file')}</option>
              <option value="Completed">{t('status_completed')}</option>
              <option value="Overdue">{t('status_overdue')}</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field py-2 text-xs bg-surface-900"
            >
              <option value="All">{t('comp_all_priorities')}</option>
              <option value="Critical">{t('priority_critical')}</option>
              <option value="High">{t('priority_high')}</option>
              <option value="Medium">{t('priority_medium')}</option>
              <option value="Low">{t('priority_low')}</option>
            </select>

            <div className="border-l border-surface-700 pl-2 flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs ${viewMode === 'table' ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400 hover:text-white'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={items.length === 0 ? t('comp_title') : t('comp_search_placeholder')}
          description={
            items.length === 0
              ? t('dash_ready_discover_desc')
              : t('action_clear_filters')
          }
          action={
            items.length === 0 ? (
              <button onClick={handleDiscover} disabled={discovering} className="btn-primary mt-4 flex items-center gap-2">
                <Bot className="w-4 h-4" /> {t('action_discover')}
              </button>
            ) : (
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All'); }}
                className="btn-secondary mt-4 text-xs"
              >
                {t('action_clear_filters')}
              </button>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const req = item.compliance_requirements || {};
            const isCompleted = item.status === 'Completed';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5 flex flex-col justify-between hover:border-primary-500/40 transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-400/90 bg-primary-500/10 px-2.5 py-1 rounded-md border border-primary-500/20">
                      {translateCategory(req.category || 'General')}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>

                  <div>
                    <Link
                      to={`/compliance/${item.id}`}
                      className="text-base font-bold text-surface-100 hover:text-primary-400 transition-colors line-clamp-2"
                    >
                      {translateText(req.name)}
                    </Link>
                    {req.act_name && (
                      <p className="text-xs text-surface-400 mt-1 font-mono">
                        📜 {translateText(req.act_name)} {req.section_citation ? `(Sec. ${req.section_citation})` : ''}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-surface-400 line-clamp-3 leading-relaxed">
                    {translateText(item.applicability_reason || req.description)}
                  </p>

                  {item.confidence_score !== undefined && (
                    <div className="pt-2 border-t border-surface-800/80">
                      <div className="flex items-center justify-between text-[11px] text-surface-400 mb-1">
                        <span>{t('comp_reasoning_conf')}</span>
                        <span>{Math.round(item.confidence_score * 100)}%</span>
                      </div>
                      <ConfidenceMeter value={item.confidence_score} />
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-surface-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    {item.due_date && (
                      <span className="text-xs text-surface-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isCompleted && (
                      <button
                        onClick={(e) => handleMarkComplete(e, item.id)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title={t('action_complete')}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      to={`/compliance/${item.id}`}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                      title={t('action_details')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-surface-300">
              <thead className="bg-surface-800/60 text-xs text-surface-400 uppercase tracking-wider border-b border-surface-700/50">
                <tr>
                  <th className="px-5 py-3.5">{t('comp_act_col')}</th>
                  <th className="px-4 py-3.5">{t('comp_cat_col')}</th>
                  <th className="px-4 py-3.5">{t('comp_prio_col')}</th>
                  <th className="px-4 py-3.5">{t('comp_due_col')}</th>
                  <th className="px-4 py-3.5">{t('comp_conf_col')}</th>
                  <th className="px-4 py-3.5">{t('comp_status_col')}</th>
                  <th className="px-4 py-3.5 text-right">{t('comp_action_col')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {filteredItems.map(item => {
                  const req = item.compliance_requirements || {};
                  return (
                    <tr key={item.id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <Link to={`/compliance/${item.id}`} className="font-semibold text-surface-100 hover:text-primary-400 block">
                          {translateText(req.name)}
                        </Link>
                        <span className="text-xs text-surface-400 font-mono">
                          {translateText(req.act_name)} {req.section_citation ? `· Sec ${req.section_citation}` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-surface-400">
                        {translateCategory(req.category || 'General')}
                      </td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-4 py-4 text-xs text-surface-400">
                        {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Rolling'}
                      </td>
                      <td className="px-4 py-4 w-32">
                        <ConfidenceMeter value={item.confidence_score} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.status !== 'Completed' && (
                            <button
                              onClick={(e) => handleMarkComplete(e, item.id)}
                              className="text-xs px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all"
                            >
                              {t('action_complete')}
                            </button>
                          )}
                          <Link
                            to={`/compliance/${item.id}`}
                            className="text-xs px-2.5 py-1 rounded bg-surface-700 hover:bg-surface-600 text-surface-200 transition-all"
                          >
                            {t('action_details')}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
