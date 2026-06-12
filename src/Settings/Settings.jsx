import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Bell,
  Palette,
  ShieldCheck,
  Save,
  Globe,
  Mail,
  Moon,
  Database,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    companyName: 'StockManager Inc.',
    currency: 'EUR',
    email: 'admin@stockmanager.com',
    language: 'fr',
    theme: localStorage.getItem('theme') || 'light',
    emailAlerts: true,
    aiReports: true,
    criticalStock: true,
    dataRetention: '365'
  });

  const handleChange = (key, value) => {
    if (key === 'theme') {
      localStorage.setItem('theme', value);
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Paramètres enregistrés avec succès !");
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'security', label: 'Système & Sécurité', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Configurez les préférences de votre entreprise et de l'application.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={18} />
          )}
          Enregistrer
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8 min-h-[500px]">
          {/* GENERAL */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="text-blue-500" /> Profil de l'entreprise
                </h2>
                <p className="text-sm text-slate-500 mt-1">Ces informations apparaîtront sur vos factures et bons de commande.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email de contact</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 flex items-center gap-1.5"><Globe size={14} /> Langue</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold appearance-none"
                  >
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Devise principale</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold appearance-none"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                    <option value="GBP">Livre (£)</option>
                    <option value="MAD">Dirham (MAD)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="text-blue-500" /> Préférences de communication
                </h2>
                <p className="text-sm text-slate-500 mt-1">Gérez comment et quand le système communique avec vous.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><AlertTriangle size={20} /></div>
                    <div>
                      <h3 className="font-bold text-slate-800">Alertes de Stock Critique</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Être notifié immédiatement lorsqu'un seuil est atteint.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.criticalStock} onChange={(e) => handleChange('criticalStock', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Mail size={20} /></div>
                    <div>
                      <h3 className="font-bold text-slate-800">Alertes Email</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Recevoir les alertes d'inventaire par e-mail quotidien.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.emailAlerts} onChange={(e) => handleChange('emailAlerts', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Smartphone size={20} /></div>
                    <div>
                      <h3 className="font-bold text-slate-800">Rapports Hebdomadaires IA</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Rapports d'analyse générés automatiquement par l'IA.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.aiReports} onChange={(e) => handleChange('aiReports', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="text-blue-500" /> Personnalisation de l'interface
                </h2>
                <p className="text-sm text-slate-500 mt-1">Adaptez l'application à vos goûts visuels.</p>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block ml-1">Thème de l'application</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => handleChange('theme', 'light')}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-center gap-4 ${settings.theme === 'light' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                  >
                    <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-yellow-400"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Mode Clair</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Parfait pour le bureau.</p>
                    </div>
                    {settings.theme === 'light' && <CheckCircle2 className="ml-auto text-blue-600" />}
                  </div>

                  <div
                    onClick={() => handleChange('theme', 'dark')}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-center gap-4 ${settings.theme === 'dark' ? 'border-blue-600 bg-slate-900 dark:bg-slate-800' : 'border-slate-100 hover:border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700'}`}
                  >
                    <div className="w-12 h-12 bg-slate-800 rounded-full shadow flex items-center justify-center">
                      <Moon className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Mode Sombre</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Confortable de nuit.</p>
                    </div>
                    {settings.theme === 'dark' && <CheckCircle2 className="ml-auto text-blue-600" />}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECURITY & SYSTEM */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Database className="text-blue-500" /> Maintenance et Données
                </h2>
                <p className="text-sm text-slate-500 mt-1">Sauvegardes et gestion de la rétention des logs.</p>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Rétention des historiques (Jours)</label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => handleChange('dataRetention', e.target.value)}
                  className="w-full md:w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold appearance-none"
                >
                  <option value="30">30 jours</option>
                  <option value="90">90 jours</option>
                  <option value="365">1 an</option>
                  <option value="infinite">Illimité</option>
                </select>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl mt-8">
                <h3 className="font-bold text-slate-800 mb-2">Exportation de la base de données</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Téléchargez une archive complète de vos produits, mouvements et utilisateurs au format SQL.
                </p>
                <button
                  onClick={() => toast.success("Sauvegarde en cours de préparation...")}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Générer une sauvegarde
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
