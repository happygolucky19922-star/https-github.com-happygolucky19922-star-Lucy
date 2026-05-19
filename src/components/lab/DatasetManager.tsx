import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Search, Plus, RefreshCw, Trash2, ArrowRight, XCircle, Save } from 'lucide-react';
import { AppState, Dataset } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export const DatasetManager: React.FC<Props> = ({ state, updateState, notify }) => {
  const [dsSearch, setDsSearch] = useState('');
  const [dsTypeFilter, setDsTypeFilter] = useState('All');
  const [dsSourceFilter, setDsSourceFilter] = useState('All');
  const [dsSort, setDsSort] = useState<'name' | 'size' | 'newest'>('newest');
  const [showNewDsModal, setShowNewDsModal] = useState(false);
  const [newDsName, setNewDsName] = useState('');
  const [newDsContent, setNewDsContent] = useState('');

  const { modelLab } = state;

  const handleCreateDataset = () => {
    if (!newDsName) return notify('Please enter a dataset name');
    const newDataset: Dataset = {
      id: `ds-local-${Date.now()}`,
      name: newDsName,
      type: 'Text',
      size: newDsContent.length,
      status: 'ready',
      source: 'Local Editor',
      ts: Date.now(),
    };
    updateState(s => ({
      ...s,
      modelLab: {
        ...s.modelLab,
        datasets: [newDataset, ...s.modelLab.datasets]
      }
    }));
    notify(`Dataset "${newDsName}" registered.`);
    setShowNewDsModal(false);
    setNewDsName('');
    setNewDsContent('');
  };

  const filteredDatasets = modelLab.datasets
    .filter(ds => {
      const matchesSearch = ds.name.toLowerCase().includes(dsSearch.toLowerCase());
      const matchesType = dsTypeFilter === 'All' || ds.type === dsTypeFilter;
      const matchesSource = dsSourceFilter === 'All' || ds.source === dsSourceFilter;
      return matchesSearch && matchesType && matchesSource;
    })
    .sort((a, b) => {
      if (dsSort === 'name') return a.name.localeCompare(b.name);
      if (dsSort === 'size') return b.size - a.size;
      return b.ts - a.ts;
    });

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter">Data Inventory</h3>
          <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Curate and refine optimization curriculum</p>
        </div>
        <button 
          onClick={() => setShowNewDsModal(true)}
          className="px-6 py-4 bg-[var(--p)] text-white font-black uppercase italic tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
        >
          <Plus size={18} /> Register Ingestion
        </button>
      </div>

      {/* FILTERS */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="text"
              placeholder="Search datasets..."
              value={dsSearch}
              onChange={(e) => setDsSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xs font-black uppercase text-white outline-none focus:border-[var(--p)]/50 transition-all font-mono"
            />
          </div>
          <div className="relative">
            <select 
              value={dsSort}
              onChange={(e) => setDsSort(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--p)]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="newest">Sort: Temporal Desc</option>
              <option value="name">Sort: Lexical Asc</option>
              <option value="size">Sort: Sample Volume</option>
            </select>
            <RefreshCw size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
          <button 
            onClick={() => { setDsTypeFilter('All'); setDsSourceFilter('All'); setDsSearch(''); }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-[10px] font-black uppercase text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            Reset Filters
          </button>
        </div>

        <div className="flex flex-wrap gap-12 py-6 border-y border-white/5 bg-white/[0.01] px-6 rounded-3xl">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1 italic">Knowledge Domain</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'SFT', 'DPO', 'Synthetic', 'Preference', 'Code'].map(type => (
                <button
                  key={type}
                  onClick={() => setDsTypeFilter(type)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                    dsTypeFilter === type 
                      ? "bg-[var(--p)] border-[var(--p)] text-white shadow-lg shadow-[var(--p)]/20" 
                      : "bg-white/5 border-white/10 text-white/30 hover:text-white"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DATASET LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <AnimatePresence mode="popLayout">
          {filteredDatasets.map(ds => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={ds.id} 
              className="glass bg-[#0b0d12] border border-white/5 rounded-[32px] p-8 flex items-center gap-8 relative group hover:border-white/20 hover:bg-white/[0.03] transition-all shadow-xl"
            >
              <div className="w-20 h-20 rounded-[28px] bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[var(--p)] transition-all group-hover:rotate-6 shadow-inner">
                <Database size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-syne font-black text-white uppercase italic tracking-tighter truncate">{ds.name}</h4>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                    ds.type === 'Code' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    ds.type === 'Preference' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    ds.type === 'SFT' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-white/10 text-white/30 border-white/10"
                  )}>{ds.type}</span>
                </div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-4">
                  <span className="text-white/60">{ds.size.toLocaleString()} Neural Samples</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className={cn(
                    ds.source === 'HuggingFace' ? 'text-amber-500' : 
                    ds.source === 'Local Editor' ? 'text-blue-400' : 'text-white/30'
                  )}>{ds.source}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    updateState(s => ({
                      ...s,
                      modelLab: {
                        ...s.modelLab,
                        datasets: s.modelLab.datasets.filter(d => d.id !== ds.id)
                      }
                    }));
                    notify("Dataset purged from cache.");
                  }}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-md"
                >
                  <Trash2 size={20} />
                </button>
                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-[var(--p)] hover:bg-[var(--p)]/10 hover:border-[var(--p)]/20 transition-all shadow-md">
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
          
          <motion.div 
            layout
            onClick={() => setShowNewDsModal(true)}
            className="border-2 border-dashed border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center space-y-6 hover:border-[var(--p)]/40 hover:bg-[var(--p)]/5 transition-all cursor-pointer group h-full min-h-[160px]"
          >
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:scale-110 group-hover:text-[var(--p)] transition-all">
              <Plus size={32} />
            </div>
            <div className="text-center">
              <div className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Manual Ingestion Node</div>
              <div className="text-[9px] font-bold text-white/20 uppercase mt-2">Inject raw traces for fine-tuning</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* NEW DATASET MODAL */}
      <AnimatePresence>
        {showNewDsModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-2xl glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-12 space-y-10 shadow-3xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter">Manual Ingestion</h4>
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mt-2">Inject proprietary knowledge tracers</p>
                </div>
                <button onClick={() => setShowNewDsModal(false)} className="text-white/20 hover:text-white transition-colors hover:rotate-90">
                  <XCircle size={32} strokeWidth={1.5} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic ml-1">Dataset Identifier</label>
                  <input 
                    type="text"
                    value={newDsName}
                    onChange={e => setNewDsName(e.target.value)}
                    placeholder="e.g. INGRESS_TRAJECTORY_ALPHA"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic ml-1">Neural Raw Content (JSONL)</label>
                  <textarea 
                    value={newDsContent}
                    onChange={e => setNewDsContent(e.target.value)}
                    placeholder='{"instruction": "...", "input": "...", "output": "..."}'
                    className="w-full h-64 bg-black/40 border border-white/10 rounded-3xl p-6 text-xs font-mono text-white/70 outline-none focus:border-[var(--p)] transition-all resize-none custom-scrollbar placeholder:text-white/10"
                  />
                </div>
              </div>

              <button 
                onClick={handleCreateDataset}
                className="w-full py-6 bg-white text-black font-black uppercase italic tracking-[0.4em] rounded-2xl hover:bg-[var(--p)] hover:text-white hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 group"
              >
                <Save size={20} className="group-hover:animate-bounce" />
                Finalize Registration
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
