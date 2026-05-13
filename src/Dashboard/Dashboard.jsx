import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowLeftRight,
  Banknote,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ArrowRight,
  HeartPulse,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import movementService from '../services/movementService';
import productService from '../services/productService';
import { isAdmin } from '../services/permissionHelper';
import api from '../services/api';
import alertService from '../services/alertService';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#64748b',
      titleFont: { size: 10, weight: '700', family: 'Inter' },
      bodyColor: '#0f172a',
      bodyFont: { size: 13, weight: '900', family: 'Inter' },
      padding: 16,
      cornerRadius: 16,
      displayColors: false,
      borderColor: '#f1f5f9',
      borderWidth: 1,
      caretSize: 6,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      callbacks: {
        label: (context) => `Stock : ${context.parsed.y} unités`,
        footer: (context) => {
          const val = context[0].parsed.y;
          return val < -10 ? '⚠ Sorties élevées' : val > 10 ? '✓ Réappro.' : 'Activité stable';
        }
      },
      footerFont: { size: 9, weight: '600', family: 'Inter' },
      footerColor: '#94a3b8',
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 10,
          weight: '500',
          family: 'Inter'
        }
      }
    },
    y: {
      grid: {
        display: true,
        color: '#f1f5f9',
        drawBorder: false,
        borderDash: [5, 5],
      },
      ticks: {
        display: false,
        maxTicksLimit: 4,
      }
    }
  },
  elements: {
    line: {
      tension: 0.5,
      borderWidth: 3,
      borderColor: '#10b981',
      capStyle: 'round',
    },
    point: {
      radius: 0,
      hitRadius: 20,
      hoverRadius: 8,
      hoverBorderWidth: 4,
      hoverBorderColor: '#ffffff',
      hoverBackgroundColor: '#10b981',
    }
  },
  interaction: {
    mode: 'index',
    intersect: false,
  }
};



const WEEK_LABELS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const TOP5_COLORS = ['bg-teal-700', 'bg-emerald-600', 'bg-blue-600', 'bg-indigo-500', 'bg-teal-800'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    total_products: null,
    active_alerts: null,
    movements_this_month: null,
    total_stock_value: null,
    low_stock_count: null,
    pending_orders: null,
  });
  const [recentMovements, setRecentMovements] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);


  useEffect(() => {
    // Load KPIs
    dashboardService.getKPIs().then((data) => {
      setKpis({
        total_products:       data.total_products        ?? null,
        active_alerts:        data.active_alerts         ?? null,
        movements_this_month: data.movements_this_month  ?? null,
        total_stock_value:    data.total_stock_value     ?? null,
        low_stock_count:      data.low_stock_count       ?? null,
        pending_orders:       data.pending_orders        ?? null,
      });
    }).catch(() => {});

    // Load recent movements & chart
    // Recent movements for table
    movementService.getAll({ per_page: 5 }).then((data) => {
      const list = Array.isArray(data) ? data.slice(0, 5) : (data.data ?? []).slice(0, 5);
      if (list.length > 0) {
        setRecentMovements(list.map((m) => {
          const isEntry = (m.type ?? '').toLowerCase().includes('entree') || (m.type ?? '').toLowerCase() === 'in';
          const qty = m.quantite ?? m.quantity ?? 0;
          const rawDate = m.date_mouvement || m.date || m.created_at;
          return {
            product: m.product?.nom ?? m.product?.name ?? m.produit?.nom ?? m.produit?.name ?? '—',
            date: rawDate ? new Date(rawDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—',
            type: isEntry ? 'Entrant' : 'Sortant',
            qty: isEntry ? `+${qty}` : `-${qty}`,
            status: 'TERMINÉ',
            statusColor: 'bg-teal-100 text-teal-700',
            user: m.user?.name ?? m.user?.nom ?? m.utilisateur?.name ?? m.utilisateur?.nom ?? 'Agent',
            isEntry,
          };
        }));
      } else {
        setRecentMovements([]);
      }
    }).catch(() => {
      setRecentMovements([]);
    });

    // All movements for weekly chart
    movementService.getAll().then((data) => {
      const all = Array.isArray(data) ? data : (data.data ?? []);
      const now = new Date();
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);
      const entrees = Array(7).fill(0);
      const sorties = Array(7).fill(0);
      all.forEach(m => {
        const rawDate = m.date_mouvement || m.date || m.created_at;
        if (!rawDate) return;
        const d = new Date(rawDate);
        const diff = Math.floor((d - weekStart) / (1000 * 60 * 60 * 24));
        if (diff < 0 || diff > 6) return;
        const isEntry = (m.type ?? '').toLowerCase().includes('entree');
        const qty = m.quantite ?? m.quantity ?? 0;
        if (isEntry) entrees[diff] += qty;
        else sorties[diff] += qty;
      });
      setChartData({
        labels: WEEK_LABELS,
        datasets: [
          { 
            label: 'Flux net', 
            data: entrees.map((e, i) => e - sorties[i]), 
            borderColor: '#10b981', 
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
              gradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.1)');
              gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
              return gradient;
            },
            fill: true,
            tension: 0.5,
          },
        ],
      });
    }).catch(() => {
      setChartData({
        labels: WEEK_LABELS,
        datasets: [
          { label: 'Flux net', data: Array(7).fill(0), borderColor: '#0f766e', fill: true, tension: 0.4 },
        ],
      });
    });

    // Load top 5 products by stock
    productService.getAll().then((data) => {
      const all = Array.isArray(data) ? data : (data.data ?? []);
      const sorted = [...all]
        .sort((a, b) => (b.quantite ?? b.quantite_stock ?? b.stock ?? 0) - (a.quantite ?? a.quantite_stock ?? a.stock ?? 0))
        .slice(0, 5);
      const maxQty = sorted[0] ? (sorted[0].quantite ?? sorted[0].quantite_stock ?? sorted[0].stock ?? 1) : 1;
      setTopProducts(sorted.map((p, i) => {
          const qty = p.quantite ?? p.quantite_stock ?? p.stock ?? 0;
          const threshold = p.seuil_min ?? p.seuil_minimum ?? 0;
          const isCritical = qty <= threshold;
          const isWarning = qty <= threshold * 1.5;

          return {
            name: p.nom ?? p.name ?? '—',
            units: qty,
            color: isCritical ? 'from-red-500 to-red-600' : isWarning ? 'from-orange-400 to-orange-500' : 'from-teal-600 to-teal-700',
            percentage: Math.round((qty / maxQty) * 100),
          };
        }));
    }).catch(() => {});

    // Load inventory health score
    api.get('/ai/health-score').then(r => setHealthScore(r.data)).catch(() => {});

    // Load real active alerts
    alertService.getActive().then(res => {
      setActiveAlerts(res.data || res || []);
    }).catch(() => {
      console.error("Failed to load alerts");
    }).finally(() => {
      setLoadingAlerts(false);
    });
  }, []);

  const handleAIOrder = (alert) => {
    const product = alert.produit?.nom || "le produit";
    const event = new CustomEvent('open-chat-ai', { 
      detail: { 
        message: `Je souhaite passer une commande pour ${product} car il y a une alerte : ${alert.message}. Peux-tu me proposer une commande optimisée ?` 
      } 
    });
    window.dispatchEvent(event);
    toast.success(`L'IA analyse le stock pour ${product}...`);
  };

  const handleIgnoreAlert = async (id) => {
    try {
      await alertService.resolve(id);
      setActiveAlerts(prev => prev.filter(a => a.id !== id));
      toast.success("Alerte ignorée");
    } catch {
      toast.error("Erreur lors de la résolution");
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Tableau de bord</h1>
          <p className="text-[11px] font-bold text-slate-500 mt-1">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button 
          onClick={() => navigate('/movements')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <Plus size={18} />
          Nouveau mouvement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {/* Articles en inventaire */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              <Package size={20} />
            </div>
            <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp size={14} className="mr-1" /> Actif
            </div>
          </div>
          <div className="mt-6">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Articles en inventaire</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{kpis.total_products ?? '—'}</p>
            <div className="h-5 mt-2">
              {kpis.low_stock_count != null && (
                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {kpis.low_stock_count} seuils critiques
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Alertes de vigilance */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between border-l-[4px] border-l-red-500 relative overflow-hidden group hover:shadow-xl hover:shadow-red-100/50 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-3 rounded-2xl bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors duration-500">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-6 z-10 relative">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Alertes de vigilance</p>
            <p className="text-3xl font-black text-red-600 mt-1">{kpis.active_alerts ?? '—'}</p>
            <div className="h-5 mt-2">
              {kpis.pending_orders != null && (
                <p className="text-[10px] text-orange-500 font-bold">{kpis.pending_orders} réappro. en attente</p>
              )}
            </div>
          </div>
        </div>

        {/* Mouvements mensuels */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-500">
              <ArrowLeftRight size={20} />
            </div>
            <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
              <ArrowUpRight size={14} className="mr-0.5" /> +12%
            </div>
          </div>
          <div className="mt-6 z-10 relative">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Mouvements mensuels</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{kpis.movements_this_month ?? '—'}</p>
            <div className="h-5 mt-2"></div>
          </div>
        </div>

        {/* Valeur totale estimée */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-3 rounded-2xl bg-orange-50 text-orange-700 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
              <Banknote size={20} />
            </div>
            <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
              <ArrowUpRight size={14} className="mr-0.5" /> +4.2%
            </div>
          </div>
          <div className="mt-6 z-10 relative">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Valeur totale estimée</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {kpis.total_stock_value != null
                ? (() => {
                    const v = Number(kpis.total_stock_value);
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M MAD`;
                    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K MAD`;
                    return `${v.toLocaleString('fr-FR')} MAD`;
                  })()
                : '—'}
            </p>
            <div className="h-5 mt-2"></div>
          </div>
        </div>

        {/* Inventory Health Score */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-xl ${
              healthScore?.score >= 80 ? 'bg-emerald-50 text-emerald-700' :
              healthScore?.score >= 60 ? 'bg-blue-50 text-blue-700' :
              healthScore?.score >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
            }`}>
              <HeartPulse size={18} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Santé Inventaire</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className={`text-2xl font-black ${
                healthScore?.score >= 80 ? 'text-emerald-600' :
                healthScore?.score >= 60 ? 'text-blue-600' :
                healthScore?.score >= 40 ? 'text-amber-600' : 'text-red-600'
              }`}>{healthScore ? `${healthScore.score}%` : '—'}</p>
              <span className={`text-[10px] font-bold ${
                healthScore?.score >= 80 ? 'text-emerald-500' :
                healthScore?.score >= 60 ? 'text-blue-500' :
                healthScore?.score >= 40 ? 'text-amber-500' : 'text-red-500'
              }`}>{healthScore?.label ?? ''}</span>
            </div>
            <div className="h-4 mt-1">
              {healthScore && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className={`h-full rounded-full transition-all duration-1000 ${
                    healthScore.score >= 80 ? 'bg-emerald-500' :
                    healthScore.score >= 60 ? 'bg-blue-500' :
                    healthScore.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`} style={{ width: `${healthScore.score}%` }} />
                </div>
              )}
            </div>
            {healthScore && (
              <div className="mt-4 bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                  <span className="text-blue-600 not-italic font-black uppercase tracking-tighter mr-2">IA insight:</span>
                  {healthScore.score < 75 ? "Baisse de 4% suite à la rupture du Sucre 1kg" : "Stabilité optimale des flux prioritaires."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stock Evolution Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-base">Évolution du Stock</h3>
          </div>
          <div className="flex-1 w-full relative min-h-[220px]">
            {chartData ? (
              <Line options={chartOptions} data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[180px]">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-base mb-6">Top 5 — Stock</h3>
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] font-bold text-slate-700 truncate max-w-[150px]">{product.name}</span>
                    <span className="text-[11px] font-black text-slate-400 tabular-nums">{product.units.toLocaleString('fr-FR')} <span className="text-[9px] font-bold uppercase tracking-tighter">unités</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`bg-gradient-to-r ${product.color} h-2 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${product.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Recent movements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Mouvements récents</h3>
            <a href="/movements/history" className="text-teal-700 text-sm font-bold hover:underline">Voir tout</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-4 pl-1">Produit</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Qté</th>
                  <th className="pb-4">Utilisateur</th>
                  <th className="pb-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentMovements.map((move, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-all group cursor-default">
                    <td className="py-4 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                          {move.product.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700">{move.product}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400 font-bold text-[11px]">{move.date ?? '—'}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight ${
                        move.isEntry ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${move.isEntry ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {move.type}
                      </span>
                    </td>
                    <td className={`py-4 font-black text-[15px] ${move.qty?.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{move.qty}</td>
                    <td className="py-4 text-slate-500 font-bold text-[11px]">{move.user}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 text-[9px] font-black uppercase rounded-full tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                        {move.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Alertes actives</h3>
            <button className="text-teal-700 text-sm font-bold hover:underline">Voir tout</button>
          </div>

          <div className="flex flex-col gap-4">
            {loadingAlerts ? (
               <div className="flex items-center justify-center py-10">
                 <div className="w-6 h-6 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
               </div>
            ) : activeAlerts.length > 0 ? activeAlerts.map((alert) => (
              <div key={alert.id} className={`w-full p-4 rounded-xl border-l-[3px] flex items-center gap-4 shadow-sm border border-slate-100 ${
                alert.type === 'critique' || alert.type === 'rupture' ? 'bg-red-50 border-l-red-600' : 'bg-orange-50/50 border-l-orange-400'
              }`}>
                <div className={`p-2 rounded-lg ${
                  alert.type === 'critique' || alert.type === 'rupture' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{alert.message}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.produit?.nom ? `Produit : ${alert.produit.nom}` : 'Alerte système'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleIgnoreAlert(alert.id)}
                    className="bg-slate-200 text-slate-600 text-[10px] tracking-wide uppercase font-bold px-3 py-1.5 rounded-md hover:bg-slate-300 transition-colors flex-shrink-0"
                  >
                    Ignorer
                  </button>
                  <button 
                    onClick={() => handleAIOrder(alert)}
                    className="bg-slate-900 text-white text-[10px] tracking-wide uppercase font-bold px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors flex-shrink-0"
                  >
                    Commander
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucune alerte active</p>
              </div>
            )}
          </div>

        </div>

        {/* Intelligence Banner - Premium Redesign */}
        <div className="relative overflow-hidden rounded-[24px] bg-[#0f172a] p-8 shadow-2xl shadow-blue-900/10 transition-all duration-500 border border-white/5 group">
          {/* Animated Background Elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px] transition-transform duration-700 group-hover:scale-125"></div>
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-600/10 blur-[80px] transition-transform duration-700 group-hover:scale-125"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                  <TrendingUp size={14} className="animate-pulse" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400/80">
                  Système d'Intelligence
                </span>
              </div>
              
              <h3 className="text-[26px] font-black leading-tight tracking-tight text-white mb-3">
                Générer le rapport de performance <br className="hidden md:block" /> hebdomadaire ?
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-[2px] bg-gradient-to-b from-blue-500 to-transparent"></div>
                <p className="max-w-[500px] text-[14px] font-medium leading-relaxed text-slate-400">
                  L'IA suggère que l'efficacité de votre inventaire a <span className="text-emerald-400 font-bold">augmenté de 14 %</span> ce mois-ci sur la base des derniers mouvements de stock.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button className="group/btn relative flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-[14px] font-black text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95">
                <div className="absolute inset-0 bg-white/10 group-hover/btn:opacity-0 transition-opacity"></div>
                <span>Générer le Rapport</span>
              </button>
            </div>
          </div>
          
          {/* Subtle noise pattern or grid could be added here for more texture */}
        </div>
      </div>
    </div>
  );
}
