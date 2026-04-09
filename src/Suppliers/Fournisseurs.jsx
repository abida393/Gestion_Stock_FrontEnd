import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Mail, 
  Phone, 
  Smartphone,
  MapPin, 
  Package, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Monitor
} from 'lucide-react';

const suppliers = [
  {
    name: 'Global Logistics Inc.',
    location: 'Francfort, Allemagne',
    email: 'contact@global-logistics.de',
    mobile: '+49 152 345678',
    fixed: '+49 69 1234567',
    linkedProducts: 142,
    status: 'ACTIF',
    statusColor: 'bg-teal-50 text-teal-700',
    icon: Monitor
  },
  {
    name: 'Apex Components Ltd',
    location: 'Shenzhen, Chine',
    email: 'supply@apex-comp.cn',
    mobile: '+86 138 0013 8000',
    fixed: '+86 755 9876 5432',
    linkedProducts: 8,
    status: 'EN RÉVISION',
    statusColor: 'bg-orange-50 text-orange-700',
    icon: Monitor
  },
  {
    name: 'Nordic Paper & Pulp',
    location: 'Oslo, Norvège',
    email: 'order@nordic-paper.no',
    mobile: '+47 912 34 567',
    fixed: '+47 22 33 44 55',
    linkedProducts: 24,
    status: 'PRIVILÉGIÉ',
    statusColor: 'bg-blue-50 text-blue-700',
    icon: Monitor
  },
  {
    name: 'FastTrack Express',
    location: 'Chicago, USA',
    email: 'support@fasttrack.com',
    mobile: '+1 312 555 0100',
    fixed: '+1 312 222 3344',
    linkedProducts: 19,
    status: 'ACTIF',
    statusColor: 'bg-teal-50 text-teal-700',
    icon: Monitor
  },
  {
    name: 'Vintage Inks Co.',
    location: 'Milan, Italie',
    email: 'billing@vintage-inks.it',
    mobile: '+39 345 678 9012',
    fixed: '+39 02 8765 4321',
    linkedProducts: 0,
    status: 'INACTIF',
    statusColor: 'bg-red-50 text-red-700',
    icon: Monitor
  }
];

export default function Fournisseurs() {
  const [viewMode, setViewMode] = React.useState('list'); 
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Répertoire des Fournisseurs</h1>
           <p className="mt-2 text-slate-500 font-medium">Gérez et survoyez 24 partenariats mondiaux actifs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/suppliers/add')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter un fournisseur
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher des fournisseurs par nom, région ou produit..." 
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
        />
      </div>

      {/* Suppliers Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <s.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.statusColor}`}>
                  {s.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">{s.name}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-6 text-[10px] uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5" />
                {s.location}
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-xs font-semibold truncate">{s.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Smartphone className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-xs font-semibold">{s.mobile}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-xs font-semibold">{s.fixed} <span className="text-[9px] text-slate-300 lowercase">(fixe)</span></span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-600">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-bold">{s.linkedProducts} produits liés</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {suppliers.map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors shrink-0">
                  <s.icon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">{s.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    {s.location}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-[2]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Contact</span>
                  <div className="flex items-center gap-2 text-slate-500 overflow-hidden">
                    <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                    <span className="text-xs font-semibold truncate">{s.email}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Téléphones</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Smartphone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span className="text-xs font-semibold">{s.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span className="text-xs font-semibold">{s.fixed} <span className="text-[9px] text-slate-300 lowercase">(fixe)</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Inventaire</span>
                  <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 bg-slate-50 rounded-xl text-slate-600 transition-colors group-hover:bg-blue-50/50">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-bold">{s.linkedProducts} produits liés</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center lg:justify-end gap-3 min-w-[140px]">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${s.statusColor}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400">
          Affichage <span className="text-slate-900">1 à 5</span> sur <span className="text-slate-900">24</span> fournisseurs
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
          {[1, 2, 3, '...', 5].map((num, idx) => (
            <button 
              key={idx} 
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                num === 1 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              {num}
            </button>
          ))}
          <button className="p-2 text-slate-400 hover:text-slate-600"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
