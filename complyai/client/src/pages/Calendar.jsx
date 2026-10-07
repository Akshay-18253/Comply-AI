import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Clock, AlertTriangle,
  CheckCircle2, Filter, Search, Calendar as CalendarIcon, Tag, Check, X
} from 'lucide-react';
import api from '../services/api';
import { LoadingState, EmptyState, PriorityBadge, StatusBadge } from '../components/shared/UIComponents';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Calendar() {
  const { t, currentLang, translateText } = useLanguage();
  const [actions, setActions] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'month'
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Add Action Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('High');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const [actRes, compRes] = await Promise.all([
        api.get('/actions'),
        api.get('/compliance')
      ]);
      setActions(actRes.data.actions || []);
      setCompliance(compRes.data.compliance || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load deadlines and tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (action) => {
    const newStatus = action.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await api.patch(`/actions/${action.id}`, { status: newStatus });
      setActions(prev => prev.map(a => a.id === action.id ? res.data.action : a));
      toast.success(newStatus === 'Completed' ? 'Task marked as completed!' : 'Task re-opened');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task status');
    }
  };

  const handleCreateAction = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) {
      toast.error('Title and due date are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/actions', {
        title: newTitle,
        description: newDesc,
        due_date: new Date(newDueDate).toISOString(),
        priority: newPriority,
        status: 'Pending',
      });
      setActions(prev => [res.data.action, ...prev]);
      toast.success('Action item created!');
      setModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      setNewPriority('High');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to create action');
    } finally {
      setSubmitting(false);
    }
  };

  // Combine compliance due dates with actions into single unified deadline feed
  const unifiedDeadlines = [
    ...actions.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      due_date: a.due_date,
      priority: a.priority,
      status: a.status,
      type: 'action',
      raw: a,
    })),
    ...compliance
      .filter(c => c.due_date && !actions.some(a => a.compliance_requirement_id === c.compliance_requirement_id))
      .map(c => ({
        id: `comp-${c.id}`,
        title: c.compliance_requirements?.name || 'Compliance Obligation',
        description: c.applicability_reason,
        due_date: c.due_date,
        priority: c.priority,
        status: c.status,
        type: 'compliance',
        raw: c,
      }))
  ].filter(d => Boolean(d.due_date));

  const filteredItems = unifiedDeadlines
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  // Calendar month math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  if (loading) return <LoadingState message={t('cal_subtitle')} />;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary-400" />
            {t('cal_title')}
          </h1>
          <p className="text-surface-400 mt-1">
            {t('cal_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="border border-surface-700 rounded-xl p-1 flex gap-1 bg-surface-900/60">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                viewMode === 'list' ? 'bg-primary-500 text-white shadow' : 'text-surface-400 hover:text-white'
              }`}
            >
              {t('cal_view_timeline')}
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                viewMode === 'month' ? 'bg-primary-500 text-white shadow' : 'text-surface-400 hover:text-white'
              }`}
            >
              {t('cal_view_month')}
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" /> {t('cal_add_action')}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={t('cal_search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-2 text-xs bg-surface-900"
          >
            <option value="All">{t('comp_all_statuses')}</option>
            <option value="Pending">{t('status_waiting')}</option>
            <option value="In Progress">{t('status_in_progress')}</option>
            <option value="Completed">{t('status_completed')}</option>
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
        </div>
      </div>

      {/* Views */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={t('cal_title')}
              description={t('cal_subtitle')}
              action={
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-primary mt-4 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {t('cal_add_action')}
                </button>
              }
            />
          ) : (
            filteredItems.map(item => {
              const dateObj = new Date(item.due_date);
              const daysLeft = Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24));
              const isCompleted = item.status === 'Completed';

              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 border-l-4 ${
                    isCompleted
                      ? 'border-l-emerald-500 opacity-70'
                      : daysLeft < 0
                      ? 'border-l-red-500'
                      : daysLeft <= 7
                      ? 'border-l-amber-500'
                      : 'border-l-primary-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Completion Toggle */}
                    {item.type === 'action' ? (
                      <button
                        onClick={() => handleToggleComplete(item.raw)}
                        className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-surface-600 hover:border-emerald-400 text-transparent'
                        }`}
                        title={isCompleted ? t('status_waiting') : t('action_complete')}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    ) : (
                      <div className="mt-1 w-6 h-6 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-primary-400 text-xs">
                        📜
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-bold ${isCompleted ? 'line-through text-surface-400' : 'text-white'}`}>
                          {translateText(item.title)}
                        </span>
                        <PriorityBadge priority={item.priority} />
                        <span className="text-[10px] uppercase font-semibold text-surface-400 bg-surface-800 px-2 py-0.5 rounded border border-surface-700">
                          {item.type === 'action' ? 'Task' : t('comp_title')}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-surface-400 line-clamp-2 max-w-2xl">
                          {translateText(item.description)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Due Date & Countdown */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-surface-800">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-surface-200 flex items-center gap-1.5 md:justify-end">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary-400" />
                        {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[11px] mt-0.5">
                        {isCompleted ? (
                          <span className="text-emerald-400 font-medium">{t('status_completed')}</span>
                        ) : daysLeft < 0 ? (
                          <span className="text-red-400 font-bold">{Math.abs(daysLeft)} {t('cal_days_overdue')}</span>
                        ) : daysLeft === 0 ? (
                          <span className="text-red-400 font-bold">{t('cal_due_today')}</span>
                        ) : (
                          <span className={`${daysLeft <= 7 ? 'text-amber-400 font-semibold' : 'text-surface-400'}`}>
                            {daysLeft} {t('cal_days_remaining')}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* Month Calendar View */
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg bg-surface-800 text-surface-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg bg-surface-800 text-surface-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-surface-800 rounded-xl overflow-hidden border border-surface-800 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-surface-900/90 py-2.5 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                {d}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-surface-950/60 min-h-[90px] p-2" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = filteredItems.filter(item => item.due_date && item.due_date.startsWith(dateStr));
              const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();

              return (
                <div
                  key={dayNum}
                  className={`bg-surface-900/50 min-h-[90px] p-2 text-left hover:bg-surface-800/40 transition-colors flex flex-col justify-between ${
                    isToday ? 'border border-primary-500/50 bg-primary-950/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-semibold ${isToday ? 'text-primary-400 font-bold' : 'text-surface-300'}`}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-primary-400" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[10px] p-1 rounded font-medium truncate ${
                          ev.priority === 'Critical'
                            ? 'bg-red-500/20 text-red-300'
                            : ev.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-primary-500/20 text-primary-300'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-surface-500">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Action Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{t('cal_add_action')}</h3>
              <button onClick={() => setModalOpen(false)} className="text-surface-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-surface-300">{t('cal_action_title')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('cal_action_placeholder')}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-field text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-surface-300">{t('cal_action_desc')}</label>
                <textarea
                  rows={2}
                  placeholder={t('cal_desc_placeholder')}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-field text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-surface-300">{t('comp_due_col')}</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="input-field text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-300">{t('comp_prio_col')}</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="input-field text-sm mt-1"
                  >
                    <option value="Critical">{t('priority_critical')}</option>
                    <option value="High">{t('priority_high')}</option>
                    <option value="Medium">{t('priority_medium')}</option>
                    <option value="Low">{t('priority_low')}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  {t('action_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  {submitting ? '...' : t('cal_create_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
