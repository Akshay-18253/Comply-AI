import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardCheck, FileText, MessageSquare, Bell } from 'lucide-react';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/compliance', icon: ClipboardCheck, label: 'Comply' },
  { to: '/documents', icon: FileText, label: 'Docs' },
  { to: '/assistant', icon: MessageSquare, label: 'Chat' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
];

export default function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-900/95 backdrop-blur-xl border-t border-surface-700/50 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-xs font-medium
              ${isActive ? 'text-primary-400' : 'text-surface-500 hover:text-surface-300'}`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
