import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Terminal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity
} from 'lucide-react';
import analysisService from '../services/analysisService';
import { motion, AnimatePresence } from 'framer-motion';

const AuditLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const FIELD_LABELS = {
    nom: 'Nom',
    description: 'Description',
    quantite: 'Quantité',
    prix: 'Prix',
    seuil_min: 'Seuil minimum',
    sku: 'SKU',
    categorie_id: 'Catégorie',
    fournisseur_id: 'Fournisseur',
    statut: 'Statut',
    total: 'Total',
    type: 'Type',
    note: 'Note',
    date_mouvement: 'Date du mouvement',
    produit_id: 'ID Produit',
    utilisateur_id: 'ID Utilisateur',
    stock_apres: 'Stock après',
    product_name: 'Nom Produit',
    supplier_name: 'Fournisseur'
  };

  const renderDataChanges = (data) => {
    if (!data) return null;
    return Object.keys(data).map(key => {
      if (['id', 'created_at', 'updated_at', 'password', 'remember_token', 'produit_id', 'fournisseur_id', 'categorie_id', 'utilisateur_id'].includes(key)) return null;
      const label = FIELD_LABELS[key] || key;
      const val = data[key];
      return (
        <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
          <span className="text-xs font-bold text-slate-700">
            {typeof val === 'boolean' ? (val ? 'Oui' : 'Non') : (val?.toString() || '—')}
          </span>
        </div>
      );
    });
  };

  useEffect(() => {
    setLoading(true);
    analysisService.getAuditLogs(page)
      .then(res => {
        setLogs(res.data);
        setTotalPages(res.last_page);
        setLoading(false);
      })
      .catch(err => {
        console.error("Audit logs fetch failed", err);
        setLoading(false);
      });
  }, [page]);

  const getEventBadge = (event) => {
    const styles = {
      created: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      updated: 'bg-blue-50 text-blue-700 border-blue-100',
      deleted: 'bg-red-50 text-red-700 border-red-100'
    };
    return (
      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${styles[event] || 'bg-slate-50 text-slate-600'}`}>
        {event === 'created' ? 'CRÉATION' : event === 'updated' ? 'MODIFICATION' : 'SUPPRESSION'}
      </span>
    );
  };

  const getModelName = (type) => {
    const parts = type.split('\\');
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Journal d'Audit</h2>
          <p className="text-slate-500 text-sm mt-1">Traçabilité complète des actions effectuées sur le système.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <div className="p-2 bg-slate-900 text-white rounded-xl">
             <Activity size={18} />
           </div>
           <div className="pr-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">État du système</p>
             <p className="text-sm font-black text-emerald-500">SURVEILLANCE ACTIVE</p>
           </div>
        </div>
      </header>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl overflow-hidden flex flex-col md:flex-row h-[700px]">
        {/* Logs Table */}
        <div className="flex-1 overflow-hidden flex flex-col border-r border-slate-50">
          <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Rechercher une action..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 hover:bg-white rounded-lg border border-slate-200 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-600">Page {page} / {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 hover:bg-white rounded-lg border border-slate-200 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                 <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
               </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4">Événement</th>
                    <th className="px-6 py-4">Entité</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                            {log.user?.nom?.substring(0, 2).toUpperCase() || 'SYS'}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{log.user?.nom || 'Système'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getEventBadge(log.event)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800">
                            {getModelName(log.auditable_type)} : {
                              log.new_values?.nom || log.new_values?.name || 
                              log.old_values?.nom || log.old_values?.name || 
                              `#${log.auditable_id}`
                            }
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Entité {log.auditable_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString('fr-FR')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Eye size={14} className="text-slate-300 group-hover:text-blue-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Log Details Sidebar */}
        <div className="w-full md:w-96 bg-slate-50/50 flex flex-col">
          <AnimatePresence mode="wait">
            {selectedLog ? (
              <motion.div 
                key={selectedLog.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 flex flex-col h-full overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-8">
                  <h3 className="font-black text-slate-900 tracking-tight">Détails de l'action</h3>
                  <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600"><Terminal size={18}/></button>
                </div>

                <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Changements de données</p>
                      <div className="space-y-3">
                        {selectedLog.event === 'updated' ? (
                          Object.keys(selectedLog.new_values).map(key => {
                            if (['id', 'created_at', 'updated_at', 'password', 'remember_token', 'produit_id', 'fournisseur_id', 'categorie_id', 'utilisateur_id'].includes(key)) return null;
                            return (
                            <div key={key} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors">
                              <span className="text-[10px] font-black text-blue-600 uppercase mb-2 block">{FIELD_LABELS[key] || key}</span>

                              <div className="flex flex-col gap-2">
                                <div className="text-xs line-through text-red-400 decoration-red-200/50 flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-red-300" />
                                  {JSON.stringify(selectedLog.old_values[key])}
                                </div>
                                <div className="text-xs font-black text-emerald-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {JSON.stringify(selectedLog.new_values[key])}
                                </div>
                              </div>
                            </div>
                            );
                          })
                        ) : (
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                             {renderDataChanges(selectedLog.event === 'created' ? selectedLog.new_values : selectedLog.old_values)}
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-40">
                <History size={48} className="mb-4 text-slate-300" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Sélectionnez une ligne pour voir les détails des changements</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
