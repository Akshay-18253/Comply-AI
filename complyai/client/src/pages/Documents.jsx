import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Search, Filter, Trash2, Eye, Sparkles,
  AlertTriangle, CheckCircle2, Clock, Calendar, ArrowRight,
  ShieldAlert, RefreshCw, X, Award, Download
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingState, EmptyState, StatusBadge, ConfirmationModal } from '../components/shared/UIComponents';
import ComplianceDossierModal from '../components/shared/ComplianceDossierModal';
import toast from 'react-hot-toast';

const DOCUMENT_TYPES = [
  'Certificate of Incorporation',
  'GST Registration Certificate',
  'PAN Card',
  'MSME Udyam Registration',
  'Shop & Establishment License',
  'FSSAI Food License',
  'EPFO Registration Letter',
  'ESIC Registration Certificate',
  'Professional Tax Certificate',
  'Tax Payment Challan',
  'Board Resolution',
  'Annual Return Filing Receipt',
  'Other Statutory Document'
];

export default function Documents() {
  const { t, translateText } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0]);
  const [dragActive, setDragActive] = useState(false);
  const [business, setBusiness] = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [dossierOpen, setDossierOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const [docRes, bizRes, compRes] = await Promise.all([
        api.get('/documents'),
        api.get('/business'),
        api.get('/compliance'),
      ]);
      setDocuments(docRes.data.documents || []);
      setBusiness(bizRes.data.business || null);
      setCompliance(compRes.data.compliance || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds maximum size of 10MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', selectedType);

    try {
      toast('Uploading document securely to Supabase storage...', { icon: '📤' });
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded successfully!');
      
      const newDoc = res.data.document;
      setDocuments(prev => [newDoc, ...prev]);

      // Automatically trigger AI document intelligence
      runAnalysis(newDoc.id);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const runAnalysis = async (docId) => {
    setAnalyzingId(docId);
    toast('Running AI Document Intelligence agent...', { icon: '⚡' });
    try {
      const res = await api.post(`/documents/${docId}/analyze`);
      toast.success('Document analyzed by AI! Extracted statutory fields.');
      setDocuments(prev => prev.map(d => d.id === docId ? res.data.document : d));
    } catch (err) {
      console.error(err);
      toast.error('AI Document Analysis failed');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/documents/${deleteModal.id}`);
      setDocuments(prev => prev.filter(d => d.id !== deleteModal.id));
      toast.success('Document deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document');
    } finally {
      setDeleteModal({ open: false, id: null, title: '' });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = (doc.file_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (doc.document_type || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const expiringCount = documents.filter(doc => {
    if (!doc.expiry_date) return false;
    const days = Math.ceil((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30;
  }).length;

  if (loading) return <LoadingState message="Loading documents and statutory certificates..." />;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-400" />
            Document Intelligence & Vault
          </h1>
          <p className="text-surface-400 mt-1">
            Store, verify, and automatically extract regulatory metadata, validity dates, and registration numbers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDossierOpen(true)}
            className="btn-secondary text-sm py-2 px-3 flex items-center gap-2 border-primary-500/30 text-primary-300 hover:text-white"
            title="Download full Certificate and License Dossier"
          >
            <Award className="w-4 h-4 text-primary-400" />
            <span>Export License Dossier</span>
          </button>
          <button
            onClick={loadDocuments}
            className="btn-secondary text-sm py-2 px-3 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center text-primary-400 font-bold">
            {documents.length}
          </div>
          <div>
            <div className="text-xs text-surface-400">Total Vaulted</div>
            <div className="text-sm font-semibold text-surface-200">Documents</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold">
            {documents.filter(d => d.analysis).length}
          </div>
          <div>
            <div className="text-xs text-surface-400">AI Analyzed</div>
            <div className="text-sm font-semibold text-surface-200">Extracted</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold">
            {expiringCount}
          </div>
          <div>
            <div className="text-xs text-surface-400">Expiring Soon</div>
            <div className="text-sm font-semibold text-surface-200">Needs Renewal</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 font-bold">
            {documents.filter(d => d.verification_status === 'Verified').length}
          </div>
          <div>
            <div className="text-xs text-surface-400">Verified</div>
            <div className="text-sm font-semibold text-surface-200">Compliant</div>
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glass-card p-6 border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? 'border-primary-400 bg-primary-950/20 scale-[1.01]'
            : 'border-surface-700/80 hover:border-surface-600'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Compliance Document</h3>
              <p className="text-xs text-surface-400 mt-1 max-w-lg">
                Drag and drop PDF or image files (Max 10MB). ComplyAI automatically extracts registration IDs, validity, and links to legal requirements.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field text-xs py-2 bg-surface-900 w-full sm:w-auto"
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Select File
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search documents by name or classification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-full"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field text-xs py-2 bg-surface-900 md:w-60"
        >
          <option value="All">All Classifications</option>
          {DOCUMENT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={documents.length === 0 ? t('docs_empty_title') : t('docs_empty_search')}
          description={
            documents.length === 0
              ? t('docs_empty_desc')
              : t('action_clear_filters')
          }
          action={
            documents.length === 0 ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary mt-4 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> {t('docs_upload_first')}
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map(doc => {
            const hasAnalysis = Boolean(doc.analysis);
            const isAnalyzing = analyzingId === doc.id;
            const daysLeft = doc.expiry_date
              ? Math.ceil((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5 flex flex-col justify-between hover:border-primary-500/40 transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-md border border-primary-500/20 truncate max-w-[200px]">
                      {translateText(doc.document_type || 'Unclassified')}
                    </span>
                    <StatusBadge status={doc.verification_status || 'Pending'} />
                  </div>

                  <div>
                    <Link
                      to={`/documents/${doc.id}`}
                      className="text-base font-bold text-surface-100 hover:text-primary-400 transition-colors line-clamp-1 group-hover:text-primary-300"
                    >
                      {doc.file_name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-surface-500 mt-1">
                      <span>{formatSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* AI Analysis Excerpt */}
                  {hasAnalysis && (
                    <div className="p-2.5 rounded-lg bg-surface-900/80 border border-surface-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-surface-400">
                        <span className="flex items-center gap-1 text-primary-400 font-medium">
                          <Sparkles className="w-3 h-3" /> AI Extracted
                        </span>
                        {doc.analysis.confidence && (
                          <span className="text-[10px] text-surface-500">
                            {Math.round(doc.analysis.confidence * 100)}% match
                          </span>
                        )}
                      </div>
                      {doc.analysis.document_number && (
                        <div className="text-surface-300 font-mono truncate">
                          ID: <span className="text-white">{doc.analysis.document_number}</span>
                        </div>
                      )}
                      {doc.analysis.issuing_authority && (
                        <div className="text-surface-400 truncate">
                          Auth: {doc.analysis.issuing_authority}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Validity / Expiry Warning */}
                  {doc.expiry_date && (
                    <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                      daysLeft <= 0
                        ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                        : daysLeft <= 30
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'bg-surface-800/60 text-surface-400'
                    }`}>
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {daysLeft <= 0
                          ? `Expired on ${new Date(doc.expiry_date).toLocaleDateString()}`
                          : `Expires in ${daysLeft} days (${new Date(doc.expiry_date).toLocaleDateString()})`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-4 border-t border-surface-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runAnalysis(doc.id)}
                      disabled={isAnalyzing}
                      className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 text-primary-300 hover:text-white"
                      title="Run AI extraction"
                    >
                      {isAnalyzing ? (
                        <>
                          <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          Analyzing
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-primary-400" />
                          {hasAnalysis ? 'Re-analyze' : 'Analyze'}
                        </>
                      )}
                    </button>
                    <Link
                      to={`/documents/${doc.id}`}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                      title="Inspect details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>

                  <button
                    onClick={() => setDeleteModal({ open: true, id: doc.id, title: doc.file_name })}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.open}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteModal.title}"? This will remove the file from storage and clear its extracted compliance metadata.`}
        confirmText="Delete File"
        danger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, title: '' })}
      />

      {/* Compliance & License Audit Dossier Modal */}
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
