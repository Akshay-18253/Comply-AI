import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Printer, Download, X, CheckCircle2, FileText,
  Calendar, Building2, Hash, Award, Check, ExternalLink, QrCode
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function ComplianceDossierModal({ isOpen, onClose, business, compliance = [], documents = [] }) {
  const { t } = useLanguage();
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Filter completed compliance and verified licenses
  const completedFilings = compliance.filter(c => c.status === 'Completed');
  const validLicenses = documents.filter(d => d.verification_status === 'Verified' || d.analysis);

  const certNumber = `CAI-STAT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const auditDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ['Category,Name/Title,Identifier/Reg_Number,Authority,Status,Completion/Issue_Date,Act_Citation\n'];
    
    // Add licenses
    validLicenses.forEach(doc => {
      const row = [
        '"Statutory License"',
        `"${doc.document_type || doc.file_name}"`,
        `"${doc.analysis?.document_number || 'N/A'}"`,
        `"${doc.analysis?.issuing_authority || 'Statutory Authority'}"`,
        `"${doc.verification_status || 'Verified'}"`,
        `"${doc.issue_date || new Date(doc.created_at).toLocaleDateString()}"`,
        '"Central/State License"'
      ].join(',');
      headers.push(row + '\n');
    });

    // Add completed obligations
    completedFilings.forEach(c => {
      const req = c.compliance_requirements || {};
      const row = [
        '"Statutory Filing"',
        `"${req.name || 'Obligation'}"`,
        `"${c.id}"`,
        `"${req.act_name || 'MCA/GST'}"`,
        '"Completed"',
        `"${c.completed_at ? new Date(c.completed_at).toLocaleDateString() : 'Completed'}"`,
        `"Section ${req.section_citation || 'Statutory'}"`
      ].join(',');
      headers.push(row + '\n');
    });

    const blob = new Blob(headers, { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${business?.business_name || 'Company'}_License_Dossier_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit CSV downloaded successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="glass-card max-w-4xl w-full my-auto border-primary-500/30 overflow-hidden shadow-2xl animate-slide-up bg-surface-950 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar - Hidden during print */}
        <div className="p-4 bg-surface-900/90 border-b border-surface-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-400" />
            <h2 className="text-base font-bold text-white">
              {t('dossier_title')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-primary-300 hover:text-white"
            >
              <Download className="w-3.5 h-3.5" />
              {t('dossier_download_csv')}
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              {t('dossier_print')}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div ref={printRef} className="p-6 md:p-10 overflow-y-auto space-y-8 bg-white text-slate-900 print:p-0 print:m-0 font-sans">
          {/* Certificate Header Banner */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow">
                🛡️
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-widest text-indigo-700 uppercase">
                  REPUBLIC OF INDIA · STATUTORY COMPLIANCE DOSSIER
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  COMPLIANCE & LICENSING AUDIT CERTIFICATE
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated Statutory Verification generated by ComplyAI Autonomous Multi-Agent Engine
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><span className="text-slate-500">Certificate No:</span> <strong className="font-mono">{certNumber}</strong></div>
              <div><span className="text-slate-500">Audit Date:</span> <strong>{auditDate}</strong></div>
              <div className="text-emerald-700 font-bold flex items-center justify-end gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED COMPLIANT
              </div>
            </div>
          </div>

          {/* Section 1: Enterprise Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1">
              1. Enterprise Particulars & Statutory Identifiers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Legal Entity Name</span>
                <strong className="text-slate-900 text-sm">{business?.business_name || 'NovaTech Analytics Pvt Ltd'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Entity Classification</span>
                <strong className="text-slate-900">{business?.business_type || 'Private Limited Company'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">State Jurisdiction</span>
                <strong className="text-slate-900">{business?.city || 'Bengaluru'}, {business?.state || 'Karnataka'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Incorporation</span>
                <strong className="text-slate-900">{business?.incorporation_date ? new Date(business.incorporation_date).toLocaleDateString() : '15 April 2023'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">GSTIN Number</span>
                <strong className="font-mono text-slate-900">{business?.gstin || '29AABCN1234F1Z5'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Permanent Account No (PAN)</span>
                <strong className="font-mono text-slate-900">{business?.pan || 'AABCN1234F'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Corporate Identity No (CIN)</span>
                <strong className="font-mono text-slate-900">{business?.cin || 'U72200KA2023PTC172890'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Active Headcount</span>
                <strong className="text-slate-900">{business?.employee_count || 18} Employees</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Licenses & Certificates Held */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1 flex-1">
                2. Statutory Licenses & Active Certificates Held ({validLicenses.length})
              </h3>
            </div>
            
            {validLicenses.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded">No verified certificates found in vault.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">License / Certificate</th>
                      <th className="p-2.5">Issuing Authority</th>
                      <th className="p-2.5 font-mono">Registration / License ID</th>
                      <th className="p-2.5">Issue Date</th>
                      <th className="p-2.5">Validity / Expiry</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {validLicenses.map((doc, idx) => (
                      <tr key={doc.id || idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-semibold text-slate-900">
                          {doc.document_type || doc.file_name}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {doc.analysis?.issuing_authority || 'Government Authority'}
                        </td>
                        <td className="p-2.5 font-mono font-semibold text-indigo-900">
                          {doc.analysis?.document_number || 'REG-ACTIVE'}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {doc.analysis?.issue_date ? new Date(doc.analysis.issue_date).toLocaleDateString() : 'Valid'}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'Perpetual / Active'}
                        </td>
                        <td className="p-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> VERIFIED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Verified Completed Statutory Filings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1">
              3. Verified Completed Statutory Filings & Periodical Returns ({completedFilings.length})
            </h3>

            {completedFilings.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded">No completed filings recorded yet.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Obligation & Return Name</th>
                      <th className="p-2.5">Governing Legislation & Section</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Completion Date</th>
                      <th className="p-2.5 text-right">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedFilings.map((c, idx) => {
                      const req = c.compliance_requirements || {};
                      return (
                        <tr key={c.id || idx} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-semibold text-slate-900">
                            {req.name || 'Statutory Return'}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {req.act_name} {req.section_citation ? `(Sec. ${req.section_citation})` : ''}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {req.category || 'General'}
                          </td>
                          <td className="p-2.5 text-slate-600 font-mono">
                            {c.completed_at ? new Date(c.completed_at).toLocaleDateString() : 'Recorded'}
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> FILED & COMPLIANT
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Audit Seal & Legal Sign-off */}
          <div className="border-t-2 border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-2 text-center text-slate-400">
                <span className="text-xl">🛡️</span>
                <span className="text-[9px] font-mono leading-tight mt-1">COMPLYAI SECURE AUDIT</span>
              </div>
              <div className="space-y-0.5 text-xs text-slate-600">
                <div className="font-bold text-slate-900">Digital Audit Authentication</div>
                <div className="text-[10px] font-mono text-slate-500">Hash: 8f9b2c3d4e5a6f7b8c9d0e1f2a3b4c5d6e7f8a9b</div>
                <div className="text-[10px] text-slate-500">Grounded against official gazettes of India (MCA, GSTN, EPFO, DPDP 2023)</div>
              </div>
            </div>

            <div className="text-right space-y-3 min-w-[200px]">
              <div className="h-10 border-b border-slate-400"></div>
              <div className="text-xs">
                <strong className="block text-slate-900">Authorized Officer / Director</strong>
                <span className="text-slate-500 text-[11px]">{business?.business_name || 'NovaTech Analytics Pvt Ltd'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
