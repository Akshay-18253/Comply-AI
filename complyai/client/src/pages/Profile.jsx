import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Building2, MapPin, Users, DollarSign, Shield,
  Save, CheckCircle2, Bot, ArrowRight, RefreshCw, FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/shared/UIComponents';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const { t, translateText } = useLanguage();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const res = await api.get('/business');
      if (res.data.business) {
        setBusiness(res.data.business);
        setFormData(res.data.business);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/business', {
        ...formData,
        employee_count: parseInt(formData.employee_count, 10) || 1,
      });
      setBusiness(res.data.business);
      toast.success('Business profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message={t('dossier_company_details')} />;

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary-400" />
            {t('nav_profile')}
          </h1>
          <p className="text-surface-400 mt-1">
            {t('dossier_company_details')}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm py-2 px-4 flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-primary-500/20"
        >
          <Save className="w-4 h-4" />
          {saving ? '...' : t('action_save')}
        </button>
      </div>

      {/* Account Info Box */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
          {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">
            {user?.user_metadata?.full_name || 'Account Admin'}
          </h3>
          <p className="text-xs text-surface-400">
            {user?.email} · {t('status_verified')}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="glass-card p-6 md:p-8 space-y-6">
        {/* Section 1: Entity Structure */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
            <Building2 className="w-4 h-4" /> {t('dossier_company_details')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_legal_name')}</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name || ''}
                onChange={handleChange}
                className="input-field text-sm mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_entity_type')}</label>
              <select
                name="business_type"
                value={formData.business_type || 'Private Limited Company'}
                onChange={handleChange}
                className="input-field text-sm mt-1"
              >
                <option value="Private Limited Company">{translateText('Private Limited Company (Pvt Ltd)')}</option>
                <option value="Limited Liability Partnership">{translateText('Limited Liability Partnership (LLP)')}</option>
                <option value="One Person Company">{translateText('One Person Company (OPC)')}</option>
                <option value="Sole Proprietorship">{translateText('Sole Proprietorship')}</option>
                <option value="Partnership Firm">{translateText('Partnership Firm')}</option>
                <option value="Public Limited Company">{translateText('Public Limited Company')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_industry')}</label>
              <select
                name="industry"
                value={formData.industry || 'Information Technology / SaaS'}
                onChange={handleChange}
                className="input-field text-sm mt-1"
              >
                <option value="Information Technology / SaaS">{translateText('Information Technology / SaaS')}</option>
                <option value="E-Commerce & Retail">{translateText('E-Commerce & Retail')}</option>
                <option value="Healthcare & Pharma">{translateText('Healthcare & Pharma')}</option>
                <option value="Food & Hospitality">{translateText('Food & Hospitality')}</option>
                <option value="Manufacturing">{translateText('Manufacturing')}</option>
                <option value="Financial Services / FinTech">{translateText('Financial Services / FinTech')}</option>
                <option value="Real Estate">{translateText('Real Estate')}</option>
                <option value="Education / EdTech">{translateText('Education / EdTech')}</option>
                <option value="Logistics & Supply Chain">{translateText('Logistics & Supply Chain')}</option>
                <option value="Other">{translateText('Other Services')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_incorp_date')}</label>
              <input
                type="date"
                name="incorporation_date"
                value={formData.incorporation_date ? formData.incorporation_date.split('T')[0] : ''}
                onChange={handleChange}
                className="input-field text-sm mt-1"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location & Scale */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
            <MapPin className="w-4 h-4" /> {t('prof_sec_location')}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_state')}</label>
              <input
                type="text"
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
                className="input-field text-sm mt-1"
                placeholder="e.g. Karnataka, Maharashtra, Delhi"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_city')}</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="input-field text-sm mt-1"
                placeholder="e.g. Bengaluru, Mumbai"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_employees')}</label>
              <input
                type="number"
                name="employee_count"
                value={formData.employee_count ?? 1}
                onChange={handleChange}
                min="1"
                className="input-field text-sm mt-1"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Statutory IDs */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
            <Shield className="w-4 h-4" /> {t('prof_sec_statutory')}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_gstin')}</label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin || ''}
                onChange={handleChange}
                className="input-field text-sm mt-1 font-mono uppercase"
                placeholder="29AAAAA0000A1Z5"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_pan')}</label>
              <input
                type="text"
                name="pan"
                value={formData.pan || ''}
                onChange={handleChange}
                className="input-field text-sm mt-1 font-mono uppercase"
                placeholder="ABCDE1234F"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-surface-300">{t('prof_cin')}</label>
              <input
                type="text"
                name="cin"
                value={formData.cin || ''}
                onChange={handleChange}
                className="input-field text-sm mt-1 font-mono uppercase"
                placeholder="U72200KA2023PTC123456"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Operational Switches */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-primary-400 uppercase tracking-wider border-b border-surface-800 pb-2">
            {t('prof_sec_flags')}
          </h2>

          <div className="grid sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60 border border-surface-800 cursor-pointer hover:border-surface-700">
              <input
                type="checkbox"
                name="gst_registered"
                checked={Boolean(formData.gst_registered)}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 bg-surface-800 border-surface-700"
              />
              <span className="text-xs text-surface-200">{t('prof_gst_reg')}</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60 border border-surface-800 cursor-pointer hover:border-surface-700">
              <input
                type="checkbox"
                name="physical_location"
                checked={Boolean(formData.physical_location)}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 bg-surface-800 border-surface-700"
              />
              <span className="text-xs text-surface-200">{t('prof_physical_premise')}</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60 border border-surface-800 cursor-pointer hover:border-surface-700">
              <input
                type="checkbox"
                name="handles_food"
                checked={Boolean(formData.handles_food)}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 bg-surface-800 border-surface-700"
              />
              <span className="text-xs text-surface-200">{t('prof_handles_food')}</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-2.5 px-6 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '...' : t('prof_save_btn')}
          </button>
        </div>
      </form>
    </div>
  );
}
