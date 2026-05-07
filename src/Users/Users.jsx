import React, { useState, useEffect } from 'react';
import { 
    Users as UsersIcon, Search, Plus, Mail, Shield, 
    Calendar, MoreVertical, Edit2, Trash2, X, Check,
    Loader2, ChevronLeft, ChevronRight, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import userService from '../services/userService';
import roleService from '../services/roleService';
import authService from '../services/authService';

const Users = () => {
    // States
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    
    // Modal & Action States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    const currentUser = authService.getUser();

    // Fetch Data
    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await userService.getAll({ page });
            setUsers(response.data || []);
            setPagination({
                current_page: response.meta?.current_page || 1,
                last_page: response.meta?.last_page || 1
            });
        } catch (error) {
            toast.error("Erreur lors du chargement des utilisateurs.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await roleService.getAllRoles();
            setRoles(response.data || response || []);
        } catch (error) {
            console.error("Erreur roles:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    // Filter Logic (Client-side as requested)
    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleOpenAddModal = () => {
        setSelectedUser(null);
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setIsEditModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        const roleName = user.roles && user.roles.length > 0 
            ? (typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0].name)
            : 'user';
        
        setFormData({
            name: user.name,
            email: user.email,
            password: '', 
            role: roleName
        });
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (user) => {
        if (user.id === currentUser?.id) {
            toast.error("Vous ne pouvez pas supprimer votre propre compte.");
            return;
        }
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (selectedUser) {
                // Update
                await userService.update(selectedUser.id, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    ...(formData.password ? { password: formData.password } : {})
                });
                
                toast.success("Utilisateur mis à jour avec succès.");
            } else {
                // Create
                await userService.create({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                });
                
                toast.success("Utilisateur créé avec succès.");
            }
            setIsEditModalOpen(false);
            fetchUsers(pagination.current_page);
        } catch (error) {
            const msg = error.response?.data?.message || "Une erreur est survenue.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await userService.remove(selectedUser.id);
            toast.success("Utilisateur supprimé.");
            setIsDeleteModalOpen(false);
            fetchUsers(pagination.current_page);
        } catch (error) {
            toast.error("Erreur lors de la suppression.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
    };

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <UsersIcon className="text-blue-600" size={28} />
                        Gestion des Utilisateurs
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Gérez les accès et les rôles de votre équipe</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-[13px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all w-full md:w-64"
                        />
                    </div>
                    <button 
                        onClick={handleOpenAddModal}
                        className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-xs font-bold hover:bg-black transition-all active:scale-95 shadow-md flex items-center gap-2"
                    >
                        <Plus size={16} /> Ajouter
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rôle</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Créé le</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                // Skeleton Loader
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                                                <div className="h-4 bg-slate-100 rounded w-24"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-full w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4 text-right"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                                                <UsersIcon className="text-slate-300" size={24} />
                                            </div>
                                            <p className="text-[13px] font-bold text-slate-400">Aucun utilisateur trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const roleObj = user.roles?.[0];
                                    const roleName = typeof roleObj === 'string' ? roleObj : roleObj?.name;
                                    const isSelf = user.id === currentUser?.id;
                                    
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500">
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-slate-700">{user.name} {isSelf && <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 ml-1">(Vous)</span>}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
                                                    <Mail size={12} className="text-slate-400" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                    roleName?.toLowerCase().includes('admin') 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {roleName || 'Utilisateur'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[12px] font-semibold text-slate-400">
                                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-right">
                                                    <button 
                                                        onClick={() => handleOpenEditModal(user)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenDeleteModal(user)}
                                                        disabled={isSelf}
                                                        className={`p-1.5 rounded-lg transition-all ${isSelf ? 'opacity-20 cursor-not-allowed text-slate-300' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Page {pagination.current_page} sur {pagination.last_page}
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={pagination.current_page <= 1}
                            onClick={() => fetchUsers(pagination.current_page - 1)}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={pagination.current_page >= pagination.last_page}
                            onClick={() => fetchUsers(pagination.current_page + 1)}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Add/Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                                    {selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                                </h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nom Complet</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            placeholder="Ex: Jean Dupont"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            placeholder="nom@exemple.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Mot de passe {selectedUser && <span className="text-[9px] font-bold text-slate-300 normal-case ml-1">(Laissez vide pour conserver l'actuel)</span>}
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            required={!selectedUser}
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rôle</label>
                                    <select 
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        disabled={selectedUser?.id === currentUser?.id}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                                    >
                                        <option value="user">Utilisateur</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                    {selectedUser?.id === currentUser?.id && (
                                        <p className="text-[10px] font-bold text-amber-500 mt-2 ml-1 flex items-center gap-1">
                                            <Shield size={10} /> Vous ne pouvez pas modifier votre propre rôle.
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 bg-slate-100 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-slate-900 text-white rounded-lg px-4 py-2.5 text-xs font-bold hover:bg-black transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        {selectedUser ? 'Enregistrer' : 'Créer l\'utilisateur'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-xs p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-100 mx-auto mb-4">
                                <Trash2 className="text-red-500" size={20} />
                            </div>
                            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">Suppression</h3>
                            <p className="text-[13px] text-slate-500 font-bold mb-6">
                                Voulez-vous vraiment supprimer l'utilisateur <span className="text-slate-800 font-black">{selectedUser?.name}</span> ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 bg-slate-100 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold hover:bg-slate-200 transition-all font-black uppercase tracking-wider"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-red-500 text-white rounded-lg px-4 py-2.5 text-xs font-bold hover:bg-red-600 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 font-black uppercase tracking-wider"
                                >
                                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Supprimer'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Users;
