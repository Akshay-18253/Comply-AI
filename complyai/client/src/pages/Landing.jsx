import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Bot, FileText, Bell, ArrowRight, CheckCircle2, Zap, Globe, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const features = [
  { icon: Bot, title: 'Agentic AI Workflow', desc: '6 specialized AI agents analyze your business and discover applicable compliance requirements automatically.' },
  { icon: Shield, title: 'Personalized Compliance', desc: 'Get requirements specific to your business type, industry, location, size, and operational characteristics.' },
  { icon: FileText, title: 'Document Intelligence', desc: 'Upload documents for AI analysis. Extract dates, match to requirements, and detect issues.' },
  { icon: Bell, title: 'Proactive Alerts', desc: 'Never miss a deadline. Get notified about upcoming due dates, expiring documents, and regulatory changes.' },
  { icon: Globe, title: 'Official Sources', desc: 'Every recommendation cites authoritative Indian government sources. No guesswork.' },
  { icon: Clock, title: 'Deadline Tracking', desc: 'Visual calendar and timeline of all compliance deadlines, renewals, and filing dates.' },
];

const steps = [
  { num: '01', title: 'Tell Us About Your Business', desc: 'Complete a simple onboarding wizard with your business details.' },
  { num: '02', title: 'AI Discovers Requirements', desc: 'Our 6-agent AI system identifies applicable compliance requirements.' },
  { num: '03', title: 'Get Your Personalized Checklist', desc: 'View prioritized compliance items with documents, deadlines, and actions.' },
  { num: '04', title: 'Track & Complete', desc: 'Monitor progress, upload documents, and stay ahead of deadlines.' },
];

export default function Landing() {
  const { currentLang, languages, changeLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-white">ComplyAI</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <select
              value={currentLang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-surface-800 text-xs text-surface-200 border border-surface-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary-500"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.native}
                </option>
              ))}
            </select>
            <Link to="/login" className="btn-ghost text-sm">{t('auth_signin_btn')}</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-5">{t('auth_signup_btn')}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" /> Powered by Agentic AI
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
              <span className="text-white">Compliance Made</span>
              <br />
              <span className="gradient-text">Simple for Indian Businesses</span>
            </h1>
            <p className="text-xl text-surface-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Tell ComplyAI about your business, and it will determine what compliance actions may apply to you, 
              explain why, identify required documents, organize deadlines, and tell you what to do next.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg py-4 px-8 flex items-center gap-2 group">
                {t('auth_signup_btn')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg py-4 px-8">
                {t('auth_signin_btn')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-surface-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-4 text-white">
            How ComplyAI Works
          </h2>
          <p className="text-surface-400 text-center mb-16 max-w-2xl mx-auto">
            Not a chatbot. A multi-agent AI system that understands, discovers, reasons, verifies, and acts.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center relative group hover:border-primary-500/30 transition-all"
              >
                <div className="text-4xl font-bold font-display gradient-text mb-4">{step.num}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-surface-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-surface-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-16 text-white">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card-hover p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Pipeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display text-white mb-8">The Agentic Pipeline</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Business Profiling', 'Compliance Discovery', 'Knowledge Retrieval', 'Reasoning', 'Document Analysis', 'Deadline Planning', 'Verification'].map((agent, i) => (
              <motion.div
                key={agent}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-surface-200">{agent}</span>
                {i < 6 && <ArrowRight className="w-3 h-3 text-surface-500 hidden sm:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="text-3xl font-bold font-display text-white mb-4">
            Ready to Simplify Your Compliance?
          </h2>
          <p className="text-surface-400 mb-8">
            Join thousands of Indian businesses using ComplyAI to stay compliant.
          </p>
          <Link to="/register" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            <span className="font-display font-bold text-white">ComplyAI</span>
          </div>
          <p className="text-sm text-surface-500">
            ComplyAI is an informational tool and does not constitute legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
