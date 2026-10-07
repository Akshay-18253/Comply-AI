import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Calendar, Sparkles, CheckCircle2,
  AlertTriangle, Clock, Trash2, ShieldCheck, Download,
  ExternalLink, Building2, Hash, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { LoadingState, StatusBadge, ConfidenceMeter, ConfirmationModal } from '../components/shared/UIComponents';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    loadDoc();
  }, [id]);

  const loadDoc = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      setDoc(res.data.document);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    toast('Running AI Document Intelligence agent...', { icon: '🤖' });
    try {
      const res = await api.post(`/documents/${id}/analyze`);
      setDoc(res.data.document);
      toast.success('Document analysis completed!');
    } catch (err) {
      console.error(err);
      toast.error('AI Document analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document removed');
      navigate('/documents');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document');
    }
  };

  if (loading) return <LoadingState message="Fetching document metadata and AI extraction..." />;
  if (!doc) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-surface-200">Document not found</h2>
      <Link to="/documents" className="btn-secondary mt-4 inline-block">{t('action_details')}</Link>
    </div>
  );

  const analysis = doc.analysis || {};
  const daysLeft = doc.expiry_date
    ? Math.ceil((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ← {t('nav_documents')}
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="btn-secondary text-sm py-2 px-3 flex items-center gap-2 text-primary-300"
          >
            {analyzing ? (
              <>
                <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                ...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-primary-400" />
                {t('docs_reanalyze_btn')}
              </>
            )}
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="btn-secondary text-sm py-2 px-3 text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> {t('action_delete')}
          </button>
        </div>
      </div>

      {/* Main Document Overview Card */}
      <div className="glass-card p-6 md:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-400 bg-primary-500/15 px-3 py-1 rounded-md border border-primary-500/20">
            {doc.document_type || 'Unclassified Document'}
          </span>
          <StatusBadge status={doc.verification_status || 'Pending'} />
          <span className="text-xs text-surface-400 bg-surface-800/80 px-2.5 py-1 rounded border border-surface-700">
            MIME: {doc.mime_type}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-display">
              {doc.file_name}
            </h1>
            <p className="text-xs text-surface-400 mt-1">
              Uploaded on {new Date(doc.created_at).toLocaleString()} · Size: {Math.round(doc.file_size / 1024)} KB
            </p>
          </div>
        </div>

        {/* Expiry / Validity Alert */}
        {doc.expiry_date && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            daysLeft <= 0
              ? 'bg-red-500/15 border-red-500/30 text-red-300'
              : daysLeft <= 30
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}>
            <Clock className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">
                {daysLeft <= 0 ? 'Document Expired' : daysLeft <= 30 ? 'Expiring Soon' : 'Active & Valid'}
              </span>
              <p className="text-xs opacity-90 mt-0.5">
                Statutory expiry date: {new Date(doc.expiry_date).toLocaleDateString()}
                {daysLeft > 0 ? ` (${daysLeft} days remaining)` : ' — renewal action required.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Extracted Metadata & OCR Text */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Intelligence Extraction */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              AI Extracted Statutory Metadata
            </h2>

            {Object.keys(analysis).length === 0 ? (
              <div className="text-center py-8 border border-dashed border-surface-800 rounded-xl space-y-3">
                <Sparkles className="w-8 h-8 text-surface-600 mx-auto" />
                <p className="text-sm text-surface-400">No AI analysis generated yet for this file.</p>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
                >
                  Run AI Extraction Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
                    <span className="text-xs text-surface-400 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-primary-400" /> Identifier / Number
                    </span>
                    <p className="text-sm font-semibold text-white mt-1 font-mono">
                      {analysis.document_number || 'Not detected'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
                    <span className="text-xs text-surface-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary-400" /> Issuing Authority
                    </span>
                    <p className="text-sm font-semibold text-white mt-1">
                      {analysis.issuing_authority || 'Not detected'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
                    <span className="text-xs text-surface-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-400" /> Issue Date
                    </span>
                    <p className="text-sm font-semibold text-white mt-1">
                      {analysis.issue_date ? new Date(analysis.issue_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
                    <span className="text-xs text-surface-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary-400" /> Expiry Date
                    </span>
                    <p className="text-sm font-semibold text-white mt-1">
                      {analysis.expiry_date ? new Date(analysis.expiry_date).toLocaleDateString() : 'Perpetual / Indefinite'}
                    </p>
                  </div>
                </div>

                {analysis.summary && (
                  <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
                    <span className="text-xs text-surface-400">Analysis Summary</span>
                    <p className="text-sm text-surface-300 mt-1 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                {analysis.confidence !== undefined && (
                  <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800 flex items-center justify-between">
                    <span className="text-xs text-surface-400">Confidence Score</span>
                    <div className="flex items-center gap-3">
                      <ConfidenceMeter value={analysis.confidence} />
                      <span className="text-xs font-semibold text-surface-200">
                        {Math.round(analysis.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Extracted Text Content / Preview */}
          <div className="glass-card p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-surface-400" />
              Extracted Text / OCR Output
            </h2>
            <div className="bg-surface-950/80 rounded-xl p-4 border border-surface-800 font-mono text-xs text-surface-300 max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {doc.extracted_text || 'No text extracted from this file.'}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Actions & Linkages */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-surface-700/50 pb-3">
              Storage Details
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-surface-400">Storage Path</span>
                <p className="text-surface-200 font-mono mt-0.5 break-all">{doc.storage_path}</p>
              </div>
              <div>
                <span className="text-surface-400">Classification</span>
                <p className="text-surface-200 font-semibold mt-0.5">{doc.document_type || 'Unclassified'}</p>
              </div>
              <div>
                <span className="text-surface-400">Verification Status</span>
                <div className="mt-1">
                  <StatusBadge status={doc.verification_status || 'Pending'} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick links to compliance */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Compliance Linkage
            </h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              This document serves as proof of compliance for applicable Indian regulatory mandates.
            </p>
            <Link
              to="/compliance"
              className="btn-secondary text-xs w-full py-2 text-center block text-primary-300"
            >
              View Compliance Obligations →
            </Link>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        title="Delete Document"
        message={`Are you sure you want to delete ${doc.file_name}? This action cannot be undone.`}
        confirmText="Delete"
        danger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </div>
  );
}
