import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Download, Filter, ChevronLeft, ChevronRight,
    TrendingUp, TrendingDown, RefreshCw, Loader2
} from 'lucide-react';
import productService from '../services/productService';
import movementService from '../services/movementService';
import categoryService from '../services/categoryService';

/* ── helpers ── */
const PERIODS = [
    { value: 7,   label: '7 derniers jours' },
    { value: 30,  label: '30 derniers jours' },
    { value: 90,  label: '90 derniers jours' },
    { value: 365, label: '12 derniers mois' },
];
const COLORS = ['#1e293b', '#14b8a6', '#f59e0b', '#6366f1', '#ef4444', '#22c55e', '#8b5cf6'];
const ITEMS_PER_PAGE = 10;

const fmtNum = (n) => Number(n ?? 0).toLocaleString('fr-FR');

/* ── mini bar chart using SVG ── */
const SparkBar = ({ data, color = '#14b8a6' }) => {
    if (!data.length) return null;
    const max   = Math.max(...data.map(d => d.value), 1);
    const W     = 600;
    const H     = 160;
    const bw    = Math.max(4, (W / data.length) - 2);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
            {data.map((d, i) => {
                const bh = Math.max(2, (d.value / max) * (H - 10));
                return (
                    <g key={i}>
                        <rect
                            x={i * (W / data.length) + 1}
                            y={H - bh}
                            width={bw}
                            height={bh}
                            rx={2}
                            fill={d.type === 'sortie' ? '#ef4444' : color}
                            opacity={0.8}
                        />
                    </g>
                );
            })}
        </svg>
    );
};

/* ─────────────────────────────────── component ── */
const StockDetailReport = () => {
    const [period,      setPeriod]      = useState(30);
    const [filterCat,   setFilterCat]   = useState('');
    const [categories,  setCategories]  = useState([]);
    const [products,    setProducts]    = useState([]);
    const [movements,   setMovements]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    /* ── load all data ── */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [prodData, mvtData, catData] = await Promise.all([
                productService.getAll().catch(() => []),
                movementService.getAll().catch(() => []),
                categoryService.getAll().catch(() => []),
            ]);

            const unwrap = (d) => {
                if (Array.isArray(d))     return d;
                if (d?.data?.data)        return d.data.data;
                if (d?.data)              return d.data;
                return [];
            };

            setProducts(unwrap(prodData));
            setMovements(unwrap(mvtData));
            setCategories(Array.isArray(catData) ? catData : (catData?.data ?? []));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* ── derived: filter by period & category ── */
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);

    const periodMvts = movements.filter(m =>
        new Date(m.date_mouvement ?? m.created_at) >= cutoff
    );

    /* ── build product stats ── */
    const rows = products
        .filter(p => !filterCat || String(p.categorie_id ?? p.categorie?.id) === String(filterCat))
        .map(p => {
            const pid  = p.id;
            const mvts = periodMvts.filter(m => (m.produit_id ?? m.product?.id) === pid);
            const entries = mvts.filter(m => (m.type ?? '').toLowerCase().includes('entree') || m.type === 'in')
                               .reduce((s, m) => s + (m.quantite ?? m.quantity ?? 0), 0);
            const exits   = mvts.filter(m => !(m.type ?? '').toLowerCase().includes('entree') && m.type !== 'in')
                               .reduce((s, m) => s + (m.quantite ?? m.quantity ?? 0), 0);
            const closing = p.stock_actuel ?? p.stock ?? p.quantite ?? 0;
            const opening = Math.max(0, closing - entries + exits);
            const flux    = entries - exits;
            const variation = opening === 0 ? 0 : ((closing - opening) / opening) * 100;
            return {
                id: pid,
                name: p.nom ?? p.name ?? '—',
                sku: p.sku ?? '—',
                cat: p.categorie?.nom ?? p.categorie?.name ?? '—',
                opening,
                flux,
                closing,
                variation: Math.abs(variation).toFixed(1),
                trend: variation >= 0 ? 'up' : 'down',
                totalMvts: mvts.length,
            };
        })
        .sort((a, b) => b.totalMvts - a.totalMvts);

    /* ── chart data: movements per day grouped ── */
    const chartData = (() => {
        const byDay = {};
        periodMvts.forEach(m => {
            const day  = new Date(m.date_mouvement ?? m.created_at).toLocaleDateString('fr-FR');
            const type = (m.type ?? '').toLowerCase().includes('entree') ? 'entree' : 'sortie';
            if (!byDay[day]) byDay[day] = { value: 0, type };
            byDay[day].value += m.quantite ?? m.quantity ?? 0;
        });
        return Object.values(byDay).slice(-30);
    })();

    /* ── category distribution ── */
    const catStats = categories.map(c => {
        const count = products.filter(p =>
            String(p.categorie_id ?? p.categorie?.id) === String(c.id)
        ).length;
        return { name: c.nom ?? c.name, count };
    }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

    const totalProduits = products.filter(p => !filterCat || String(p.categorie_id ?? p.categorie?.id) === String(filterCat)).length;

    /* ── top movers ── */
    const topMovers = [...rows].sort((a, b) => b.totalMvts - a.totalMvts).slice(0, 10);
    const maxMvts   = Math.max(...topMovers.map(r => r.totalMvts), 1);

    /* ── pagination ── */
    const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
    const paginated  = rows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    /* ── CSV export ── */
    const handleExport = () => {
        const headers = ['Produit', 'SKU', 'Catégorie', 'Stock Initial', 'Flux', 'Stock Final', 'Variation %', 'Tendance'];
        const csv = [headers, ...rows.map(r => [r.name, r.sku, r.cat, r.opening, r.flux, r.closing, r.variation, r.trend])]
            .map(row => row.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `analyse_stocks_${new Date().toISOString().split('T')[0]}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    /* ─────────────────── render ── */
    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex text-[9px] text-slate-400 mb-6 gap-2 font-black uppercase tracking-[0.2em]">
                <Link to="/reports" className="hover:text-blue-600 transition-colors">Rapports</Link>
                <span className="text-slate-200">/</span>
                <span className="text-slate-500">Analyse Détaillée</span>
            </nav>

            {/* Filter bar */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[180px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Période</label>
                    <select
                        value={period}
                        onChange={e => { setPeriod(Number(e.target.value)); setCurrentPage(1); }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none"
                    >
                        {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[180px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Produits</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-bold text-slate-600">
                        {loading ? '…' : `${totalProduits} article${totalProduits > 1 ? 's' : ''}`}
                    </div>
                </div>
                <div className="flex-1 min-w-[180px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Catégorie</label>
                    <select
                        value={filterCat}
                        onChange={e => { setFilterCat(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom ?? c.name}</option>)}
                    </select>
                </div>
                <button
                    onClick={load}
                    className="bg-[#1e293b] text-white px-5 py-2 rounded-lg font-bold text-xs mt-3.5 flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
                </button>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 tracking-tight">Analyse de l'Évolution des Stocks</h2>
                        <p className="text-[11px] text-slate-400">
                            {loading ? 'Chargement…' : `${periodMvts.length} mouvements sur ${period} jours`}
                        </p>
                    </div>
                    <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Entrées</span>
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Sorties</span>
                    </div>
                </div>
                <div className="h-44 w-full bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                    {loading
                        ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>
                        : chartData.length === 0
                            ? <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">Aucun mouvement sur cette période</div>
                            : <SparkBar data={chartData} />}
                </div>
            </div>

            {/* Grid: Category + Top 10 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Category distribution */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-base font-bold text-slate-800 mb-6 tracking-tight">Répartition par Catégorie</h2>
                    {loading
                        ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-slate-200 animate-spin" /></div>
                        : (
                            <div className="flex items-center justify-around gap-4">
                                {/* donut */}
                                <div className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center"
                                    style={{ background: `conic-gradient(${catStats.map((c, i) => {
                                        const pct = products.length ? (c.count / products.length) * 100 : 0;
                                        return `${COLORS[i % COLORS.length]} ${pct.toFixed(0)}%`;
                                    }).join(', ')})` }}>
                                    <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                                        <span className="text-xl font-black text-slate-800">{fmtNum(products.length)}</span>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Articles</span>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    {catStats.slice(0, 5).map((c, i) => {
                                        const pct = products.length ? ((c.count / products.length) * 100).toFixed(0) : 0;
                                        return (
                                            <div key={i} className="flex items-center gap-6 justify-between w-44 text-[11px] font-bold">
                                                <span className="text-slate-400 flex items-center gap-1.5 truncate max-w-[120px]">
                                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                                    {c.name}
                                                </span>
                                                <span className="text-slate-800">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                    {catStats.length === 0 && <p className="text-xs text-slate-300 italic">Aucune catégorie.</p>}
                                </div>
                            </div>
                        )}
                </div>

                {/* Top 10 movers */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-base font-bold text-slate-800 mb-5 tracking-tight">Mouvements Majeurs (Top 10)</h2>
                    {loading
                        ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-slate-200 animate-spin" /></div>
                        : topMovers.length === 0
                            ? <p className="text-xs text-slate-300 italic text-center py-6">Aucun mouvement sur cette période.</p>
                            : (
                                <div className="space-y-3.5">
                                    {topMovers.map((p, i) => (
                                        <div key={p.id} className="space-y-1">
                                            <div className="flex justify-between text-[11px] font-bold">
                                                <span className="text-slate-600 truncate max-w-[200px]">{p.name}</span>
                                                <span className="text-teal-600 flex-shrink-0">{fmtNum(p.totalMvts)} mvt</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-teal-500 h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${(p.totalMvts / maxMvts) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                </div>
            </div>

            {/* Detail table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-800">Détail des Variations de Stock</h2>
                        {!loading && <p className="text-[10px] text-slate-400 mt-0.5">{rows.length} produit{rows.length > 1 ? 's' : ''}</p>}
                    </div>
                    <div className="flex gap-2 text-slate-400">
                        <button onClick={handleExport} className="p-1.5 hover:bg-slate-50 rounded-md transition-colors" title="Exporter CSV">
                            <Download size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-50 rounded-md transition-colors">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Produit</th>
                                <th className="px-6 py-3">Catégorie</th>
                                <th className="px-6 py-3">Stock Initial</th>
                                <th className="px-6 py-3 text-center">Flux</th>
                                <th className="px-6 py-3">Stock Final</th>
                                <th className="px-6 py-3 text-right">Variation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && (
                                <tr><td colSpan={6} className="px-6 py-14 text-center">
                                    <Loader2 className="w-6 h-6 text-slate-200 animate-spin inline" />
                                </td></tr>
                            )}
                            {!loading && paginated.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-14 text-center text-slate-300 italic text-sm">
                                    Aucun produit correspondant.
                                </td></tr>
                            )}
                            {!loading && paginated.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group border-none">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                                                {p.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{p.name}</p>
                                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight">{p.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">{p.cat}</span>
                                    </td>
                                    <td className="px-6 py-3.5 font-bold text-slate-500 text-[13px]">{fmtNum(p.opening)}</td>
                                    <td className={`px-6 py-3.5 font-black text-center text-[13px] ${p.flux >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {p.flux >= 0 ? `+${fmtNum(p.flux)}` : fmtNum(p.flux)}
                                    </td>
                                    <td className="px-6 py-3.5 font-black text-slate-800 text-[13px]">{fmtNum(p.closing)}</td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className={`flex items-center justify-end gap-1 text-[11px] font-black uppercase tracking-wider ${p.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {p.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {p.variation}%
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50">
                    <span>
                        {rows.length === 0 ? '0 produit' :
                            `Page ${currentPage} / ${totalPages} — ${rows.length} article${rows.length > 1 ? 's' : ''}`}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Précédent
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 bg-[#1e293b] text-white rounded-md hover:bg-black shadow-sm transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                            Suivant <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetailReport;