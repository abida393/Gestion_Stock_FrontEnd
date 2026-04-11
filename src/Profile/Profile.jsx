import React, { useState, useEffect } from 'react';
import {
  User, Mail, Shield, Smartphone,
  MapPin, Camera, Save, Key,
  LogOut, BellRing, Globe
} from 'lucide-react';
import authService from '../services/authService';

const Profile = () => {
  // État pour gérer les informations (Prêt pour ton Backend Laravel)
  const [user, setUser] = useState({
    nom: "",
    email: "",
    role: "",
    telephone: "",
    localisation: "",
    langue: "",
    timezone: ""
  });

  const [notifications, setNotifications] = useState({
    stockAlerts: true,
    mouvements: false,
    reports: true
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser({
        nom: currentUser.nom || currentUser.name || "Utilisateur",
        email: currentUser.email || "",
        role: currentUser.role || currentUser.role_id || "Utilisateur",
        telephone: currentUser.telephone || currentUser.phone || "",
        localisation: currentUser.localisation || "Non spécifié",
        langue: currentUser.langue || "Français",
        timezone: currentUser.timezone || "(GMT+01:00) Casablanca"
      });
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-12">

      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mon Profil</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Colonne Gauche : Carte Photo & Actions Rapides */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full bg-[#1e293b] rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl">
                {user.nom?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-blue-600 hover:scale-110 transition-transform">
                <Camera size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{user.nom}</h2>
            <p className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-1 rounded-full inline-block mt-2">
              {user.role}
            </p>

            <div className="mt-8 pt-8 border-t border-gray-50 space-y-3">
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-slate-600 font-bold text-sm">
                <span className="flex items-center gap-3"><Key size={18} /> Changer le mot de passe</span>
                <span className="text-gray-300">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-xl transition-colors text-red-500 font-bold text-sm">
                <span className="flex items-center gap-3"><LogOut size={18} /> Déconnexion</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0a192f] rounded-[2.5rem] p-8 text-white shadow-xl">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Shield size={18} className="text-teal-400" /> Sécurité du compte</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Votre compte est protégé par une authentification à deux facteurs. Dernière connexion : aujourd'hui à 14:20.
            </p>
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-xs font-medium">Statut du compte</span>
              <span className="text-[10px] font-black bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full uppercase">Vérifié</span>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Formulaire d'édition */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-8 border-b border-gray-50 pb-4">Informations Personnelles</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Nom Complet
                </label>
                <input
                  type="text"
                  value={user.nom}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Adresse Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Smartphone size={14} /> Téléphone
                </label>
                <input
                  type="text"
                  value={user.telephone}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> Localisation
                </label>
                <input
                  type="text"
                  value={user.localisation}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-8 border-b border-gray-50 pb-4">Préférences Système</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} /> Langue de l'interface
                </label>
                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 appearance-none">
                  <option>Français (FR)</option>
                  <option>Anglais (EN)</option>
                  <option>Arabe (AR)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} /> Fuseau Horaire
                </label>
                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 appearance-none">
                  <option>{user.timezone || "(GMT+01:00) Casablanca"}</option>
                  <option>(GMT+00:00) Londres</option>
                  <option>(GMT+02:00) Paris</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-8 border-b border-gray-50 pb-4">Préférences de Notifications</h3>
            
            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><BellRing size={16}/></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Alertes de Stock</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Être notifié quand un produit passe sous le seuil critique</p>
                  </div>
                </div>
                <div 
                  onClick={() => toggleNotification('stockAlerts')}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.stockAlerts ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${notifications.stockAlerts ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Smartphone size={16}/></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Mouvements Rapides</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Recevoir un résumé des mouvements inhabituels</p>
                  </div>
                </div>
                <div 
                  onClick={() => toggleNotification('mouvements')}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.mouvements ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${notifications.mouvements ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              
              {/* Toggle 3 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Mail size={16}/></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Rapports Hebdomadaires</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Envoi automatique du rapport d'inventaire par email</p>
                  </div>
                </div>
                <div 
                  onClick={() => toggleNotification('reports')}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.reports ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${notifications.reports ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end gap-4">
              <button className="px-8 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Annuler</button>
              <button className="bg-[#1e293b] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-100">
                <Save size={18} /> Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
