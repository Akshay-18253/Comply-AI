import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Users, Settings, ChevronRight, ChevronLeft, Check, Rocket } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const INDUSTRIES = ['Retail', 'Restaurant/Food', 'Healthcare/Clinic', 'Manufacturing', 'Agriculture/Food Processing', 'IT/Software', 'Professional Services', 'Construction', 'Logistics', 'E-commerce', 'Education', 'Hospitality', 'Other'];
const BUSINESS_TYPES = ['Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited', 'One Person Company', 'Trust', 'Society', 'Section 8 Company', 'HUF', 'Other'];
const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'];

const STEPS = [
  { icon: Building2, title: 'Business Identity', desc: 'Basic business information' },
  { icon: MapPin, title: 'Location & Scale', desc: 'Where you operate and how large' },
  { icon: Users, title: 'Workforce & Operations', desc: 'Employees and operational details' },
  { icon: Settings, title: 'Industry Specific', desc: 'Details specific to your industry' },
];

export default function Onboarding() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [existingBusiness, setExistingBusiness] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    business_name: '', owner_name: '', business_type: 'Sole Proprietorship', industry: 'Retail',
    description: '', state: 'Karnataka', city: '', district: '', pincode: '',
    annual_turnover: null, employee_count: 0, business_start_date: '', gst_registered: false,
    import_export: false, online_business: false, physical_location: true, handles_food: false,
    handles_personal_data: false, uses_machinery: false, uses_hazardous_materials: false,
    generates_waste: false, uses_contract_workers: false, registration_status: 'Registered',
    number_of_locations: 1,
  });

  useEffect(() => {
    api.get('/business').then(res => {
      if (res.data.business) {
        setExistingBusiness(res.data.business);
        setForm(prev => ({ ...prev, ...res.data.business }));
      }
    }).catch(() => {});
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.business_name || !form.business_type || !form.industry || !form.state) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.annual_turnover === '' || payload.annual_turnover === null) payload.annual_turnover = null;
      else payload.annual_turnover = Number(payload.annual_turnover);
      payload.employee_count = Number(payload.employee_count) || 0;

      if (existingBusiness) {
        await api.put('/business', payload);
        toast.success('Business profile updated!');
      } else {
        await api.post('/business', payload);
        toast.success('Business profile created!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Business Name *</label>
              <input className="glass-input w-full" value={form.business_name} onChange={e => update('business_name', e.target.value)} placeholder="Your business name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Owner/Founder Name</label>
              <input className="glass-input w-full" value={form.owner_name} onChange={e => update('owner_name', e.target.value)} placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Business Type *</label>
                <select className="glass-input w-full" value={form.business_type} onChange={e => update('business_type', e.target.value)}>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Industry *</label>
                <select className="glass-input w-full" value={form.industry} onChange={e => update('industry', e.target.value)}>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Description</label>
              <textarea className="glass-input w-full h-24 resize-none" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Brief description of your business..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Registration Status</label>
              <select className="glass-input w-full" value={form.registration_status} onChange={e => update('registration_status', e.target.value)}>
                <option value="Registered">Registered</option>
                <option value="Registration Pending">Registration Pending</option>
                <option value="Not Yet Registered">Not Yet Registered</option>
              </select>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">State *</label>
                <select className="glass-input w-full" value={form.state} onChange={e => update('state', e.target.value)}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">City</label>
                <input className="glass-input w-full" value={form.city} onChange={e => update('city', e.target.value)} placeholder="City" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">District</label>
                <input className="glass-input w-full" value={form.district} onChange={e => update('district', e.target.value)} placeholder="District" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Pincode</label>
                <input className="glass-input w-full" value={form.pincode} onChange={e => update('pincode', e.target.value)} placeholder="560001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Annual Turnover (₹)</label>
                <input type="number" className="glass-input w-full" value={form.annual_turnover || ''} onChange={e => update('annual_turnover', e.target.value)} placeholder="e.g. 5000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Employee Count</label>
                <input type="number" className="glass-input w-full" value={form.employee_count} onChange={e => update('employee_count', e.target.value)} min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Business Start Date</label>
                <input type="date" className="glass-input w-full" value={form.business_start_date || ''} onChange={e => update('business_start_date', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Number of Locations</label>
                <input type="number" className="glass-input w-full" value={form.number_of_locations} onChange={e => update('number_of_locations', parseInt(e.target.value) || 1)} min="1" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <ToggleField label="GST Registered" value={form.gst_registered} onChange={v => update('gst_registered', v)} />
            <ToggleField label="Import / Export Activity" value={form.import_export} onChange={v => update('import_export', v)} />
            <ToggleField label="Online Business / E-commerce" value={form.online_business} onChange={v => update('online_business', v)} />
            <ToggleField label="Physical Location / Office / Shop" value={form.physical_location} onChange={v => update('physical_location', v)} />
            <ToggleField label="Uses Contract Workers" value={form.uses_contract_workers} onChange={v => update('uses_contract_workers', v)} />
            <ToggleField label="Handles Personal / Sensitive Data" value={form.handles_personal_data} onChange={v => update('handles_personal_data', v)} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <ToggleField label="Handles Food / Food Business" value={form.handles_food} onChange={v => update('handles_food', v)} />
            <ToggleField label="Uses Machinery / Equipment" value={form.uses_machinery} onChange={v => update('uses_machinery', v)} />
            <ToggleField label="Uses Hazardous Materials" value={form.uses_hazardous_materials} onChange={v => update('uses_hazardous_materials', v)} />
            <ToggleField label="Generates Waste" value={form.generates_waste} onChange={v => update('generates_waste', v)} />
            {form.handles_food && (
              <div className="glass-card p-4 border-accent-500/30">
                <p className="text-sm text-accent-400 font-medium mb-2">🍽️ Food Business Detected</p>
                <p className="text-xs text-surface-400">FSSAI licensing and food safety requirements will be evaluated by ComplyAI.</p>
              </div>
            )}
            {form.uses_hazardous_materials && (
              <div className="glass-card p-4 border-amber-500/30">
                <p className="text-sm text-amber-400 font-medium mb-2">⚠️ Hazardous Materials</p>
                <p className="text-xs text-surface-400">Environmental and safety compliance requirements will be evaluated.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="page-title mb-2">Business Onboarding</h1>
        <p className="text-surface-400">Tell us about your business so ComplyAI can identify your compliance needs.</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex items-center gap-2">
            <button onClick={() => setStep(i)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full
              ${i === step ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : i < step ? 'bg-emerald-500/10 text-emerald-400' : 'text-surface-500 hover:text-surface-300'}`}>
              {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              <span className="hidden md:block">{s.title}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-surface-600 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h2 className="text-xl font-bold text-white mb-1">{STEPS[step].title}</h2>
            <p className="text-sm text-surface-400 mb-6">{STEPS[step].desc}</p>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-surface-700/50">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" /> {t('action_cancel')}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-accent flex items-center gap-2">
              <Rocket className="w-4 h-4" /> {loading ? '...' : t('action_save')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between p-4 rounded-xl bg-surface-800/40 cursor-pointer hover:bg-surface-800/60 transition-colors">
      <span className="text-sm font-medium text-surface-200">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary-500' : 'bg-surface-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}
