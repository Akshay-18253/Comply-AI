import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, ExternalLink, ShieldCheck, Search, Filter,
  Building2, CheckCircle2, Clock, BookOpen, AlertCircle, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { LoadingState, EmptyState, StatusBadge } from '../components/shared/UIComponents';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Sources() {
  const { t, translateText, translateCategory } = useLanguage();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const res = await api.get('/sources');
      setSources(res.data.sources || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load regulatory sources');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(sources.map(s => s.category).filter(Boolean))];

  const filteredSources = sources.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.authority || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.domain || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingState message={t('src_subtitle')} />;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary-400" />
            {t('src_title')}
          </h1>
          <p className="text-surface-400 mt-1">
            {t('src_subtitle')}
          </p>
        </div>

        <button
          onClick={loadSources}
          className="btn-secondary text-sm py-2 px-3 flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> {t('action_refresh')}
        </button>
      </div>

      {/* Trust & Verification Banner */}
      <div className="glass-card p-6 border-primary-500/30 bg-gradient-to-r from-primary-950/40 via-surface-900 to-accent-950/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {t('src_zero_hallucination_title')}
            </h2>
            <p className="text-xs text-surface-300 mt-1 leading-relaxed max-w-3xl">
              {t('src_zero_hallucination_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={t('src_search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-full"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field text-xs py-2 bg-surface-900 md:w-56"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? t('src_all_authorities') : translateCategory(cat)}</option>
          ))}
        </select>
      </div>

      {/* Sources Grid */}
      {filteredSources.length === 0 ? (
        <EmptyState
          icon={Globe}
          title={t('src_title')}
          description={t('src_subtitle')}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSources.map(source => (
            <motion.div
              key={source.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-5 flex flex-col justify-between hover:border-primary-500/40 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-md border border-primary-500/20">
                    {translateCategory(source.category || 'Statutory Source')}
                  </span>
                  <StatusBadge status={source.status || 'Active'} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    {translateText(source.name)}
                  </h3>
                  <p className="text-xs text-surface-400 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-surface-500" />
                    <span>{translateText(source.authority)}</span>
                  </p>
                </div>

                {source.domain && (
                  <p className="text-xs text-surface-400 font-mono bg-surface-900/60 p-2 rounded-lg border border-surface-800">
                    Domain: {source.domain}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-surface-800 flex items-center justify-between">
                <div className="text-[11px] text-surface-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{t('src_verified')}: {source.last_verified_at ? new Date(source.last_verified_at).toLocaleDateString() : 'Current'}</span>
                </div>

                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 text-primary-300 hover:text-white"
                  >
                    {t('src_portal_btn')} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
