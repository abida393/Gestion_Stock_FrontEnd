import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowLeftRight,
  Banknote,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dashboardService from '../services/dashboardService';
import movementService from '../services/movementService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
        color: '#64748b',
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#f8fafc',
      padding: 12,
      cornerRadius: 8,
    }
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 11,
          weight: '500'
        }
      }
    },
    y: {
      stacked: true,
      display: false, // Hide y-axis as per design
      grid: {
        display: false,
      }
    }
  },
  elements: {
    bar: {
      borderRadius: 4,
    }
  }
};

const chartData = {
  labels: ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'],
  datasets: [
    {
      label: 'Électronique',
      data: [65, 45, 60, 80, 55, 40, 50],
      backgroundColor: '#1e3a8a', // blue-900
      barThickness: 32,
    },
    {
      label: 'Mobilier',
      data: [45, 30, 45, 50, 40, 25, 30],
      backgroundColor: '#0f766e', // teal-700
      barThickness: 32,
    },
    {
      label: 'Fournitures',
      data: [35, 25, 30, 40, 35, 20, 25],
      backgroundColor: '#fcd34d', // amber-300
      barThickness: 32,
    },
  ],
};

const topProducts = [
  { name: 'Power Pro Battery', units: 420, color: 'bg-teal-700', percentage: 85 },
  { name: 'Chaise de bureau Ergo', units: 315, color: 'bg-emerald-600', percentage: 65 },
  { name: 'Hub USB-C v2', units: 290, color: 'bg-slate-300', percentage: 55 },
  { name: 'Écran LED 27"', units: 150, color: 'bg-blue-600', percentage: 35 },
  { name: 'Rame de papier A4', units: 120, color: 'bg-teal-800', percentage: 25 },
];

const staticRecentMovements = [
  { product: 'Logitech MX Master 3S', type: 'Entrant', qty: '+45', status: 'TERMINÉ', statusColor: 'bg-teal-100 text-teal-700' },
  { product: 'Apple MacBook Pro M3', type: 'Sortant', qty: '-12', status: 'TERMINÉ', statusColor: 'bg-teal-100 text-teal-700' },
  { product: 'SecretLab Titan EVO', type: 'Entrant', qty: '+8', status: 'EN ATTENTE', statusColor: 'bg-orange-100 text-orange-700' },
  { product: 'Dell UltraSharp 32', type: 'Sortant', qty: '-4', status: 'TERMINÉ', statusColor: 'bg-teal-100 text-teal-700' },
  { product: 'Câble Ethernet Générique', type: 'Ajustement', qty: '-150', status: 'SIGNALÉ', statusColor: 'bg-red-100 text-red-700' },
];

export default function Dashboard() {
  const [kpis, setKpis] = useState({ total_products: null, active_alerts: null, movements_today: null, stock_value: null });
  const [recentMovements, setRecentMovements] = useState(staticRecentMovements);

  useEffect(() => {
    // Load KPIs
    dashboardService.getKPIs().then((data) => {
      setKpis({
        total_products: data.total_products ?? data.produits_total ?? null,
        active_alerts: data.active_alerts ?? data.alertes_actives ?? null,
        movements_today: data.movements_today ?? data.mouvements_aujourd_hui ?? null,
        stock_value: data.stock_value ?? data.valeur_stock ?? null,
      });
    }).catch(() => {});

    // Load recent movements
    movementService.getAll({ per_page: 5 }).then((data) => {
      const list = Array.isArray(data) ? data.slice(0, 5) : (data.data ?? []).slice(0, 5);
      if (list.length > 0) {
        setRecentMovements(list.map((m) => {
          const isEntry = (m.type ?? '').toLowerCase().includes('entree') || (m.type ?? '').toLowerCase() === 'in';
          const qty = m.quantite ?? m.quantity ?? 0;
          return {
            product: m.product?.nom ?? m.product?.name ?? '—',
            type: isEntry ? 'Entrant' : 'Sortant',
            qty: isEntry ? `+${qty}` : `-${qty}`,
            status: 'TERMINÉ',
            statusColor: 'bg-teal-100 text-teal-700',
          };
        }));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Tableau de bord</h1>
        <p className="text-[11px] font-bold text-slate-500 mt-1">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Package size={18} />
            </div>
            <div className="flex items-center text-emerald-600 text-[11px] font-bold">
              <TrendingUp size={14} className="mr-1" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Total Produits</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{kpis.total_products ?? '—'}</p>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between border-l-[3px] border-l-red-500 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-4 z-10 relative">
            <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Alertes Actives</p>
            <p className="text-2xl font-black text-red-600 mt-0.5">{kpis.active_alerts ?? '—'}</p>
          </div>
        </div>

        {/* Movements Today */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
              <ArrowLeftRight size={18} />
            </div>
            <div className="flex items-center text-emerald-600 text-[11px] font-bold">
              <TrendingUp size={14} className="mr-1" />
            </div>
          </div>
          <div className="mt-4 z-10 relative">
            <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Flux Aujourd'hui</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{kpis.movements_today ?? '—'}</p>
          </div>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-700">
              <Banknote size={18} />
            </div>
          </div>
          <div className="mt-4 z-10 relative">
            <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Valeur du Stock</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {kpis.stock_value != null ? `€${Number(kpis.stock_value).toLocaleString('fr-FR')}` : '—'}
            </p>
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
             {/* Note: In a real environment with more time we'd make a custom chart component to match the exact overlay design, but ChartJS is close */}
            <Bar options={chartOptions} data={chartData} />
            {/* Overlay line mimicking design */}
            <div className="absolute top-[50%] left-0 right-0 h-px bg-slate-800 opacity-60 z-10 pointer-events-none"></div>
          </div>
        </div>

        {/* Top 5 moved products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-base mb-6">Top 5 Fluctuation</h3>
          <div className="space-y-5">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">{product.name}</span>
                  <span className="font-bold text-slate-400">{product.units} units</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`${product.color} h-1.5 rounded-full`} style={{ width: `${product.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Recent movements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Mouvements récents</h3>
            <button className="text-teal-700 text-sm font-bold hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-4 pl-1">Produit</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Qté</th>
                  <th className="pb-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentMovements.map((move, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pl-1 font-semibold text-slate-800">{move.product}</td>
                    <td className="py-4 text-slate-500 font-medium text-sm">{move.type}</td>
                    <td className={`py-4 font-bold ${move.qty.startsWith('+') ? 'text-slate-800' : 'text-slate-500'}`}>{move.qty}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wide ${move.statusColor}`}>
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
            {/* Alert 1 */}
            <div className="w-full p-4 bg-slate-50 rounded-xl border-l-[3px] border-l-red-600 flex items-center gap-4 shadow-sm border border-slate-100">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 truncate">Stock Critique Bas : Adaptateurs USB-C</h4>
                <p className="text-xs text-slate-500 mt-0.5">Plus que 3 unités restantes dans l'Entrepôt A.</p>
              </div>
              <button className="bg-slate-900 text-white text-[10px] tracking-wide uppercase font-bold px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors flex-shrink-0">
                Commander
              </button>
            </div>

            {/* Alert 2 */}
            <div className="w-full p-4 bg-orange-50/50 rounded-xl border-l-[3px] border-l-orange-400 flex items-center gap-4 shadow-sm border border-slate-100">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 truncate">Expédition Retardée : Global Logistics</h4>
                <p className="text-xs text-slate-500 mt-0.5">L'expédition #TR-982 a 48h de retard.</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Alert 3 */}
            <div className="w-full p-4 bg-slate-50 rounded-xl border-l-[3px] border-l-red-600 flex items-center gap-4 shadow-sm border border-slate-100">
              <div className="p-2 bg-black/5 rounded-lg text-red-600">
                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-0.5 bg-white rounded-full translate-x-px rotate-45 absolute border-none"></div>
                  <div className="w-2.5 h-0.5 bg-white rounded-full -translate-x-px -rotate-45 absolute border-none"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 truncate">Garantie Expirée : Chariot élévateur #4</h4>
                <p className="text-xs text-slate-500 mt-0.5">Inspection de sécurité requise avant le prochain service.</p>
              </div>
              <button className="bg-slate-200 text-slate-600 text-[10px] tracking-wide uppercase font-bold px-3 py-1.5 rounded-md hover:bg-slate-300 transition-colors flex-shrink-0">
                Ignorer
              </button>
            </div>
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
                <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-50">
                Prêt en 2 secondes
              </span>
            </div>
          </div>
          
          {/* Subtle noise pattern or grid could be added here for more texture */}
        </div>
      </div>
    </div>
  );
}
