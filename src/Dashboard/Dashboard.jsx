import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package, AlertTriangle, ArrowLeftRight, Banknote, TrendingUp, TrendingDown,
  Plus, ArrowUpRight, BrainCircuit, Loader2, Calendar, ChevronLeft, ChevronRight,
  MoreHorizontal, Search, Bell, User, Activity, ArrowRight, Box, Truck, Lock,
  CheckCircle, ShoppingCart, Sparkles, Clock, History, ArrowDownRight, Coins,
  Download, Filter, RefreshCw, BarChart2, Users, Star, Zap, Shield, XCircle,
  PauseCircle, PlayCircle, ChevronDown, Eye, Edit2, Warehouse
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import dashboardService from '../services/dashboardService';
import movementService from '../services/movementService';
import api from '../services/api';
import alertService from '../services/alertService';
import orderService from '../services/orderService';
import authService from '../services/authService';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement);

/* ─────────────────────────── Helpers ─────────────────────────── */

const fmtNum = (n) => n != null ? Number(n).toLocaleString('fr-FR') : '—';
const fmtCurrency = (v) => {
  if (v == null) return '—';
  const val = Number(v);
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return `${val.toLocaleString('fr-FR')}`;
};
const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(); yesterday.setDate(now.getDate() - 1);
  const isYest = d.toDateString() === yesterday.toDateString();
  const t = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Aujourd'hui, ${t}`;
  if (isYest) return `Hier, ${t}`;
  return `${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'short' })}, ${t}`;
};

/* ─────────────────────────── Chart configs ─────────────────────────── */

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: { boxWidth: 8, boxHeight: 8, borderRadius: 4, font: { size: 9, weight: '700' }, color: '#94a3b8', usePointStyle: true }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      displayColors: false,
      titleColor: '#94a3b8',
      bodyColor: '#f8fafc',
      bodyFont: { weight: '700' }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 9, weight: '600' } } },
    y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 9 } } }
  },
  elements: { line: { tension: 0.4 }, point: { radius: 0, hoverRadius: 5 } }
};

const barOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: { grid: { display: false }, ticks: { display: false } },
    y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9, weight: '700' } } }
  }
};

/* ─────────────────────────── Mini Sparkline ─────────────────────────── */
function Sparkline({ data = [], color = '#3b82f6' }) {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ─────────────────────────── Status Badge ─────────────────────────── */
const STATUS_MAP = {
  A: { label: 'Excellent', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  B: { label: 'Correct', bg: 'bg-blue-100', text: 'text-blue-700' },
  C: { label: 'À risque', bg: 'bg-orange-100', text: 'text-orange-700' },
  D: { label: 'Critique', bg: 'bg-red-100', text: 'text-red-700' },
};

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const user = authService.getUser();
  const userName = user?.name || user?.nom || 'Utilisateur';

  const [kpis, setKpis] = useState({
    total_products: 0, stock_physique_total: 0, stock_disponible_total: 0,
    stock_reserve_total: 0, stock_en_transit_total: 0, total_stock_value: 0,
    upcoming_liberations: [], upcoming_orders: [], ai_suggestions: null,
    low_stock_list: [], sales_by_region: [], top_suppliers: [], top_users: []
  });
  const [recentMovements, setRecentMovements] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [regionChartData, setRegionChartData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perfTab, setPerfTab] = useState('suppliers');
  const [ordering, setOrdering] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('30d');
  const searchRef = React.useRef(null);

  /* ── Search live ── */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [prodRes, supRes] = await Promise.allSettled([
          api.get('/products', { params: { search: searchQuery, per_page: 5 } }),
          api.get('/fournisseurs', { params: { search: searchQuery, per_page: 3 } }),
        ]);
        const products = prodRes.status === 'fulfilled'
          ? (prodRes.value.data?.data || prodRes.value.data || []).slice(0, 5).map(p => ({ type: 'product', label: p.nom, sub: p.categorie?.nom || 'Produit', id: p.id }))
          : [];
        const suppliers = supRes.status === 'fulfilled'
          ? (supRes.value.data?.data || supRes.value.data || []).slice(0, 3).map(s => ({ type: 'supplier', label: s.nom, sub: 'Fournisseur', id: s.id }))
          : [];
        setSearchResults([...products, ...suppliers]);
        setSearchOpen(true);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSelect = (result) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (result.type === 'product') navigate(`/products/${result.id}`);
    else if (result.type === 'supplier') navigate(`/suppliers/${result.id}`);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
    if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
  };

  /* ── Calendar helpers ── */
  const calendarGrid = useMemo(() => {
    const year = calMonth.getFullYear(), month = calMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDow = (first.getDay() + 6) % 7; // Monday-first
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
    return cells;
  }, [calMonth]);

  const agendaItems = useMemo(() => {
    const libs = kpis.upcoming_liberations.map(l => ({ ...l, agendaType: 'liberation', date: new Date(l.date_expiration) }));
    const orders = kpis.upcoming_orders.map(o => ({ ...o, agendaType: 'order', date: new Date(o.date_livraison) }));
    return [...libs, ...orders]
      .filter(item => item.date.toDateString() === selectedDate.toDateString())
      .sort((a, b) => a.date - b.date);
  }, [kpis, selectedDate]);

  const hasEvent = useCallback((d) => {
    if (!d) return false;
    const dStr = d.toDateString();
    return [...kpis.upcoming_liberations.map(l => new Date(l.date_expiration)),
            ...kpis.upcoming_orders.map(o => new Date(o.date_livraison))]
      .some(ev => ev.toDateString() === dStr);
  }, [kpis]);

  /* ── Data fetching ── */
  const fetchData = async (filter = dateFilter) => {
    try {
      const days = filter === '7d' ? 7 : filter === '90d' ? 90 : 30;
      const data = await dashboardService.getKPIs({ days });
      setKpis({
        total_products: data.total_products ?? 0,
        stock_physique_total: data.stock_physique_total ?? 0,
        stock_en_transit_total: data.stock_en_transit_total ?? 0,
        stock_disponible_total: data.stock_disponible_total ?? 0,
        stock_reserve_total: data.stock_reserve_total ?? 0,
        total_stock_value: data.total_stock_value ?? 0,
        upcoming_liberations: data.upcoming_liberations || [],
        upcoming_orders: data.upcoming_orders || [],
        ai_suggestions: data.ai_suggestions,
        low_stock_list: data.low_stock_list || [],
        sales_by_region: data.sales_by_region || [],
        top_suppliers: data.top_suppliers || [],
        top_users: data.top_users || []
      });

      if (data.stock_history) {
        setStockHistory(data.stock_history);
        setChartData({
          labels: data.stock_history.map(h => h.day),
          datasets: [
            {
              label: 'Stock total',
              data: data.stock_history.map(h => h.value),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.08)',
              fill: true, borderWidth: 2
            },
            {
              label: 'Entrées',
              data: data.stock_history.map(h => h.entries ?? 0),
              borderColor: '#10b981',
              backgroundColor: 'transparent',
              borderDash: [4, 4], fill: false, borderWidth: 1.5
            }
          ]
        });
      }

      if (data.sales_by_region?.length) {
        setRegionChartData({
          labels: data.sales_by_region.map(r => r.region),
          datasets: [{
            data: data.sales_by_region.map(r => r.revenue),
            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'],
            borderRadius: 6, barThickness: 10
          }]
        });
      }

      const mvData = await movementService.getAll({ per_page: 10 });
      setRecentMovements(Array.isArray(mvData) ? mvData.slice(0, 10) : (mvData.data?.slice(0, 10) ?? []));

      const alertsRes = await alertService.getActive();
      setActiveAlerts((alertsRes.data || alertsRes || []).slice(0, 5));

      try {
        const healthRes = await api.get('/ai/health-score');
        setHealthScore(healthRes.data);
      } catch {}

    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAIOrder = async () => {
    if (!kpis.ai_suggestions?.fournisseur_id) {
      toast.error("Aucun fournisseur associé à ce produit.");
      return;
    }
    setOrdering(true);
    const tid = toast.loading("Génération de la commande IA...");
    try {
      await orderService.create({
        fournisseur_id: kpis.ai_suggestions.fournisseur_id,
        date_commande: new Date().toISOString().split('T')[0],
        lignes: [{ produit_id: kpis.ai_suggestions.id, quantite: kpis.ai_suggestions.eoq, prix: kpis.ai_suggestions.prix }]
      });
      toast.success(`Commande de ${kpis.ai_suggestions.eoq}x ${kpis.ai_suggestions.nom} créée !`, { id: tid });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la commande.", { id: tid });
    } finally {
      setOrdering(false);
    }
  };

  const handleExportDashboard = () => {
    try {
      const headers = ["Section", "Cle/Label", "Valeur", "Details"];
      const rows = [];

      // Section KPIs
      rows.push(["INDICATEURS CLÉS", "Stock Physique", kpis.stock_physique_total || 0, `${kpis.total_products || 0} produits`]);
      rows.push(["INDICATEURS CLÉS", "En Transit", kpis.stock_en_transit_total || 0, "unites en route"]);
      rows.push(["INDICATEURS CLÉS", "Stock Reserve", kpis.stock_reserve_total || 0, `${kpis.low_stock_list?.length || 0} alertes stock`]);
      rows.push(["INDICATEURS CLÉS", "Valorisation Inventaire", kpis.total_stock_value || 0, "MAD"]);

      rows.push([]);

      // Section Stocks Critiques
      rows.push(["STOCKS CRITIQUES", "Produit", "Quantite Actuelle", "Seuil Minimum"]);
      if (kpis.low_stock_list && kpis.low_stock_list.length > 0) {
        kpis.low_stock_list.forEach(p => {
          rows.push(["STOCKS CRITIQUES", p.nom, p.quantite, p.seuil_min]);
        });
      } else {
        rows.push(["STOCKS CRITIQUES", "Aucun produit sous le seuil critique", "", ""]);
      }

      rows.push([]);

      // Section Flux Récents
      rows.push(["FLUX RECENTS", "Produit", "Type", "Quantite", "Date"]);
      if (recentMovements && recentMovements.length > 0) {
        recentMovements.forEach(m => {
          rows.push([
            "FLUX RECENTS",
            m.produit?.nom || '—',
            m.type === 'entree' ? 'Entree' : 'Sortie',
            m.quantite,
            m.created_at || m.date_mouvement || ''
          ]);
        });
      } else {
        rows.push(["FLUX RECENTS", "Aucun flux recent", "", "", ""]);
      }

      rows.push([]);

      // Section Fournisseurs
      rows.push(["FOURNISSEURS", "Nom", "Commandes", "Evaluation"]);
      if (kpis.top_suppliers && kpis.top_suppliers.length > 0) {
        kpis.top_suppliers.forEach(s => {
          rows.push(["FOURNISSEURS", s.nom, s.commandes_count, s.rating]);
        });
      } else {
        rows.push(["FOURNISSEURS", "Aucun fournisseur", "", ""]);
      }

      const csvContent = [headers, ...rows]
        .map(row => row.map(val => {
          if (val === undefined || val === null) return '""';
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        }).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Rapport exporté avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'export du rapport.");
    }
  };

  const handleExportStatsCSV = () => {
    try {
      if (!stockHistory || stockHistory.length === 0) {
        toast.error("Aucune statistique disponible pour l'export.");
        return;
      }
      const headers = ["Jour", "Stock total", "Entrees"];
      const rows = stockHistory.map(h => [
        h.day || '',
        h.value ?? 0,
        h.entries ?? 0
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(val => {
          if (val === undefined || val === null) return '""';
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        }).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evolution_stock_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Statistiques exportées avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'export des statistiques.");
    }
  };

  useEffect(() => {
    fetchData(dateFilter);
  }, [dateFilter]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#f0f4ff]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement du tableau de bord…</p>
      </div>
    </div>
  );

  const healthPct = healthScore?.score ?? 0;
  const healthColor = healthPct >= 75 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-[#f0f4ff] min-h-screen">
      {/* ── TOP HEADER ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div>
          <h1 className="text-sm font-black text-slate-800 leading-none">
            Bonjour, <span className="text-blue-600">{userName}</span> ! 👋
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
          <div className="relative flex-1" ref={searchRef}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              onFocus={() => searchQuery.trim() && setSearchOpen(true)}
              placeholder="Rechercher produit, fournisseur… (Entrée)"
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
            />
            {searchLoading && <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
            {!searchLoading && searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                <XCircle size={12} />
              </button>
            )}
            {/* Dropdown results */}
            <AnimatePresence>
              {searchOpen && searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {searchResults.map((r, i) => (
                    <button key={i} onClick={() => handleSearchSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left group">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        r.type === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {r.type === 'product' ? <Box size={13} /> : <Truck size={13} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{r.label}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{r.sub}</p>
                      </div>
                      <ArrowRight size={11} className="text-slate-300 group-hover:text-blue-500 flex-shrink-0" />
                    </button>
                  ))}
                  <button onClick={() => { navigate(`/products?search=${encodeURIComponent(searchQuery)}`); setSearchQuery(''); setSearchOpen(false); }}
                    className="w-full px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2">
                    <Search size={11} /> Voir tous les résultats pour "{searchQuery}"
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            {['7j', '30j', '90j'].map(f => (
              <button key={f} onClick={() => setDateFilter(f === '7j' ? '7d' : f === '30j' ? '30d' : '90d')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${dateFilter === (f === '7j' ? '7d' : f === '30j' ? '30d' : '90d') ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
            <RefreshCw size={14} />
          </button>
          <button onClick={handleExportDashboard} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => navigate('/movements')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
            <Plus size={14} /> Nouveau Flux
          </button>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 max-w-[1700px] mx-auto">

        {/* ╔══════════════ LEFT / MAIN COLUMN ══════════════╗ */}
        <div className="space-y-6 min-w-0">

          {/* ── KPI CARDS ROW ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Stock Physique', val: fmtNum(kpis.stock_physique_total), sub: `${fmtNum(kpis.total_products)} produits`,
                icon: Warehouse, iconBg: 'bg-blue-600', cardBg: 'bg-blue-600', textCol: 'text-white',
                spark: [80, 95, 90, 110, 105, 120, kpis.stock_physique_total > 0 ? 130 : 100],
                badge: '+3.5%', badgeCol: 'bg-blue-500 text-blue-100'
              },
              {
                label: 'En Transit', val: fmtNum(kpis.stock_en_transit_total), sub: 'unités en route',
                icon: Truck, iconBg: 'bg-violet-100 text-violet-600', cardBg: 'bg-white', textCol: 'text-slate-800',
                spark: [20, 35, 25, 40, 38, 50, kpis.stock_en_transit_total > 0 ? 55 : 30],
                badge: null
              },
              {
                label: 'Stock Réservé', val: fmtNum(kpis.stock_reserve_total), sub: `${kpis.low_stock_list.length} alertes stock`,
                icon: Lock, iconBg: 'bg-orange-100 text-orange-600', cardBg: 'bg-white', textCol: 'text-slate-800',
                spark: null, badge: null, alert: kpis.low_stock_list.length > 0
              },
              {
                label: 'Valorisation', val: fmtCurrency(kpis.total_stock_value), sub: 'MAD total inventaire',
                icon: Coins, iconBg: 'bg-emerald-100 text-emerald-600', cardBg: 'bg-white', textCol: 'text-slate-800',
                spark: [60, 72, 68, 85, 90, 95, 100], badge: null
              }
            ].map((k, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}
                className={`${k.cardBg} rounded-2xl p-5 shadow-sm border border-white/50 relative overflow-hidden cursor-pointer`}>
                {k.cardBg === 'bg-blue-600' && (
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white" />
                    <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.cardBg === 'bg-blue-600' ? 'bg-blue-500' : k.iconBg}`}>
                    <k.icon size={16} className={k.cardBg === 'bg-blue-600' ? 'text-white' : ''} />
                  </div>
                  <div className="flex items-center gap-2">
                    {k.badge && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${k.badgeCol}`}>{k.badge}</span>}
                    {k.alert && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1"><AlertTriangle size={8} />{kpis.low_stock_list.length}</span>}
                    <MoreHorizontal size={14} className={k.textCol === 'text-white' ? 'text-blue-300' : 'text-slate-300'} />
                  </div>
                </div>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 relative z-10 ${k.textCol === 'text-white' ? 'text-blue-200' : 'text-slate-400'}`}>{k.label}</p>
                <h2 className={`text-2xl font-black tracking-tight relative z-10 ${k.textCol}`}>{k.val}</h2>
                {k.spark ? (
                  <div className="mt-3 relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-[9px] font-semibold ${k.textCol === 'text-white' ? 'text-blue-200' : 'text-slate-400'}`}>{k.sub}</p>
                    </div>
                    <div className={k.textCol === 'text-white' ? 'opacity-70' : 'opacity-60'}>
                      <Sparkline data={k.spark} color={k.textCol === 'text-white' ? '#93c5fd' : '#3b82f6'} />
                    </div>
                  </div>
                ) : (
                  <p className={`text-[9px] font-semibold mt-2 relative z-10 ${k.textCol === 'text-white' ? 'text-blue-200' : 'text-slate-400'}`}>{k.sub}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Stock evolution chart (2/3) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-blue-50 rounded-lg"><TrendingUp size={14} className="text-blue-600" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Aperçu du Stock</h3>
                  </div>
                  <div className="flex items-center gap-4 ml-8">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                      <span className="w-2.5 h-0.5 bg-blue-500 rounded inline-block" /> Stock total
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                      <span className="w-2.5 border-t border-dashed border-emerald-500 inline-block" /> Entrées
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                  >
                    <option value="30d">30 derniers jours</option>
                    <option value="7d">7 derniers jours</option>
                    <option value="90d">90 derniers jours</option>
                  </select>
                  <button onClick={handleExportStatsCSV} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 transition-all" title="Exporter les statistiques">
                    <Download size={13} />
                  </button>
                </div>
              </div>
              <div className="h-[200px]">
                {chartData ? <Line data={chartData} options={lineOptions} /> : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center opacity-20">
                      <BarChart2 size={32} className="mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase">Aucun historique</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Regional breakdown (1/3) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-violet-50 rounded-lg"><BarChart2 size={14} className="text-violet-600" /></div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Top Régions</h3>
              </div>
              <div className="flex-1">
                {regionChartData ? <Bar data={regionChartData} options={barOptions} /> : (
                  <div className="space-y-3 mt-2">
                    {[
                      { name: 'Casablanca', pct: 72, color: '#3b82f6' },
                      { name: 'Rabat', pct: 55, color: '#8b5cf6' },
                      { name: 'Marrakech', pct: 40, color: '#f59e0b' },
                      { name: 'Fès', pct: 30, color: '#10b981' },
                      { name: 'Tanger', pct: 20, color: '#ef4444' },
                    ].map((r, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] font-bold text-slate-600">{r.name}</span>
                          <span className="text-[9px] font-black text-slate-400">{r.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTTOM SECTION: Suppliers + Movements ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Top Clinics equivalent → Top Categories / Low Stock */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-50 rounded-lg"><AlertTriangle size={14} className="text-orange-500" /></div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Stocks Critiques</h3>
                </div>
                <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal size={14} /></button>
              </div>

              {/* Donut-style summary */}
              <div className="flex items-center justify-center py-4">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#3b82f6" strokeWidth="3"
                      strokeDasharray={`${(kpis.stock_disponible_total / Math.max(kpis.stock_physique_total, 1)) * 97.4} 97.4`}
                      strokeLinecap="round" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f59e0b" strokeWidth="3"
                      strokeDasharray={`${(kpis.stock_reserve_total / Math.max(kpis.stock_physique_total, 1)) * 97.4} 97.4`}
                      strokeDashoffset={`-${(kpis.stock_disponible_total / Math.max(kpis.stock_physique_total, 1)) * 97.4}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-slate-800">{fmtNum(kpis.stock_physique_total)}</span>
                    <span className="text-[8px] font-bold text-slate-400">unités</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Disponible', val: fmtNum(kpis.stock_disponible_total), color: 'bg-blue-500' },
                  { label: 'Réservé', val: fmtNum(kpis.stock_reserve_total), color: 'bg-orange-400' },
                  { label: 'En transit', val: fmtNum(kpis.stock_en_transit_total), color: 'bg-violet-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                      <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-800">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor schedule equivalent → Supplier Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg"><Truck size={14} className="text-blue-600" /></div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Fournisseurs</h3>
                </div>
                <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal size={14} /></button>
              </div>

              {/* Summary row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Actif', count: kpis.top_suppliers.filter(s => s.rating === 'A' || s.rating === 'B').length || 0, col: 'text-emerald-600' },
                  { label: 'À risque', count: kpis.top_suppliers.filter(s => s.rating === 'C').length || 0, col: 'text-orange-500' },
                  { label: 'Critique', count: kpis.top_suppliers.filter(s => s.rating === 'D').length || 0, col: 'text-red-500' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-xl bg-slate-50">
                    <p className={`text-base font-black ${s.col}`}>{s.count.toString().padStart(2, '0')}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{s.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <span>Liste Fournisseurs</span>
                <ChevronDown size={10} />
              </p>

              <div className="space-y-3 overflow-y-auto max-h-[180px] pr-1">
                {kpis.top_suppliers.length > 0 ? kpis.top_suppliers.map((s, i) => {
                  const st = STATUS_MAP[s.rating] || STATUS_MAP.D;
                  return (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">
                          {(s.nom || '?').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-700 leading-none truncate max-w-[90px]">{s.nom}</p>
                          <p className="text-[8px] text-slate-400 font-semibold mt-0.5">{s.commandes_count} cmd</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-1 rounded-lg ${st.bg} ${st.text}`}>{st.label}</span>
                    </div>
                  );
                }) : (
                  <div className="text-center py-6 opacity-20">
                    <Truck size={24} className="mx-auto mb-1" />
                    <p className="text-[9px] font-bold">Aucun fournisseur</p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment equivalent → Recent Movements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded-lg"><ArrowLeftRight size={14} className="text-emerald-600" /></div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Flux Récents</h3>
                </div>
                <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal size={14} /></button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1">
                {recentMovements.length > 0 ? recentMovements.slice(0, 8).map((m, i) => (
                  <div key={i} className="flex items-center justify-between group hover:bg-slate-50 -mx-2 px-2 py-2 rounded-xl transition-all cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${m.type === 'entree' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        {m.type === 'entree'
                          ? <ArrowUpRight size={14} className="text-emerald-600" />
                          : <ArrowDownRight size={14} className="text-red-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[90px] leading-none">{m.produit?.nom || '—'}</p>
                        <p className="text-[8px] text-slate-400 font-semibold mt-0.5 truncate">{m.type === 'entree' ? 'Entrée' : 'Sortie'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[10px] font-black ${m.type === 'entree' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.type === 'entree' ? '+' : '-'}{m.quantite}
                      </p>
                      <p className="text-[8px] text-slate-400 font-semibold">
                        {new Date(m.created_at || m.date_mouvement).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full py-8 opacity-20">
                    <History size={28} className="mb-2" />
                    <p className="text-[10px] font-bold">Aucun mouvement</p>
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/movements')} className="mt-4 w-full py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2">
                Voir tout <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* ── PERFORMANCE PARTNERS + AI ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* AI Suggestion */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-violet-500/10 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg"><BrainCircuit size={14} className="text-blue-400" /></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300">IA · Recommandation</h3>
                </div>
                {kpis.ai_suggestions ? (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                      <Sparkles size={20} className="text-yellow-400 mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-white leading-relaxed">
                        Commander <span className="text-blue-300 font-black">{kpis.ai_suggestions.eoq} unités</span>
                        <br />de <span className="text-blue-300">{kpis.ai_suggestions.nom}</span>
                      </p>
                    </div>
                    <button onClick={handleCreateAIOrder} disabled={ordering}
                      className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {ordering ? <><Loader2 size={12} className="animate-spin" /> Génération…</> : <><Plus size={12} /> Commander</>}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6 opacity-30">
                    <BrainCircuit size={24} className="mx-auto mb-2" />
                    <p className="text-[10px] font-bold">Analyse en cours…</p>
                  </div>
                )}
                {/* Health score */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Santé Globale</span>
                    <span className="text-[9px] font-black" style={{ color: healthColor }}>{healthPct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${healthPct}%`, backgroundColor: healthColor }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Partners Performance (tabs: Suppliers / Users) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded-lg"><Star size={14} className="text-emerald-600" /></div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Performance Partenaires</h3>
                </div>
                <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-xl">
                  <button onClick={() => setPerfTab('suppliers')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${perfTab === 'suppliers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                    Fournisseurs
                  </button>
                  <button onClick={() => setPerfTab('users')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${perfTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                    Utilisateurs
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {perfTab === 'suppliers' ? (
                    <motion.div key="sup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2">
                      {/* Header */}
                      <div className="grid grid-cols-[1fr_80px_80px_60px] gap-2 px-3 mb-2">
                        {['Fournisseur', 'Commandes', 'Fiabilité', 'Cote'].map(h => (
                          <span key={h} className="text-[8px] font-black uppercase tracking-widest text-slate-400">{h}</span>
                        ))}
                      </div>
                      {kpis.top_suppliers.length > 0 ? kpis.top_suppliers.map((s, i) => {
                        const st = STATUS_MAP[s.rating] || STATUS_MAP.D;
                        const reliability = s.rating === 'A' ? 98 : s.rating === 'B' ? 85 : s.rating === 'C' ? 65 : 40;
                        return (
                          <div key={i} className="grid grid-cols-[1fr_80px_80px_60px] gap-2 items-center p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0 group-hover:from-blue-600 group-hover:to-blue-800 transition-all">
                                {(s.nom || '?').substring(0, 1).toUpperCase()}
                              </div>
                              <p className="text-[10px] font-bold text-slate-700 truncate">{s.nom}</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{s.commandes_count} cmd</span>
                            <div className="flex items-center gap-1">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${reliability}%` }} />
                              </div>
                              <span className="text-[8px] font-black text-slate-400 w-7">{reliability}%</span>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-1 rounded-lg text-center ${st.bg} ${st.text}`}>
                              {s.rating || '—'}
                            </span>
                          </div>
                        );
                      }) : (
                        <div className="text-center py-10 opacity-20"><Truck size={28} className="mx-auto mb-2" /><p className="text-xs font-bold">Aucun fournisseur</p></div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="usr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2">
                      <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-3 mb-2">
                        {['Utilisateur', 'Opérations', 'Activité'].map(h => (
                          <span key={h} className="text-[8px] font-black uppercase tracking-widest text-slate-400">{h}</span>
                        ))}
                      </div>
                      {kpis.top_users.length > 0 ? kpis.top_users.map((u, i) => {
                        const maxOps = Math.max(...kpis.top_users.map(x => x.total || 0), 1);
                        const pct = Math.round(((u.total || 0) / maxOps) * 100);
                        return (
                          <div key={i} className="grid grid-cols-[1fr_80px_80px] gap-2 items-center p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">
                                {(u.user?.name || '?').substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-700 truncate">{u.user?.name || '—'}</p>
                                <p className="text-[8px] text-slate-400 font-semibold">Opérateur</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-700">{u.total}</span>
                            <div className="flex items-center gap-1">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[8px] font-black text-slate-400 w-7">{pct}%</span>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="text-center py-10 opacity-20"><Users size={28} className="mx-auto mb-2" /><p className="text-xs font-bold">Aucun utilisateur</p></div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black">
                  <AlertTriangle size={13} />
                  <span>{kpis.low_stock_list.length} produits sous seuil</span>
                </div>
                <button onClick={() => navigate('/products')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                  Inventaire <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

        </div>
        {/* ╚══════════════ END LEFT COLUMN ══════════════╝ */}

        {/* ╔══════════════ RIGHT SIDEBAR ══════════════╗ */}
        <div className="space-y-4">

          {/* ── FULL MONTH CALENDAR ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                <ChevronLeft size={14} />
              </button>
              <h3 className="text-xs font-black text-slate-800 capitalize">
                {calMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 px-3 pt-3">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} className="text-center text-[9px] font-black text-slate-300 pb-2">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
              {calendarGrid.map((d, i) => {
                if (!d) return <div key={i} />;
                const today = new Date();
                const isToday = d.toDateString() === today.toDateString();
                const isSelected = d.toDateString() === selectedDate.toDateString();
                const hasEv = hasEvent(d);
                return (
                  <button key={i} onClick={() => setSelectedDate(d)}
                    className={`relative w-8 h-8 mx-auto flex flex-col items-center justify-center rounded-lg text-[10px] font-black transition-all
                      ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : isToday ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {d.getDate()}
                    {hasEv && !isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />}
                  </button>
                );
              })}
            </div>

            {/* Activity detail (agenda items for selected date) */}
            <div className="border-t border-slate-50 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Activité du jour</h4>
                <button onClick={() => navigate('/orders')} className="text-[9px] font-black text-blue-600 flex items-center gap-1">+ Ajouter</button>
              </div>
              {agendaItems.length > 0 ? (
                <div className="space-y-2">
                  {agendaItems.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                      <div className={`w-1.5 h-6 rounded-full flex-shrink-0 ${item.agendaType === 'liberation' ? 'bg-orange-400' : 'bg-blue-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black text-slate-700 truncate">
                          {item.agendaType === 'liberation' ? item.produit_nom : item.reference}
                        </p>
                        <p className="text-[8px] text-slate-400 font-semibold">
                          {item.agendaType === 'liberation' ? 'Sortie prévue' : `Entrée · ${item.fournisseur_nom || ''}`}
                        </p>
                      </div>
                      <span className="text-[8px] font-black text-slate-400 flex-shrink-0">
                        {item.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 opacity-20">
                  <Calendar size={20} className="mb-1" />
                  <p className="text-[9px] font-bold">Aucun événement</p>
                </div>
              )}
            </div>
          </div>

          {/* ── ACTIVE ALERTS ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 rounded-lg"><AlertTriangle size={14} className="text-red-500" /></div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Alertes Actives</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 bg-red-50 text-red-600 rounded-full">{activeAlerts.length}</span>
            </div>
            <div className="space-y-2">
              {activeAlerts.length > 0 ? activeAlerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-red-50 transition-all cursor-pointer group">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-700 truncate">{a.produit?.nom || a.message || 'Alerte stock'}</p>
                    <p className="text-[8px] text-slate-400 font-semibold">{a.type || 'stock_bas'}</p>
                  </div>
                  <ArrowRight size={11} className="text-slate-300 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>
              )) : (
                <div className="flex flex-col items-center py-4 opacity-20">
                  <Shield size={20} className="mb-1" />
                  <p className="text-[9px] font-bold">Aucune alerte active</p>
                </div>
              )}
            </div>
            <button onClick={() => navigate('/alerts')} className="mt-3 w-full py-2 rounded-xl bg-slate-50 border border-slate-200 text-[9px] font-black text-red-600 uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all">
              Voir toutes les alertes →
            </button>
          </div>

          {/* ── QUICK ACTIONS ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Nouveau Mouvement', icon: ArrowLeftRight, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', path: '/movements' },
                { label: 'Nouvelle Commande', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', path: '/orders' },
                { label: 'Ajouter Produit', icon: Package, color: 'bg-violet-50 text-violet-600 hover:bg-violet-100', path: '/products/add' },
                { label: 'Analyses IA', icon: BrainCircuit, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', path: '/ai-insights' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${a.color}`}>
                  <a.icon size={16} />
                  <span className="text-[8px] font-black text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
        {/* ╚══════════════ END RIGHT SIDEBAR ══════════════╝ */}

      </div>
    </div>
  );
}
