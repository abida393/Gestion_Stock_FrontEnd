import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Tag, Loader2, X, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import categoryService from '../services/categoryService';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '' });

  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError("Impossible de charger les catégories.");
      toast.error("Erreur serveur lors du chargement des catégories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setIsEdit(true);
      setEditingId(cat.id);
      setFormData({
        nom: cat.nom || cat.name || '',
        description: cat.description || ''
      });
    } else {
      setIsEdit(false);
      setEditingId(null);
      setFormData({ nom: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ nom: '', description: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom) {
      toast.error("Le nom de la catégorie est obligatoire.");
      return;
    }
    try {
      if (isEdit) {
        await categoryService.update(editingId, formData);
        toast.success("Catégorie modifiée avec succès.");
      } else {
        await categoryService.create(formData);
        toast.success("Catégorie créée avec succès.");
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement de la catégorie.");
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await categoryService.remove(categoryToDelete);
      toast.success("Catégorie supprimée.");
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      toast.error("Erreur lors de la suppression. Des produits y sont peut-être liés.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* MODAL SUPPRESSION */}
      <AnimatePresence>
        {categoryToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCategoryToDelete(null)}
              className="absolute inset-0 bg-slate-900/30"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[320px] bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100"
            >
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="p-4 bg-red-50 text-red-500 rounded-full">
                  <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Supprimer la catégorie ?</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                    Action irréversible. Impossible si des produits y sont rattachés.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3.5 bg-red-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200"
                >Oui, supprimer</button>
                <button 
                  onClick={() => setCategoryToDelete(null)}
                  className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                >Annuler</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL AJOUT/EDITION */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/20">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Nom de la catégorie *</label>
                  <input
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    autoFocus
                    placeholder="Ex: Périphériques, Laptops..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-slate-900 font-semibold text-sm outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Détails (optionnel)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-slate-900 font-semibold text-sm outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">Annuler</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                    {isEdit ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Catégories de produits</h1>
           <p className="mt-1 text-xs text-slate-400 font-medium">Structuration de votre inventaire de base.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all shadow-md active:scale-95"
        >
          <Plus size={16} /> Nouvelle Catégorie
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-extrabold tracking-widest text-slate-400">
                <th className="px-6 py-4">Nom de la catégorie</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Produits associés</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan={4} className="px-6 py-12 text-center border-t border-slate-100"><Loader2 className="w-6 h-6 text-slate-400 animate-spin inline" /></td></tr>
              ) : error ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-red-500 font-medium">{error}</td></tr>
              ) : categories.length === 0 ? (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 italic">Aucune catégorie trouvée. Créez-en une !</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                     <span className="text-[13px] font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg">{cat.nom || cat.name}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-[12px] text-slate-500 font-medium">{cat.description || <span className="italic text-slate-300">Aucune description</span>}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className="text-[12px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{cat.produits_count ?? cat.products_count ?? cat.produits?.length ?? cat.products?.length ?? '?'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(cat)} className="p-2 hover:bg-white hover:text-blue-600 text-slate-400 rounded-lg shadow-sm border border-transparent hover:border-slate-100 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setCategoryToDelete(cat.id)} className="p-2 hover:bg-white hover:text-red-500 text-slate-400 rounded-lg shadow-sm border border-transparent hover:border-slate-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
