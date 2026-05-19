import React from 'react';
import { Network, Upload, Download, Globe, Cpu, Play, Settings2, Plus, ChevronRight, Shield, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppState } from '../../types';

interface Props {
  state: AppState;
  updateState: any;
}

export const ModelHub: React.FC<Props> = ({ state, updateState }) => {
  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
       <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
             <h2 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                Model Hub <span className="text-white/20 text-xl font-sans not-italic">Neural Router & Orchestration</span>
             </h2>
          </div>
          <div className="flex gap-4">
             <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                <Upload size={16} className="text-white/40 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white italic">Import Model</span>
             </button>
          </div>
       </div>

       <div className="grid grid-cols-12 gap-8 flex-1">
          <div className="col-span-8 space-y-6">
             {state.dreamMode.modelHub.routers.map(router => (
                <div key={router.id} className="glass bg-black/40 border border-white/5 rounded-3xl p-8 group relative overflow-hidden">
                   <div className={cn("absolute right-8 top-8 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", 
                      router.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                   )}>
                      {router.status}
                   </div>
                   
                   <div className="flex items-start gap-6 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[var(--p)] transition-colors">
                         <Network size={32} />
                      </div>
                      <div>
                         <h3 className="text-xl font-syne font-black text-white uppercase italic tracking-tighter mb-1">{router.name}</h3>
                         <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            < Globe size={12} /> {router.endpoint} <div className="border-l border-white/10 pl-4 flex items-center gap-2"><Cpu size={12} /> {router.type}</div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {router.models.map(mId => {
                         const m = state.models.find(mod => mod.id === mId);
                         return (
                            <div key={mId} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[var(--p)]/30 transition-all cursor-pointer">
                               <div className="text-[10px] font-black text-white/60 truncate uppercase italic">{m?.name || mId}</div>
                               <div className="flex items-center justify-between mt-4">
                                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">{m?.quantization || 'Q4_K_M'}</span>
                                  <div className="flex gap-1">
                                     <button className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors"><Settings2 size={10} /></button>
                                     <button className="w-6 h-6 rounded-lg bg-[var(--p)]/10 flex items-center justify-center text-[var(--p)] hover:bg-[var(--p)] hover:text-white transition-colors"><Play size={10} className="ml-0.5" /></button>
                                  </div>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             ))}
          </div>

          <div className="col-span-4 space-y-6">
             <div className="glass bg-black/40 border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <Shield className="text-[var(--p)]" size={18} />
                      <span className="text-xs font-black uppercase tracking-widest text-white/80 italic">Orchestration Policy</span>
                   </div>
                   <Lock size={14} className="text-white/20" />
                </div>
                
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <div className="text-[10px] font-black uppercase text-white/80 italic tracking-wider mb-1">Parallel Reasoning</div>
                         <div className="text-[8px] font-bold text-white/30 uppercase leading-relaxed">Broadcast queries to all active routers</div>
                      </div>
                      <button 
                        onClick={() => updateState((s: AppState) => ({ ...s, dreamMode: { ...s.dreamMode, modelHub: { ...s.dreamMode.modelHub, parallelReasoningEnabled: !s.dreamMode.modelHub.parallelReasoningEnabled } } }))}
                        className={cn("w-10 h-5 rounded-full transition-all relative", state.dreamMode.modelHub.parallelReasoningEnabled ? 'bg-[var(--p)] shadow-[0_0_10px_rgba(var(--p-rgb),0.5)]' : 'bg-white/10')}
                      >
                         <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-md", state.dreamMode.modelHub.parallelReasoningEnabled ? 'right-1' : 'left-1')} />
                      </button>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 italic mb-4">Fallback Execution Chain</div>
                      {state.dreamMode.modelHub.fallbackChain.map((id, i) => (
                         <div key={id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 group">
                            <div className="text-[10px] font-black text-white/20 italic">{i+1}</div>
                            <div className="text-[10px] font-black text-white/60 truncate uppercase italic flex-1">{id}</div>
                            <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors cursor-pointer" />
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
