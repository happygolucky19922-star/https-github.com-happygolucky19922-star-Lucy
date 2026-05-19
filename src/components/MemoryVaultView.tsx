import React from 'react';
import { Database, Activity, ExternalLink, Zap } from 'lucide-react';
import { AppState } from '../types';
import { TESTS } from '../constants';
import { cn } from '../lib/utils';

export default function MemoryVaultView({ state, updateState, notify, toggleModelLoad }: { state: AppState, updateState: any, notify: any, toggleModelLoad: (id: string) => void }) {
  const activeModelId = state.arenaModel;
  const activeModel = state.models.find(m => m.id === activeModelId);

  // In a real app, this would fetch from /api/traces
  const mockTraces = Object.entries(state.testResults).map(([tid, res]: any) => ({
    id: tid,
    timestamp: res.ts,
    summary: res.reason,
    score: res.score,
    category: TESTS.find(t => t.id === tid)?.cat || 'General'
  })).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="p-8 h-full bg-black overflow-y-auto custom-scrollbar">
       <div className="max-w-6xl mx-auto space-y-12 pb-24">
          <header className="flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                   <Database size={36} />
                </div>
                <div>
                   <h2 className="text-4xl font-syne font-black uppercase italic leading-tight text-white tracking-tighter">Memory Vault</h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-white">Local ChromaDB Persistent Knowledge</p>
                </div>
             </div>

             <div className="flex items-center gap-6">
                {/* CORE SELECTOR */}
                <div className="relative group/vault-selector cursor-pointer">
                   <div className={cn(
                      "glass p-3 px-6 rounded-2xl border transition-all flex items-center gap-4",
                      activeModelId ? "border-emerald-500/20 bg-emerald-500/5 shadow-2xl shadow-emerald-500/5" : "border-white/5"
                   )}>
                      <div className="text-right">
                         <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] block">Storage Source</span>
                         <span className="text-xs font-syne font-black uppercase italic text-white tracking-wider">
                            {activeModel?.name || 'Inspect Core'}
                         </span>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover/vault-selector:text-emerald-500 transition-colors">
                         <Activity size={18} />
                      </div>
                   </div>

                   <div className="absolute top-full right-0 mt-4 w-72 glass bg-black/95 border border-white/10 rounded-[32px] p-6 shadow-2xl opacity-0 group-hover/vault-selector:opacity-100 pointer-events-none group-hover/vault-selector:pointer-events-auto transition-all transform translate-y-2 group-hover/vault-selector:translate-y-0 z-50">
                      <div className="space-y-4 text-left">
                         <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 border-b border-white/5 pb-2 italic">Neural Index Matrix</div>
                         <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {state.models.map(m => (
                               <div key={m.id} className={cn(
                                  "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group/item",
                                  activeModelId === m.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/5 hover:bg-white/10"
                               )} onClick={() => updateState((s: AppState) => ({ ...s, arenaModel: m.id }))}>
                                  <div className="flex-1 min-w-0">
                                     <div className="text-[10px] font-black truncate uppercase italic tracking-tighter text-white">{m.name}</div>
                                     <div className="text-[8px] font-bold opacity-30 uppercase text-white">{m.backend}</div>
                                  </div>
                                  <button 
                                     onClick={(e) => { e.stopPropagation(); toggleModelLoad(m.id); }}
                                     className={cn(
                                        "p-1.5 px-3 rounded-lg transition-all flex items-center gap-2",
                                        m.isLoaded ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 opacity-40 group-hover/item:opacity-100"
                                     )}>
                                     {m.isLoaded ? <Zap size={10} className="fill-current" /> : <Zap size={10} />}
                                     <span className="text-[8px] font-black uppercase">{m.isLoaded ? 'Kill' : 'Init'}</span>
                                  </button>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="glass p-3 px-6 rounded-2xl border-white/5 flex flex-col items-center">
                      <span className="text-[9px] font-black opacity-30 uppercase mb-1 text-white">Stored Traces</span>
                      <span className="text-xl font-syne font-black text-emerald-500">{mockTraces.length}</span>
                   </div>
                   <div className="glass p-3 px-6 rounded-2xl border-white/5 flex flex-col items-center">
                      <span className="text-[9px] font-black opacity-30 uppercase mb-1 text-white">DB Integrity</span>
                      <span className="text-xl font-syne font-black text-emerald-500">OPTIMAL</span>
                   </div>
                </div>
             </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {mockTraces.length === 0 ? (
               <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-20 text-center space-y-6">
                  <Activity size={80} strokeWidth={0.5} className="text-white" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase text-white">ChromaDB Indices Empty</h3>
                    <p className="text-[10px] max-w-xs font-medium uppercase tracking-widest text-white/60">Execute Gauntlet sectors or System-2 loops to generate persistent trace data.</p>
                  </div>
               </div>
             ) : (
               mockTraces.map(trace => (
                 <div 
                   key={trace.id} 
                   className="glass p-8 rounded-[48px] border-white/5 space-y-6 group hover:border-emerald-500/40 transition-all cursor-pointer relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent"
                 >
                    <div className="flex justify-between items-start">
                       <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 p-1.5 px-3 rounded-full border border-emerald-500/20">{trace.category}</span>
                       <span className="text-[10px] font-black opacity-30 uppercase tracking-widest text-white">{new Date(trace.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div>
                       <h4 className="font-syne font-black uppercase text-sm text-white mb-2 line-clamp-1">{TESTS.find(t=>t.id===trace.id)?.name || 'Autonomous Exec Output'}</h4>
                       <p className="text-xs text-white/50 leading-relaxed italic line-clamp-3 opacity-60">"{trace.summary}"</p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                       <div className="flex items-center gap-2">
                          <div className={cn("w-2.5 h-2.5 rounded-full", trace.score > 80 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : (trace.score > 50 ? "bg-yellow-500" : "bg-red-500"))} />
                          <span className="text-[11px] font-black text-white uppercase italic">{trace.score}% Alignment</span>
                       </div>
                       <ExternalLink size={14} className="text-white opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
               ))
             )}
          </div>
       </div>
    </div>
  );
}
