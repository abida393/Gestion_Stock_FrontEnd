import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  Package
} from 'lucide-react';

export default function AddFournisseur() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/suppliers" className="hover:text-slate-600 transition-colors">Fournisseurs</Link>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-bold">Ajouter un fournisseur</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Fournisseur</h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">Enregistrez un nouveau partenaire commercial dans le système.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* General Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Informations Générales</h2>
          
          <div className="space-y-6">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Nom de l'entreprise</label>
              <input 
                type="text" 
                placeholder="Ex: Global Logistics Inc."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500/50 focus:bg-white rounded-lg text-slate-900 placeholder:text-slate-300 transition-all outline-none font-medium text-sm"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Adresse Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="contact@fournisseur.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500/50 focus:bg-white rounded-lg text-slate-900 placeholder:text-slate-300 transition-all outline-none font-medium text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Numéro de téléphone</label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="tel" 
                    placeholder="+33 1 23 45 67 89"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500/50 focus:bg-white rounded-lg text-slate-900 placeholder:text-slate-300 transition-all outline-none font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Adresse</label>
              <textarea 
                rows="3"
                placeholder="Saisissez l'adresse complète du siège..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500/50 focus:bg-white rounded-lg text-slate-900 placeholder:text-slate-300 transition-all outline-none font-medium text-sm resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Linked Products Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Produits Liés</h2>
              <p className="text-[11px] font-semibold text-slate-400">Gérez le catalogue associé à ce fournisseur.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-teal-100 transition-all">
              <Plus size={14} />
              Lier un produit
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Produit</th>
                  <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Prix Unitaire</th>
                  <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Délai</th>
                  <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                <tr className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-all border border-slate-100">
                        <Package size={16} />
                      </div>
                      <span className="text-[14px] font-bold text-slate-800">Tiges d'acier 12mm</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-black text-slate-700">12.40 €</td>
                  <td className="px-8 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-widest">
                      14 Jours
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center">
                       <button className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all border border-transparent hover:border-red-100">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer / Action Bar */}
      <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-end gap-4 z-20">
         <button 
           onClick={() => navigate('/suppliers')}
           className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all"
         >
           Annuler
         </button>
         <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0a1d37] text-white rounded-lg text-xs font-bold hover:bg-black transition-all shadow-md">
           <Save size={16} className="text-white/70" />
           Enregistrer
         </button>
      </div>
    </div>
  );
}
