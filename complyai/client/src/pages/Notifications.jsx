import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle2, AlertTriangle, ShieldAlert, Info, Clock,
  CheckCheck, ArrowRight, Filter, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { LoadingState, EmptyState } from '../components/shared/UIComponents';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterRead, setFilterRead] = useState('All');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => api.patch(`/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Marked all notifications as read');
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifs = notifications.filter(n => {
    const matchesSeverity = filterSeverity === 'All' || n.severity === filterSeverity;
    const matchesRead = filterRead === 'All' || (filterRead === 'Unread' ? !n.read : n.read);
    return matchesSeverity && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <LoadingState message={t('notif_subtitle')} />;

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-400" />
            {t('notif_title')}
            {unreadCount > 0 && (
              <span className="text-xs bg-primary-500 text-white font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} {t('notif_unread')}
              </span>
            )}
          </h1>
          <p className="text-surface-400 mt-1">
            {t('notif_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadNotifications}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title={t('action_refresh')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary text-xs py-2 px-3 text-primary-300 hover:text-white flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> {t('notif_mark_all')}
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="glass-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-surface-400">{t('comp_status_col')}:</span>
          {['All', 'Unread', 'Read'].map(st => (
            <button
              key={st}
              onClick={() => setFilterRead(st)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterRead === st ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-surface-400 hover:text-white'
              }`}
            >
              {st === 'All' ? t('comp_all_statuses') : st === 'Unread' ? t('notif_unread') : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-surface-400">{t('comp_prio_col')}:</span>
          {['All', 'Critical', 'Warning', 'Info'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterSeverity === sev ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-surface-400 hover:text-white'
              }`}
            >
              {sev === 'All' ? t('comp_all_priorities') : sev === 'Critical' ? t('priority_critical') : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t('notif_title')}
          description={t('notif_subtitle')}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map(n => {
            const isCritical = n.severity === 'Critical';
            const isWarning = n.severity === 'Warning';
            
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-4 transition-all duration-200 border-l-4 ${
                  !n.read ? 'bg-surface-800/40' : 'opacity-75'
                } ${
                  isCritical
                    ? 'border-l-red-500 border-red-500/20'
                    : isWarning
                    ? 'border-l-amber-500 border-amber-500/20'
                    : 'border-l-primary-500 border-primary-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCritical
                        ? 'bg-red-500/20 text-red-400'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-primary-500/20 text-primary-400'
                    }`}>
                      {isCritical ? <ShieldAlert className="w-4 h-4" /> : isWarning ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-surface-300'}`}>
                          {n.title}
                        </h3>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-400" />
                        )}
                      </div>
                      <p className="text-xs text-surface-300 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-surface-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                        {n.type && (
                          <span className="uppercase text-[10px] tracking-wider text-surface-400">
                            • {n.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action link depending on type */}
                    {n.type === 'document_expiry' ? (
                      <Link
                        to="/documents"
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 whitespace-nowrap p-1"
                      >
                        Vault <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <Link
                        to="/compliance"
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 whitespace-nowrap p-1"
                      >
                        Compliance <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}

                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-xs text-surface-400 hover:text-white p-1"
                        title="Mark read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
