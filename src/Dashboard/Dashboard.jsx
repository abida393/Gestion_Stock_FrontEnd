import React from 'react';
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

const recentMovements = [
  { product: 'Logitech MX Master 3S', type: 'Entrant', qty: '+45', status: 'TERMINÉ', statusColor: 'bg-teal-100 text-teal-700' },
  { product: 'Apple MacBook Pro M3', type: 'Sortant', qty: '-12', status: 'TERMINÉ', statusColor: 'bg-teal-100 text-teal-700' },
  { product: 'SecretLab Titan EVO', type: 'Entrant', qty: '+8', status: 'EN ATTENTE', statusColor: 'bg-orange-100 text-orange-700' },
  { product: 'Dell UltraSharp 32', type: 'Sortant', qty: '-4', status: 'TERMINÉ', statusColor: 'bg-teal-100 text-teal-700' },
  { product: 'Câble Ethernet Générique', type: 'Ajustement', qty: '-150', status: 'SIGNALÉ', statusColor: 'bg-red-100 text-red-700' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tableau de bord</h1>
        <p className="text-sm font-medium text-slate-500 mt-1 pb-2">Lundi 22 Mai 2024</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex items-center text-emerald-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4 mr-1" />
              12%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Total Produits</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">12 482</p>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between border-l-[3px] border-l-red-500 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex items-center text-red-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4 mr-1" />
              3
            </div>
          </div>
          <div className="mt-4 z-10 relative">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Alertes Actives</p>
            <p className="text-3xl font-bold text-red-600 mt-1">5</p>
          </div>
        </div>

        {/* Movements Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div className="flex items-center text-emerald-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4 mr-1" />
              8%
            </div>
          </div>
          <div className="mt-4 z-10 relative">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Mouvements Aujourd'hui</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">842</p>
          </div>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start z-10 relative">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-700">
              <Banknote className="w-6 h-6" />
            </div>
            <div className="flex items-center text-red-500 text-sm font-semibold">
              <TrendingDown className="w-4 h-4 mr-1" />
              1.4%
            </div>
          </div>
          <div className="mt-4 z-10 relative">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Valeur Totale du Stock</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">€2.4M</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Evolution Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6 px-1">
            <h3 className="font-bold text-slate-900 text-lg">Évolution du Stock</h3>
          </div>
          <div className="flex-1 w-full relative min-h-[250px]">
             {/* Note: In a real environment with more time we'd make a custom chart component to match the exact overlay design, but ChartJS is close */}
            <Bar options={chartOptions} data={chartData} />
            {/* Overlay line mimicking design */}
            <div className="absolute top-[50%] left-0 right-0 h-px bg-slate-800 opacity-60 z-10 pointer-events-none"></div>
          </div>
        </div>

        {/* Top 5 moved products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Top 5 des produits mouvementés</h3>
          <div className="space-y-6">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700">{product.name}</span>
                  <span className="font-medium text-slate-500">{product.units} unités</span>
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

        {/* Intelligence Banner */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 rounded-2xl p-6 border border-blue-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-blue-900/60 mb-2 font-sans relative z-10">Intelligence</h4>
              <h3 className="text-2xl font-bold text-blue-900 mb-2 relative z-10 leading-tight">Générer le rapport de performance hebdomadaire ?</h3>
              <p className="text-sm text-blue-700/80 relative z-10 max-w-[500px] leading-relaxed font-medium">L'IA suggère que l'efficacité de votre inventaire a augmenté de 14 % ce mois-ci sur la base des derniers mouvements.</p>
            </div>
            <button className="bg-blue-950 text-white text-[13px] font-bold px-6 py-3.5 rounded-xl flex items-center gap-2 hover:bg-black transition-colors relative z-10 shadow-lg w-fit">
              Générer le Rapport <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
