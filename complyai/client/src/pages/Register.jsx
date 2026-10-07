import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signInDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      toast.success(t('auth_create_title'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    signInDemo();
    toast.success('Signed in with Demo Company (NovaTech Solutions Pvt Ltd)');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/5 via-transparent to-transparent" />
      <div className="w-full max-w-md relative animate-fade-in space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-white">ComplyAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t('auth_create_title')}</h1>
          <p className="text-surface-400 mt-1 text-sm">{t('auth_create_sub')}</p>
        </div>

        {/* 1-Click Instant Demo Access */}
        <div className="glass-card p-4 border-primary-500/30 bg-primary-950/20 flex flex-col gap-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-primary-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            {t('auth_quick_eval')}
          </div>
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-2 font-semibold shadow-lg shadow-primary-500/25"
          >
            <span>{t('auth_demo_login')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="glass-card p-6 md:p-8">
          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-surface-800"></div>
            <span className="flex-shrink mx-4 text-surface-500 text-xs">{t('auth_or_creds')}</span>
            <div className="flex-grow border-t border-surface-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{t('auth_fullname')}</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="input-field w-full text-sm py-2.5"
                placeholder="Aarav Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{t('auth_email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-field w-full text-sm py-2.5"
                placeholder="aarav@novatech.in"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{t('auth_password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field w-full pr-12 text-sm py-2.5"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm mt-2"
            >
              {loading ? '...' : t('auth_signup_btn')}
            </button>
          </form>
        </div>

        <p className="text-center text-surface-400 text-sm">
          {t('auth_have_account')}{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">{t('auth_signin_btn')}</Link>
        </p>
      </div>
    </div>
  );
}
