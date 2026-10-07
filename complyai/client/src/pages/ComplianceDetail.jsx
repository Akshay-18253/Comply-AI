import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ClipboardCheck, Calendar, ShieldAlert, FileText, CheckCircle2,
  ExternalLink, Clock, Bot, AlertTriangle, Save, Upload, Info, Scale
} from 'lucide-react';
import api from '../services/api';
import { LoadingState, StatusBadge, PriorityBadge, ConfidenceMeter } from '../components/shared/UIComponents';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function ComplianceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, translateText, translateCategory } = useLanguage();
  const [data, setData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const res = await api.get(`/compliance/${id}`);
      setData(res.data.compliance);
      setDocuments(res.data.documents || []);
      setStatus(res.data.compliance.status || 'Not Started');
      setDueDate(res.data.compliance.due_date ? res.data.compliance.due_date.split('T')[0] : '');
      setNotes(res.data.compliance.notes || '');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load compliance details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/compliance/${id}`, {
        status,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        notes,
      });
      setData(res.data.compliance);
      toast.success('Compliance obligation updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCompleted = async () => {
    setSaving(true);
    try {
      const res = await api.post(`/compliance/${id}/complete`);
      setData(res.data.compliance);
      setStatus('Completed');
      toast.success('Marked obligation as completed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete obligation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading obligation details and statutory citations..." />;
  if (!data) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-surface-200">Obligation not found</h2>
      <Link to="/compliance" className="btn-secondary mt-4 inline-block">{t('action_details')}</Link>
    </div>
  );

  const req = data.compliance_requirements || {};
  const source = req.sources;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Back button & top navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/compliance"
          className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ← {t('comp_title')}
        </Link>
        <div className="flex items-center gap-3">
          {status !== 'Completed' && (
            <button
              onClick={handleMarkCompleted}
              disabled={saving}
              className="btn-secondary text-sm py-2 px-3 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('action_complete')}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <Save className="w-4 h-4" />
            {saving ? '...' : t('action_save')}
          </button>
        </div>
      </div>

      {/* Main header block */}
      <div className="glass-card p-6 md:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-400 bg-primary-500/15 px-3 py-1 rounded-md border border-primary-500/20">
            {req.category || 'Statutory Compliance'}
          </span>
          <PriorityBadge priority={data.priority} />
          <StatusBadge status={data.status} />
          {req.frequency && (
            <span className="text-xs text-surface-400 bg-surface-800/80 px-2.5 py-1 rounded border border-surface-700">
              Periodicity: {req.frequency}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            {translateText(req.name)}
          </h1>
          {req.act_name && (
            <p className="text-sm md:text-base text-primary-300 mt-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <span>{translateText(req.act_name)}</span>
              {req.section_citation && (
                <span className="text-surface-400 font-mono">· {t('comp_sec') || 'Sec.'} {req.section_citation}</span>
              )}
            </p>
          )}
        </div>

        <p className="text-sm text-surface-300 leading-relaxed max-w-4xl">
          {translateText(req.description)}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Reasoning, Penalties & Law Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Applicability Analysis */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary-400" />
              AI Applicability Analysis
            </h2>
            <div className="bg-surface-900/60 rounded-xl p-4 border border-surface-800/80 space-y-3">
              <p className="text-sm text-surface-200 leading-relaxed">
                {translateText(data.applicability_reason) || 'Identified as legally applicable based on entity structure, state jurisdiction, and business sector.'}
              </p>

              {data.confidence_score !== undefined && (
                <div className="pt-3 border-t border-surface-800 flex items-center justify-between">
                  <span className="text-xs text-surface-400">{t('comp_reasoning_conf')}</span>
                  <div className="flex items-center gap-3">
                    <ConfidenceMeter value={data.confidence_score} />
                    <span className="text-xs font-semibold text-surface-200">
                      {Math.round(data.confidence_score * 100)}% {t('status_verified')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Non-Compliance & Penalty Consequences */}
          {(req.penalty_description || req.penalty_amount || req.imprisonment_risk) && (
            <div className="glass-card p-6 space-y-4 border-red-500/20 bg-red-950/10">
              <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                Statutory Penalties & Non-Compliance Risks
              </h2>
              <div className="space-y-3">
                {req.penalty_description && (
                  <p className="text-sm text-surface-300">
                    {translateText(req.penalty_description)}
                  </p>
                )}
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {req.penalty_amount && (
                    <div className="p-3 rounded-lg bg-surface-900/80 border border-red-500/20">
                      <div className="text-xs text-surface-400">Monetary Fine / Penalty</div>
                      <div className="text-sm font-bold text-red-400 mt-1">{req.penalty_amount}</div>
                    </div>
                  )}
                  {req.imprisonment_risk && (
                    <div className="p-3 rounded-lg bg-surface-900/80 border border-red-500/20">
                      <div className="text-xs text-surface-400">Prosecution / Director Liability</div>
                      <div className="text-sm font-bold text-red-400 mt-1">Imprisonment / Penal Liability Applicable</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Statutory Source Reference */}
          {source && (
            <div className="glass-card p-6 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-accent-400" />
                Regulatory Authority & Primary Source
              </h2>
              <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-surface-200">{source.name}</span>
                  <span className="text-xs text-surface-400 bg-surface-800 px-2 py-0.5 rounded">{source.authority}</span>
                </div>
                {source.domain && <p className="text-xs text-surface-400">Domain: {source.domain}</p>}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 mt-2"
                  >
                    Visit Official Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Linked Documents */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" />
                {t('nav_documents')}
              </h2>
              <Link to="/documents" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> {t('action_upload')}
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-surface-800 rounded-xl">
                <FileText className="w-8 h-8 text-surface-600 mx-auto mb-2" />
                <p className="text-xs text-surface-400">{t('docs_upload_sub')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map(d => (
                  <Link
                    key={d.id}
                    to={`/documents/${d.documents?.id || d.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-all border border-surface-700/40"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-primary-400" />
                      <div>
                        <div className="text-xs font-semibold text-surface-200">{d.documents?.file_name || 'Document'}</div>
                        <div className="text-[11px] text-surface-500">{d.documents?.document_type || 'Compliance filing'}</div>
                      </div>
                    </div>
                    <span className="text-xs text-surface-400 hover:text-white">{t('action_details')}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Management & Status Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-base font-bold text-white border-b border-surface-700/50 pb-3">
              {t('comp_status_col')}
            </h2>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-300">{t('comp_status_col')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field text-sm"
              >
                <option value="Not Started">{t('status_not_started')}</option>
                <option value="In Progress">{t('status_in_progress')}</option>
                <option value="Documents Pending">{t('status_documents_pending')}</option>
                <option value="Ready to File">{t('status_ready_to_file')}</option>
                <option value="Completed">{t('status_completed')}</option>
                <option value="Overdue">{t('status_overdue')}</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-300">{t('comp_due_col')}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            {/* Notes / Internal Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-300">Internal Audit Notes</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add compliance notes, filing ARN numbers, payment challan references..."
                className="input-field text-sm resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? '...' : t('action_save')}
            </button>
          </div>

          {/* Quick AI Assistant Card */}
          <div className="glass-card p-5 space-y-3 bg-gradient-to-br from-primary-950/40 to-surface-900 border-primary-500/20">
            <div className="flex items-center gap-2 text-primary-400 font-semibold text-sm">
              <Bot className="w-4 h-4" />
              {t('asst_title')}
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              {t('asst_subtitle')}
            </p>
            <Link
              to="/assistant"
              className="btn-secondary text-xs w-full py-2 text-center block text-primary-300 hover:text-white"
            >
              {t('action_ask_copilot')} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
