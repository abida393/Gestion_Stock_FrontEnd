import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  ArrowLeftRight, 
  BellRing, 
  FileText, 
  Sparkles, 
  Settings, 
  LogOut,
  Bell,
  ChevronDown
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Produits', icon: Box, path: '/products' },
    { name: 'Fournisseurs', icon: Users, path: '/suppliers' },
    { name: 'Mouvements de stock', icon: ArrowLeftRight, path: '/movements' },
    { name: 'Alertes', icon: BellRing, path: '/alerts' },
    { name: 'Rapports', icon: FileText, path: '/reports' },
    { name: 'Analyses IA', icon: Sparkles, path: '/insights' },
  ];

  const bottomItems = [
    { name: 'Paramètres', icon: Settings, path: '/settings' },
    { name: 'Déconnexion', icon: LogOut, path: '/logout' },
  ];

  const getPageTitle = () => {
    if (location.pathname.startsWith('/products')) return 'Produits';
    if (location.pathname.startsWith('/suppliers')) return 'Fournisseurs';
    if (location.pathname.startsWith('/dashboard')) return 'Tableau de bord';
    return 'StockManager';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 z-10">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-transparent">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              <span className="text-blue-700">Stock</span>Manager
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Inventaire d'Entreprise</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-3 space-y-1 hover:cursor-pointer">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <item.icon
                  className="w-5 h-5 mr-3 flex-shrink-0 text-current"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-3 pb-6 space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 ease-in-out"
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0 text-slate-400" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-blue-900 border-r border-slate-200 pr-5 h-6 flex items-center">{getPageTitle()}</h2>
            {location.pathname.includes('/products') && (
              <div className="flex items-center gap-6">
                 <button className="text-xs font-bold text-blue-600 underline underline-offset-8">Inventaire</button>
                 <button className="text-xs font-bold text-slate-400 hover:text-slate-600">Catégories</button>
                 <button className="text-xs font-bold text-slate-400 hover:text-slate-600">Groupes</button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">JD</div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
