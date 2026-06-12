/**
 * ─────────────────────────────────────────────────────────────
 *  DESIGN SYSTEM PARTAGÉ — StockManager
 *  Utilisé par toutes les pages pour une cohérence visuelle
 * ─────────────────────────────────────────────────────────────
 */
import React from 'react';
import { Loader2, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Page wrapper ─── */
export function PageWrapper({ children }) {
  return (
    <div className="bg-[#f0f4ff] min-h-full p-6 space-y-5">
      {children}
    </div>
  );
}

/* ─── Page Header ─── */
export function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-black text-slate-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

/* ─── Section Card ─── */
export function Card({ children, className = '', noPad = false }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${noPad ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
}

/* ─── Section Title ─── */
export function SectionTitle({ icon: Icon, title, color = 'blue', action }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-500',
  };
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={`p-1.5 rounded-lg ${colors[color] || colors.blue}`}>
            <Icon size={14} />
          </div>
        )}
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">{title}</h3>
      </div>
      {action}
    </div>
  );
}

/* ─── Primary Button ─── */
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, icon: Icon, className = '' }) {
  const base = 'flex items-center gap-2 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 rounded-xl';
  const sizes = { sm: 'px-3 py-1.5 text-[9px]', md: 'px-4 py-2 text-[10px]', lg: 'px-6 py-2.5 text-[10px]' };
  const variants = {
    primary: 'bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700',
    secondary: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    danger: 'bg-red-500 text-white shadow-md shadow-red-100 hover:bg-red-600',
    success: 'bg-emerald-600 text-white shadow-md shadow-emerald-100 hover:bg-emerald-700',
    ghost: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600',
    warning: 'bg-amber-500 text-white shadow-md shadow-amber-100 hover:bg-amber-600',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      {children}
    </button>
  );
}

/* ─── Search / Filter Bar ─── */
export function FilterBar({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
      {children}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher…' }) {
  const { Search } = require('lucide-react');
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text" value={value} onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
      />
    </div>
  );
}

export function SelectFilter({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange}
      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 focus:outline-none focus:border-blue-300 transition-all cursor-pointer">
      {children}
    </select>
  );
}

/* ─── Table ─── */
export function Table({ headers, children, loading, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {headers.map((h, i) => (
              <th key={i} className={`px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ${h.right ? 'text-right' : h.center ? 'text-center' : ''}`}>
                {h.label ?? h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? <LoadingRows cols={headers.length} /> : children}
          {!loading && empty}
        </tbody>
      </table>
    </div>
  );
}

export function LoadingRows({ cols = 5, rows = 6 }) {
  return Array(rows).fill(0).map((_, i) => (
    <tr key={i} className="animate-pulse">
      {Array(cols).fill(0).map((_, j) => (
        <td key={j} className="px-5 py-4">
          <div className="h-3 bg-slate-100 rounded-lg" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  ));
}

export function EmptyRow({ cols, message = 'Aucun résultat trouvé.', icon: Icon }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-16 text-center">
        {Icon && <Icon size={28} className="mx-auto text-slate-200 mb-3" />}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{message}</p>
      </td>
    </tr>
  );
}

/* ─── Status Badge ─── */
export function Badge({ children, color = 'slate' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    violet: 'bg-violet-100 text-violet-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
    yellow: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
}

/* ─── Avatar ─── */
export function Avatar({ name = '?', size = 'sm', color = 'slate' }) {
  const initials = name.substring(0, 2).toUpperCase();
  const s = size === 'sm' ? 'w-8 h-8 text-[9px]' : 'w-10 h-10 text-[10px]';
  return (
    <div className={`${s} rounded-full bg-slate-900 text-white flex items-center justify-center font-black flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ─── Pagination ─── */
export function Pagination({ current, total, onChange, showing, totalItems }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - current) <= 1);
  return (
    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
      <p className="text-[10px] font-bold text-slate-400">
        Affichage <span className="text-slate-800">{showing}</span> sur <span className="text-slate-800">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-30">
          <ChevronLeft size={14} />
        </button>
        {visible.map((p, i, arr) => (
          <React.Fragment key={p}>
            {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300 text-xs">…</span>}
            <button onClick={() => onChange(p)}
              className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${p === current ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}>
              {p}
            </button>
          </React.Fragment>
        ))}
        <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-30">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Modal ─── */
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md', dark = false }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 ${dark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white'}`}>
              <div>
                <h2 className={`text-sm font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
                {subtitle && <p className={`text-[10px] font-semibold mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{subtitle}</p>}
              </div>
              <button onClick={onClose} className={`p-1.5 rounded-xl transition-colors ${dark ? 'text-slate-400 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'}`}>
                <X size={16} />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            {/* Footer */}
            {footer && <div className="flex-shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Confirm Modal ─── */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmer', confirmVariant = 'danger', loading }) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="p-3 bg-red-50 rounded-xl"><AlertTriangle size={24} className="text-red-500" /></div>
        <div>
          <h3 className="text-sm font-black text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500 font-semibold mt-2 leading-relaxed">{message}</p>
        </div>
        <div className="flex flex-col gap-2 w-full mt-2">
          <Btn onClick={onConfirm} variant={confirmVariant} disabled={loading} className="justify-center w-full">
            {loading ? <><Loader2 size={12} className="animate-spin" /> Traitement…</> : confirmLabel}
          </Btn>
          <Btn onClick={onClose} variant="secondary" className="justify-center w-full">Annuler</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Form Field ─── */
export function Field({ label, children, hint }) {
  return (
    <div>
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[9px] text-slate-400 mt-1 font-semibold">{hint}</p>}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input {...props}
      className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-blue-300 focus:bg-white transition-all ${props.className || ''}`}
    />
  );
}

export function Textarea({ ...props }) {
  return (
    <textarea {...props}
      className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-blue-300 focus:bg-white transition-all resize-none ${props.className || ''}`}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select {...props}
      className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-blue-300 focus:bg-white transition-all cursor-pointer ${props.className || ''}`}>
      {children}
    </select>
  );
}

/* ─── KPI Card ─── */
export function KpiCard({ label, value, sub, icon: Icon, color = 'blue', dark = false }) {
  const bgs = { blue: 'bg-blue-50', emerald: 'bg-emerald-50', violet: 'bg-violet-50', orange: 'bg-orange-50', red: 'bg-red-50', amber: 'bg-amber-50' };
  const texts = { blue: 'text-blue-600', emerald: 'text-emerald-600', violet: 'text-violet-600', orange: 'text-orange-600', red: 'text-red-500', amber: 'text-amber-600' };
  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgs[color]} ${texts[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
      <h2 className={`text-xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-800'}`}>{value}</h2>
      {sub && <p className={`text-[9px] font-semibold mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

/* ─── Tabs ─── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl gap-0.5">
      {tabs.map(t => (
        <button key={t.value} onClick={() => onChange(t.value)}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5
            ${active === t.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          {t.icon && <t.icon size={11} />}
          {t.label}
          {t.badge != null && t.badge > 0 && (
            <span className={`text-[8px] font-black px-1 py-0.5 rounded-full ${active === t.value ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>{t.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Alert Banner ─── */
export function AlertBanner({ show, onClose, type = 'warning', children }) {
  const styles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };
  if (!show) return null;
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border ${styles[type]}`}>
      <div className="flex items-center gap-3 text-[11px] font-bold">{children}</div>
      {onClose && <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0"><X size={13} /></button>}
    </div>
  );
}
