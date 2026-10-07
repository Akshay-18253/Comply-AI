import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardCheck, FileText, AlertTriangle, Clock, CheckCircle2,
  Bot, ArrowRight, Rocket, Bell, CalendarDays, Award, Download
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingState, EmptyState, StatusBadge, PriorityBadge } from '../components/shared/UIComponents';
import ComplianceDossierModal from '../components/shared/ComplianceDossierModal';

export default function Dashboard() {
  const { t, translateText, translateCategory } = useLanguage();
  const [business, setBusiness] = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [actions, setActions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bizRes, compRes, actRes, docRes, notifRes] = await Promise.all([
        api.get('/business'),
        api.get('/compliance'),
        api.get('/actions'),
        api.get('/documents'),
        api.get('/notifications'),
      ]);
      setBusiness(bizRes.data.business);
      setCompliance(compRes.data.compliance || []);
      setActions(actRes.data.actions || []);
      setDocuments(docRes.data.documents || []);
      setNotifications(notifRes.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      await api.post('/compliance/discover');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDiscovering(false);
    }
  };

  if (loading) return <LoadingState message="Loading your dashboard..." />;

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
          <Rocket className="w-10 h-10 text-primary-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to ComplyAI!</h2>
          <p className="text-surface-400 max-w-md">Complete your business profile to get personalized compliance recommendations.</p>
        </div>
        <Link to="/onboarding" className="btn-primary flex items-center gap-2">
          Start Onboarding <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const stats = {
    total: compliance.length,
    completed: compliance.filter(c => c.status === 'Completed').length,
    overdue: compliance.filter(c => c.status === 'Overdue').length,
    dueSoon: compliance.filter(c => {
      if (!c.due_date) return false;
      const d = new Date(c.due_date);
      const now = new Date();
      const diff = (d - now) / (1000 * 60 * 60 * 24);
      return diff <= 7 && diff >= 0;
    }).length,
    needsReview: compliance.filter(c => c.status === 'Needs Verification').length,
    high: compliance.filter(c => c.priority === 'High' || c.priority === 'Critical').length,
  };

  const pendingActions = actions.filter(a => a.status === 'Pending').slice(0, 5);
  const unreadNotifs = notifications.filter(n => !n.read).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{t('dash_title')}</h1>
          <p className="text-surface-400 mt-1">{business.business_name} · {business.industry} · {business.state}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* License & Compliance Audit Document Generator Button */}
          <button
            onClick={() => setDossierOpen(true)}
            className="btn-secondary text-sm py-2 px-3.5 flex items-center gap-2 border-primary-500/30 text-primary-300 hover:text-white hover:bg-primary-500/10"
            title="Download full Certificate and License Dossier"
          >
            <Award className="w-4 h-4 text-primary-400" />
            <span>{t('dash_dossier_btn')}</span>
          </button>

          <Link to="/onboarding" className="btn-secondary text-sm py-2 px-3">Edit Profile</Link>
          <button onClick={handleDiscover} disabled={discovering} className="btn-primary text-sm py-2 px-3 flex items-center gap-2 shadow-lg shadow-primary-500/20">
            {discovering ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Discovering...</>
            ) : (
              <><Bot className="w-4 h-4" /> {t('action_discover')}</>
            )}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={ClipboardCheck} label={t('dash_total_req')} value={stats.total} color="primary" />
        <StatCard icon={AlertTriangle} label={t('dash_high_priority')} value={stats.high} color="orange" />
        <StatCard icon={Clock} label={t('dash_due_soon')} value={stats.dueSoon} color="amber" />
        <StatCard icon={AlertTriangle} label={t('dash_overdue')} value={stats.overdue} color="red" />
        <StatCard icon={CheckCircle2} label={t('dash_completed')} value={stats.completed} color="emerald" />
        <StatCard icon={Bell} label={t('dash_needs_review')} value={stats.needsReview} color="purple" />
      </div>

      {compliance.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Bot className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">{t('dash_ready_discover')}</h3>
          <p className="text-surface-400 mb-6 max-w-lg mx-auto">
            {t('dash_ready_discover_desc')}
          </p>
          <button onClick={handleDiscover} disabled={discovering} className="btn-primary inline-flex items-center gap-2">
            <Rocket className="w-4 h-4" /> {discovering ? t('agents_running') : t('dash_ready_discover_btn')}
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Compliance Items */}
        {compliance.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">{t('dash_recent_compliance')}</h2>
              <Link to="/compliance" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                {t('dash_view_all')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {compliance.slice(0, 5).map(c => (
                <Link key={c.id} to={`/compliance/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/60 transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate group-hover:text-white">{translateText(c.compliance_requirements?.name)}</p>
                    <p className="text-xs text-surface-500">{translateCategory(c.compliance_requirements?.category)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pending Actions */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">{t('dash_pending_actions')}</h2>
            <Link to="/calendar" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              {t('nav_calendar')} <CalendarDays className="w-3 h-3" />
            </Link>
          </div>
          {pendingActions.length > 0 ? (
            <div className="space-y-3">
              {pendingActions.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/40">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: a.priority === 'Critical' ? '#ef4444' : a.priority === 'High' ? '#f97316' : '#eab308' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200">{translateText(a.title)}</p>
                    {a.due_date && <p className="text-xs text-surface-500 mt-0.5">{t('comp_due_col')}: {new Date(a.due_date).toLocaleDateString()}</p>}
                  </div>
                  <PriorityBadge priority={a.priority} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-500 text-center py-8">{t('cal_empty')}</p>
          )}
        </div>
      </div>

      {/* Notifications */}
      {unreadNotifs.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">{t('dash_recent_notifs')}</h2>
            <Link to="/notifications" className="text-sm text-primary-400 hover:text-primary-300">{t('dash_view_all')}</Link>
          </div>
          <div className="space-y-2">
            {unreadNotifs.map(n => (
              <div key={n.id} className={`p-3 rounded-xl border ${n.severity === 'Critical' ? 'bg-red-500/10 border-red-500/20' : n.severity === 'Warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-surface-800/40 border-surface-700/30'}`}>
                <p className="text-sm font-medium text-surface-200">{translateText(n.title)}</p>
                <p className="text-xs text-surface-400 mt-1">{translateText(n.message)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Compliance & License Audit Dossier */}
      <ComplianceDossierModal
        isOpen={dossierOpen}
        onClose={() => setDossierOpen(false)}
        business={business}
        compliance={compliance}
        documents={documents}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-500/5 text-primary-400',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-400',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400',
    red: 'from-red-500/20 to-red-500/5 text-red-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-surface-400">{label}</span>
    </motion.div>
  );
}
