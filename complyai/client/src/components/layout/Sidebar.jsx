import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard, Building2, ClipboardCheck, FileText,
  MessageSquare, CalendarDays, Bell, Bot, Globe, User,
  Settings, LogOut, Shield, X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
    { to: '/compliance', icon: ClipboardCheck, label: t('nav_compliance') },
    { to: '/documents', icon: FileText, label: t('nav_documents') },
    { to: '/assistant', icon: MessageSquare, label: t('nav_assistant') },
    { to: '/calendar', icon: CalendarDays, label: t('nav_calendar') },
    { to: '/agents', icon: Bot, label: t('nav_agents') },
    { to: '/notifications', icon: Bell, label: t('nav_notifications') },
    { to: '/sources', icon: Globe, label: t('nav_sources') },
  ];

  const bottomItems = [
    { to: '/profile', icon: User, label: t('nav_profile') },
    { to: '/settings', icon: Settings, label: t('nav_settings') },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden no-print" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 glass-sidebar z-50 flex flex-col no-print
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between border-b border-surface-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-white">ComplyAI</h1>
              <p className="text-xs text-surface-400">Smart Compliance</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-surface-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-1 border-t border-surface-700/50">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-4 h-4" />
            {t('nav_logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
