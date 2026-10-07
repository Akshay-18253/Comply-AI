import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Menu, Bell, User, Globe, ChevronDown, Award } from 'lucide-react';

export default function Topbar({ onMenuClick, onOpenDossier }) {
  const { user } = useAuth();
  const { currentLang, languages, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const selectedLang = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <header className="sticky top-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 no-print">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-surface-900 border border-surface-700/60 hover:border-primary-500/50 text-surface-300 hover:text-white transition-all text-xs"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-primary-400" />
              <span className="font-medium hidden sm:inline">{selectedLang.native}</span>
              <span className="font-medium sm:hidden">{selectedLang.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-surface-400" />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-surface-900 border border-surface-700 shadow-xl z-50 py-1 overflow-hidden animate-slide-up">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-wider border-b border-surface-800">
                    Indian Languages (भाषा)
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        currentLang === lang.code
                          ? 'bg-primary-500/15 text-primary-400 font-semibold'
                          : 'text-surface-300 hover:bg-surface-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      <span className="text-[10px] text-surface-500">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-xl transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-surface-800/60 rounded-xl transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-surface-300 hidden md:block">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
