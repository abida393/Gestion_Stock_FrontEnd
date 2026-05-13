import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertCircle, 
  ArrowRight, 
  Info,
  ChevronRight,
  Database
} from 'lucide-react';
import analysisService from '../services/analysisService';
import { motion } from 'framer-motion';

const ABCAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    analysisService.getABCAnalysis()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("ABC Analysis failed", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">L'IA analyse la rotation de vos stocks...</p>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-slate-500">Aucune donnée disponible pour l'analyse.</div>;

  const { summary, items } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Analyse ABC & Rotation</h2>
          <p className="text-slate-500 text-sm mt-1">Classification stratégique basée sur la valeur et la fréquence de mouvement.</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
          <Database size={16} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">{summary.total_items} Articles analysés</span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2 block">Classe A — Haute Priorité</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900">{summary.class_a_count}</h3>
            <span className="text-slate-400 font-bold text-sm">Produits</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-medium">Représentent environ 70% de la valeur totale de votre inventaire.</p>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">Classe B — Modéré</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900">{summary.class_b_count}</h3>
            <span className="text-slate-400 font-bold text-sm">Produits</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-medium">Représentent environ 20% de la valeur totale de votre inventaire.</p>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 mb-2 block">Classe C — Faible</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900">{summary.class_c_count}</h3>
            <span className="text-slate-400 font-bold text-sm">Produits</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-medium">Représentent environ 10% de la valeur totale de votre inventaire.</p>
        </div>
      </div>

      {/* Main Analysis Table */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Détails de l'analyse IA</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Valeur
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Rotation
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Valeur Stock</th>
                <th className="px-6 py-4">Rotation (30j)</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Suggestion IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.nom}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{item.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700">{item.valeur_totale.toLocaleString('fr-FR')} MAD</span>
                      <span className="text-[10px] text-slate-400 font-bold">{item.stock} unités × {item.prix} MAD</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-600">
                    {item.frequence_30j} mouvements
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black ring-1 ${
                        item.classe_valeur === 'A' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' :
                        item.classe_valeur === 'B' ? 'bg-blue-50 text-blue-700 ring-blue-100' :
                        'bg-slate-50 text-slate-400 ring-slate-100'
                      }`}>
                        {item.classe_valeur}
                      </span>
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black ring-1 ${
                        item.classe_rotation === 'A' ? 'bg-indigo-50 text-indigo-700 ring-indigo-100' :
                        item.classe_rotation === 'B' ? 'bg-cyan-50 text-cyan-700 ring-cyan-100' :
                        'bg-slate-50 text-slate-400 ring-slate-100'
                      }`}>
                        {item.classe_rotation}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {item.suggestions.length > 0 ? (
                      <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-xl border border-orange-100 max-w-xs shadow-sm">
                        <AlertCircle size={14} className="shrink-0" />
                        <span className="text-[11px] font-bold leading-snug">{item.suggestions[0]}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimisé</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ABCAnalysis;
