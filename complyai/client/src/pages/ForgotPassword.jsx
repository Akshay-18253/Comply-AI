import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t('auth_forgot')}</h1>
          <p className="text-surface-400 mt-1">{t('auth_welcome_sub')}</p>
        </div>
        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-surface-300">Check your email for a password reset link.</p>
              <Link to="/login" className="btn-primary mt-6 inline-block">{t('auth_signin_btn')}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">{t('auth_email')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="glass-input w-full" placeholder="you@business.com" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? '...' : t('auth_signin_btn')}
              </button>
            </form>
          )}
        </div>
        <div className="text-center mt-6">
          <Link to="/login" className="text-surface-400 hover:text-surface-200 text-sm inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('auth_signin_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
