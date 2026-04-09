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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-400">
        <Link to="/suppliers" className="hover:text-slate-600 transition-colors">Suppliers</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-bold">Add supplier</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Add new supplier</h1>
        <p className="mt-2 text-slate-500 font-medium">Onboard a new vendor to the enterprise ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* General Information Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">General Information</h2>
          
          <div className="space-y-8">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Company name</label>
              <input 
                type="text" 
                placeholder="Global Logistics Inc."
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-slate-900 placeholder:text-slate-300 transition-all outline-none font-medium"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="contact@supplier.com"
                    className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-slate-900 placeholder:text-slate-300 transition-all outline-none font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Phone number</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-slate-900 placeholder:text-slate-300 transition-all outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Address</label>
              <textarea 
                rows="4"
                placeholder="Enter the full business address..."
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-slate-900 placeholder:text-slate-300 transition-all outline-none font-medium resize-none shadow-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Linked Products Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-10 flex items-center justify-between border-b border-slate-100">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Linked Products</h2>
              <p className="text-xs font-semibold text-slate-400">Manage the catalog associated with this supplier.</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-teal-50 text-teal-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-teal-100 transition-all">
              <Plus className="w-4 h-4" />
              Link Product
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                  <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Time</th>
                  <th className="px-10 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                <tr className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-all shadow-sm">
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="text-base font-bold text-slate-900">Steel Rods 12mm</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-black text-slate-900">$12.40</td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      14 Days
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center">
                       <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                         <Trash2 className="w-4 h-4" />
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
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-100 px-10 py-8 flex items-center justify-end gap-6 z-20">
         <button 
           onClick={() => navigate('/suppliers')}
           className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
         >
           Cancel
         </button>
         <button className="flex items-center gap-3 px-10 py-4 bg-[#0a1d37] text-white rounded-2xl text-sm font-bold hover:bg-black hover:shadow-2xl hover:shadow-slate-200 transition-all">
           <Save className="w-5 h-5 text-white/70" />
           Save supplier
         </button>
      </div>
    </div>
  );
}
