import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Box, Users, ArrowLeftRight, BellRing, FileText,
  Sparkles, Settings, LogOut, Bell, ChevronDown, AlertTriangle, X,
  User, ShoppingCart, Activity, ChevronLeft, ChevronRight, TrendingUp,
  Warehouse, Truck, BarChart2, Package, Shield
} from 'lucide-react';

import authService from '../services/authService';
import notificationService from '../services/notificationService';
import alertService from '../services/alertService';
import { isAdmin } from '../services/permissionHelper';
import FloatingChatbot from '../components/Chat/FloatingChatbot';


export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifs = await notificationService.getAll();
        setNotifications(Array.isArray(notifs) ? notifs : (notifs.data ?? []));

        try {
          const unreadRes = await notificationService.getUnreadCount();
          setUnreadCount(typeof unreadRes === 'object' ? (unreadRes.count ?? unreadRes.unread_count ?? 0) : unreadRes);
        } catch {
          const list = Array.isArray(notifs) ? notifs : (notifs.data ?? []);
          setUnreadCount(list.filter(n => !n.read_at).length);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }

      if (isAdmin()) {
        try {
          const { default: api } = await import('../services/api');
          const res = await api.get('/product-requests');
          if (res.data) setPendingRequestsCount(res.data.filter(r => r.status === 'en_attente').length);
        } catch { }
      }

      try {
        const alertsRes = await alertService.getActive();
        const alertsList = alertsRes.data || alertsRes || [];
        setActiveAlertsCount(alertsList.length);
      } catch (err) {
        console.error("Failed to fetch active alerts", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const admin = isAdmin();
  const user = authService.getUser();
  const userInitials = (user?.name || user?.nom || 'JD').substring(0, 2).toUpperCase();

  /* ── Nav groups ── */
  const navGroups = [
    {
      label: 'Principal',
      items: [
        { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Produits', icon: Box, path: '/products' },
        { name: 'Mouvements', icon: ArrowLeftRight, path: '/movements' },
        { name: 'Alertes', icon: BellRing, path: '/alerts', badge: activeAlertsCount > 0 ? activeAlertsCount : null, badgeColor: 'bg-red-500' },
      ]
    },
    ...(admin ? [{
      label: 'Gestion',
      items: [
        { name: 'Fournisseurs', icon: Truck, path: '/suppliers' },
        { name: 'Commandes', icon: ShoppingCart, path: '/orders' },
        { name: 'Utilisateurs', icon: Users, path: '/users' },
      ]
    }] : []),
    ...(admin ? [{
      label: 'Analytique',
      items: [
        { name: 'Rapports', icon: FileText, path: '/reports' },
        { name: 'Analyses IA', icon: Sparkles, path: '/ai-insights' },
        { name: "Journal d'Audit", icon: Activity, path: '/users/audit-logs' },
      ]
    }] : []),
  ];

  const bottomItems = [
    { name: 'Mon Profil', icon: User, path: '/profile' },
    ...(admin ? [{ name: 'Paramètres', icon: Settings, path: '/settings' }] : []),
    {
      name: 'Déconnexion',
      icon: LogOut,
      path: '/logout',
      action: (e) => { e.preventDefault(); setShowLogoutModal(true); }
    },
  ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      const { default: authService } = await import('../services/authService');
      await authService.logout();
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f0f4ff] font-sans text-slate-900 overflow-hidden">

      {/* ── LOGOUT MODAL ── */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)} className="absolute inset-0 bg-slate-900/40" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[280px] bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 text-red-500 rounded-xl"><LogOut size={16} /></div>
                <h3 className="text-sm font-black text-slate-900">Déconnexion</h3>
                <button onClick={() => setShowLogoutModal(false)} className="ml-auto p-1 text-slate-300 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-5">
                Voulez-vous quitter votre session ? Les modifications non enregistrées seront perdues.
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={handleLogout} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                  Confirmer
                </button>
                <button onClick={() => setShowLogoutModal(false)} className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-white border-r border-slate-100 flex flex-col flex-shrink-0 z-20 overflow-hidden relative"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-50 flex-shrink-0">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-none">
                <span className="text-blue-600">Stock</span>Manager
              </h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Gestion Inventaire</p>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center mx-auto">
              <Warehouse size={14} className="text-white" />
            </div>
          )}
        </div>

        {/* Nav Groups — flex-1 so it fills space, NO overflow/scroll */}
        <nav className="flex-1 px-2 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 mb-1">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-150 relative group
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="relative flex-shrink-0">
                          <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                          {item.badge && (
                            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${item.badgeColor} ring-2 ring-white animate-pulse`} />
                          )}
                        </div>
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 leading-none">{item.name}</span>
                            {item.badge && (
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {/* Tooltip when collapsed */}
                        {sidebarCollapsed && (
                          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                            {item.name}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom items */}
        <div className="px-2 pb-4 space-y-0.5 border-t border-slate-50 pt-3">
          {bottomItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={item.action}
              title={sidebarCollapsed ? item.name : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all relative group"
            >
              <item.icon size={16} className="text-slate-400 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(v => !v)}
          className="absolute -right-3 top-[70px] w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all z-30"
        >
          {sidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
      </motion.aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-10 flex-shrink-0">
          {/* Breadcrumb / sub-tabs */}
          <div className="flex items-center gap-4">
            {location.pathname.includes('/products') && (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                {[
                  { label: 'Inventaire', path: '/products' },
                  { label: 'Catégories', path: '/products/categories' },
                  { label: 'Groupes ABC', path: '/ai-insights/abc-analysis' },
                ].map(t => (
                  <button key={t.label} onClick={() => navigate(t.path)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                      ${location.pathname === t.path ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => {
                  const willShow = !showNotifications;
                  setShowNotifications(willShow);
                  if (willShow && unreadCount > 0) {
                    notificationService.readAll().then(() => setUnreadCount(0)).catch(() => { });
                  }
                }}
                className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xs font-black text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full">{unreadCount} NOUVELLE{unreadCount > 1 ? 'S' : ''}</span>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">Aucune notification.</div>
                        ) : notifications.map(notif => {
                          const typeCheck = (notif.data?.type || notif.type || '').toLowerCase();
                          const isAlert = typeCheck.includes('alert') || typeCheck.includes('critical');
                          const isWarning = typeCheck.includes('warning') || typeCheck.includes('low');
                          const title = notif.data?.title || notif.title || 'Notification';
                          const desc = notif.data?.message || notif.data?.desc || notif.message || '';
                          let timeStr = 'Récemment';
                          if (notif.created_at) {
                            const d = new Date(notif.created_at);
                            timeStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                          }
                          return (
                            <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notif.read_at ? 'bg-blue-50/40' : ''}`}>
                              <div className={`p-2 rounded-xl h-fit flex-shrink-0 ${isAlert ? 'bg-red-100 text-red-600' : isWarning ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isAlert ? <AlertTriangle size={13} /> : isWarning ? <Box size={13} /> : <FileText size={13} />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-bold text-slate-800 truncate">{title}</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{desc}</p>
                                <span className="text-[9px] font-bold text-slate-400 mt-1 block">{timeStr}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Link to="/alerts" onClick={() => setShowNotifications(false)}
                        className="block w-full p-3 text-center text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-widest">
                        Voir toutes les alertes →
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User chip */}
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-700 text-white flex items-center justify-center text-[9px] font-black">
                {userInitials}
              </div>
              {!sidebarCollapsed && (
                <div className="hidden md:block text-left">
                  <p className="text-[10px] font-black text-slate-700 leading-none">{user?.name || user?.nom || 'Utilisateur'}</p>
                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5">{admin ? 'Administrateur' : 'Opérateur'}</p>
                </div>
              )}
              <ChevronDown size={12} className="text-slate-400" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <FloatingChatbot />
      </div>
    </div>
  );
}
