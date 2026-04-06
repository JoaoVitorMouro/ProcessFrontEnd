import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  GitBranchPlus,
  Wrench,
  Users,
  FileText,
  Map,
  BarChart3,
  History,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/areas', icon: FolderKanban, label: 'Áreas' },
  { to: '/processes', icon: GitBranchPlus, label: 'Processos' },
  { to: '/tools', icon: Wrench, label: 'Ferramentas' },
  { to: '/responsibles', icon: Users, label: 'Responsáveis' },
  { to: '/documents', icon: FileText, label: 'Documentos' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/changelog', icon: History, label: 'Histórico' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <Map className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">Mapeamento</h1>
          <p className="text-xs text-gray-500">de Processos</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
              ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-400 text-center">Stage Consulting</p>
      </div>
    </aside>
  );
}
