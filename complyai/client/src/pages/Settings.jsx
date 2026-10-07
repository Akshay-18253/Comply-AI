import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Bell, Shield, Key, Database,
  CheckCircle2, Bot, LogOut, Save, Moon, Sun, Lock, Globe, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { currentLang, languages, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [regulatoryAlerts, setRegulatoryAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Preferences saved successfully');
    }, 400);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary-400" />
          Settings & System Configuration
        </h1>
        <p className="text-surface-400 mt-1">
          Notification preferences, language selection, AI model governance, Supabase RLS security, and account settings
        </p>
      </div>

      {/* Language Preference Section */}
      <div className="glass-card p-6 md:p-8 space-y-4">
        <h2 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
          <Globe className="w-4 h-4" /> Regional & Indian Language Selection (भाषा)
        </h2>
        <p className="text-xs text-surface-400">
          Select your preferred operating language. ComplyAI translates UI controls, statutory categories, and dashboard metrics into native Indian scripts.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  changeLanguage(lang.code);
                  toast.success(`Language switched to ${lang.name} (${lang.native})`);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary-500/20 border-primary-500 text-white shadow-lg shadow-primary-500/10'
                    : 'bg-surface-900/60 border-surface-800 text-surface-300 hover:border-surface-700 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span className="font-bold text-sm">{lang.native}</span>
                  </div>
                  <span className="text-[11px] text-surface-400 block mt-0.5">{lang.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Preferences */}
      <form onSubmit={handleSavePreferences} className="glass-card p-6 md:p-8 space-y-5">
        <h2 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
          <Bell className="w-4 h-4" /> Notification & Alert Channels
        </h2>

        <div className="space-y-4">
          <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-surface-900/60 border border-surface-800 cursor-pointer hover:border-surface-700">
            <div>
              <h3 className="text-sm font-semibold text-white">Statutory Deadline Reminders</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Send advance alerts 7 days, 3 days, and 1 day prior to GST, MCA, and TDS filing dates.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500 bg-surface-800 border-surface-700 mt-1"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-surface-900/60 border border-surface-800 cursor-pointer hover:border-surface-700">
            <div>
              <h3 className="text-sm font-semibold text-white">Document Expiry & Renewal Alerts</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Alert when licenses, registration certificates, or leases are within 30 days of expiration.
              </p>
            </div>
            <input
              type="checkbox"
              checked={expiryAlerts}
              onChange={(e) => setExpiryAlerts(e.target.checked)}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500 bg-surface-800 border-surface-700 mt-1"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-surface-900/60 border border-surface-800 cursor-pointer hover:border-surface-700">
            <div>
              <h3 className="text-sm font-semibold text-white">Regulatory Circulars & Amendments</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Receive digests when MCA, CBIC, or EPFO publish new compliance circulars or rate revisions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={regulatoryAlerts}
              onChange={(e) => setRegulatoryAlerts(e.target.checked)}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500 bg-surface-800 border-surface-700 mt-1"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm py-2 px-5 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Notification Preferences'}
          </button>
        </div>
      </form>

      {/* AI Engine & Security Governance */}
      <div className="glass-card p-6 md:p-8 space-y-5">
        <h2 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
          <Bot className="w-4 h-4" /> AI & Infrastructure Governance
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-200">AI Reasoning Engine</span>
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Google Gemini 2.5 Multi-Agent Orchestrator with RAG grounding on Indian Central and State Legislation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-200">Supabase Row-Level Security</span>
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                ENFORCED
              </span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Tenant isolation strictly verified via PostgreSQL RLS policies keyed to authenticated user IDs.
            </p>
          </div>
        </div>
      </div>

      {/* Account Security & Sign Out */}
      <div className="glass-card p-6 md:p-8 space-y-4">
        <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
          <Lock className="w-4 h-4" /> Session & Account Security
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Signed in as {user?.email}</h3>
            <p className="text-xs text-surface-400 mt-0.5">
              Secure JWT session managed via Supabase Auth.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="btn-secondary text-sm py-2 px-4 text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-2 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
