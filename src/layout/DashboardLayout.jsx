import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  AlertTriangle,
  X,
  User
} from 'lucide-react';
import authService from '../services/authService';
import { isAdmin } from '../services/permissionHelper';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock de notifications récentes
  const recentNotifications = [
    { id: 1, title: 'Stock critique', desc: 'Le produit "MacBook Pro" est presque épuisé (2 restants).', time: 'Il y a 5 min', type: 'alert' },
    { id: 2, title: 'Mouvement suspect', desc: 'Sortie non habituelle de 50 unités de "Souris Logitech".', time: 'Il y a 1h', type: 'warning' },
    { id: 3, title: 'Rapport généré', desc: 'Le rapport mensuel est prêt à être téléchargé.', time: 'Il y a 2h', type: 'info' },
  ];

  const admin = isAdmin();

  const navItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Produits', icon: Box, path: '/products' },
    ...(admin ? [{ name: 'Fournisseurs', icon: Users, path: '/suppliers' }] : []),
    { name: 'Mouvements de stock', icon: ArrowLeftRight, path: '/movements' },
    { name: 'Alertes', icon: BellRing, path: '/alerts' },
    ...(admin ? [
      { name: 'Rapports', icon: FileText, path: '/reports' },
      { name: 'Analyses IA', icon: Sparkles, path: '/ai-insights' },
    ] : []),
  ];

  const bottomItems = [
    { name: 'Profil', icon: User, path: '/profile' },
    ...(admin ? [{ name: 'Paramètres', icon: Settings, path: '/settings' }] : []),
    { 
      name: 'Déconnexion', 
      icon: LogOut, 
      path: '/logout',
      action: (e) => {
        e.preventDefault();
        setShowLogoutModal(true);
      }
    },
  ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      // Attempt to revoke the token on the server (fire-and-forget)
      const { default: authService } = await import('../services/authService');
      await authService.logout();
    } catch {
      // Even if the server call fails, wipe local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    navigate('/');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/products/categories')) return 'Catégories';
    if (path.startsWith('/products')) return 'Produits';
    if (path.startsWith('/suppliers/add')) return 'Ajouter un fournisseur';
    if (path.startsWith('/suppliers')) return 'Fournisseurs';
    if (path.startsWith('/movements/history')) return 'Historique des mouvements';
    if (path.startsWith('/movements')) return 'Mouvements de stock';
    if (path.startsWith('/alerts/thresholds')) return 'Configuration des seuils';
    if (path.startsWith('/alerts')) return 'Alertes de stock';
    if (path.startsWith('/reports/detail')) return 'Analyse détaillée';
    if (path.startsWith('/reports')) return 'Centre de rapports';
    if (path.startsWith('/ai-insights/anomalies')) return 'Détection d\'anomalies';
    if (path.startsWith('/ai-insights')) return 'Analyses IA';
    if (path.startsWith('/profile')) return 'Mon Profil';
    if (path.startsWith('/dashboard')) return 'Tableau de bord';
    return 'StockManager';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Logout Confirmation Popup (Small High-Density Design) */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/30"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[280px] bg-white rounded-xl shadow-2xl p-5 border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Déconnexion</h3>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="ml-auto p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-6 px-1">
                Êtes-vous sûr de vouloir quitter votre session ? Les modifications non enregistrées seront perdues.
              </p>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95"
                >
                  Confirmer
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 z-10">
        <div>
          {/* Logo */}
          <div className="h-14 flex items-center px-5 border-b border-transparent">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              <span className="text-blue-700">Stock</span>Manager
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Inventaire d'Entreprise</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 px-3 space-y-0.5 hover:cursor-pointer">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors duration-150 ease-in-out ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <item.icon
                  className="w-4.5 h-4.5 mr-3 flex-shrink-0 text-current"
                  aria-hidden="true"
                  size={18}
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-3 pb-6 space-y-0.5">
          {bottomItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={item.action}
              className="flex items-center px-3 py-2 text-[13px] font-semibold rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 ease-in-out"
            >
              <item.icon className="w-4.5 h-4.5 mr-3 flex-shrink-0 text-slate-400" aria-hidden="true" size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50 relative flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-blue-900 border-r border-slate-200 pr-5 h-5 flex items-center">{getPageTitle()}</h2>
            {location.pathname.includes('/products') && (
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => navigate('/products')} 
                  className={`text-[11px] font-bold ${location.pathname === '/products' || location.pathname.startsWith('/products/add') || location.pathname.match(/^\/products\/\d+/) || location.pathname.startsWith('/products/edit') ? 'text-blue-600 underline underline-offset-4' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Inventaire
                </button>
                <button 
                  onClick={() => navigate('/products/categories')}
                  className={`text-[11px] font-bold ${location.pathname === '/products/categories' ? 'text-blue-600 underline underline-offset-4' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Catégories
                </button>
                <button 
                  onClick={() => { import('react-hot-toast').then(m => m.default.success("Gestion des groupes à venir !")) }}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
                >
                  Groupes
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-2 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">3 NOUVELLES</span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {recentNotifications.map(notif => (
                          <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3">
                            <div className={`p-2 rounded-full h-fit flex-shrink-0 ${
                              notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                              notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notif.type === 'alert' ? <AlertTriangle size={14}/> : 
                               notif.type === 'warning' ? <Box size={14}/> : <FileText size={14}/>}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notif.desc}</p>
                              <span className="text-[10px] font-bold text-slate-400 mt-1 block">{notif.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link 
                        to="/alerts" 
                        onClick={() => setShowNotifications(false)}
                        className="block w-full p-3 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Voir toutes les alertes →
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/profile')}
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold">
                {(authService.getUser()?.nom || authService.getUser()?.name || 'JD').substring(0, 2).toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 pb-12">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
