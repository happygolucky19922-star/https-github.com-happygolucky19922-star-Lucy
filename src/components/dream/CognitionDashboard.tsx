import React from 'react';
import { motion } from 'motion/react';
import { Activity, Sparkles, Terminal, Database, Moon, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppState } from '../types';

interface Props {
  state: AppState;
  isProcessing: boolean;
  processingStatus: string;
  onInitiate: () => void;
}

export const CognitionDashboard: React.FC<Props> = ({ state, isProcessing, processingStatus, onInitiate }) => {
   const barHeights = React.useMemo(() => Array.from({ length: 40 }).map(() => ({
      h: Math.random() * 30 + 10,
      d: 1.5 + Math.random() * 2,
      delay: Math.random() * 2
   })), []);

   return (
    <div className="grid grid-cols-12 gap-6 h-full p-8 overflow-y-auto custom-scrollbar">
      <div className="col-span-12 flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
            Dream Mode <span className="text-white/20 text-xl font-sans not-italic">Reflective Cognition Layer</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--p)] mt-2 opacity-60">
            Sovereign Processing: {state.dreamMode.isDreaming ? 'ACTIVE' : 'STANDBY'}
          </p>
        </div>
        <button 
          onClick={onInitiate}
          disabled={isProcessing}
          className={cn(
            "px-8 py-4 bg-[var(--p)] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[var(--p)]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3",
            isProcessing && "opacity-50 cursor-not-allowed saturate-0"
          )}
        >
          {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Moon size={16} />}
          {isProcessing ? processingStatus : 'Initiate Dream Cycle'}
        </button>
      </div>

      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="glass bg-black/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-[var(--p)]" />
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Activity className="text-[var(--p)]" size={20} />
                 <span className="text-xs font-black uppercase tracking-widest text-white/80 italic">Cognition Cluster Activity</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                 {barHeights.map((bar, i) => (
                    <motion.div 
                       key={i}
                       className="w-1 bg-[var(--p)]/20 rounded-full"
                       animate={{ 
                          height: [10, bar.h, 10],
                          opacity: [0.2, 0.4, 0.2]
                       }}
                       transition={{ 
                          duration: bar.d, 
                          repeat: Infinity, 
                          delay: bar.delay,
                          ease: "easeInOut"
                       }}
                    />
                 ))}
              </div>
           </div>
           <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Synaptic Load', value: isProcessing ? `${(Math.random() * 20 + 80).toFixed(1)}%` : `${(Math.random() * 40 + 20).toFixed(1)}%`, color: 'text-cyan-400' },
                { label: 'Reflection Depth', value: `Level ${state.dreamMode.dreamCycles.length + 14}`, color: 'text-pink-400' },
                { label: 'Inference Efficiency', value: isProcessing ? `${(Math.random() * 10 + 60).toFixed(1)}%` : `${(Math.random() * 5 + 94).toFixed(1)}%`, color: 'text-emerald-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
                   <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 italic">{stat.label}</div>
                   <div className={cn("text-2xl font-syne font-black italic tracking-tight", stat.color)}>{stat.value}</div>
                </div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
           <div className="glass bg-black/40 border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                 <Sparkles className="text-amber-400" size={18} />
                 <span className="text-xs font-black uppercase tracking-widest text-white/80 italic">Insight History</span>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                 {state.dreamMode.dreamCycles.flatMap(c => c.insights).map((insight, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                       <div className="w-8 h-8 rounded-lg bg-[var(--p)]/10 text-[var(--p)] flex items-center justify-center font-black text-xs shrink-0">{i+1}</div>
                       <p className="text-[11px] font-bold text-white/60 leading-relaxed italic">{insight}</p>
                    </div>
                 )) || <div className="py-8 text-center text-white/20 italic font-black text-[9px] uppercase tracking-widest">No insights generated.</div>}
                 
                 {state.dreamMode.dreamCycles.length === 0 && (
                     <div className="py-8 text-center text-white/20 italic font-black text-[9px] uppercase tracking-widest">No insights generated.</div>
                 )}
              </div>
           </div>
           <div className="glass bg-black/40 border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                 <Terminal className="text-red-400" size={18} />
                 <span className="text-xs font-black uppercase tracking-widest text-white/80 italic">Unresolved Problems</span>
              </div>
              <div className="space-y-4">
                 {state.dreamMode.dreamCycles[0]?.unresolvedProblems.map((prob, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 border-l-red-500/50">
                       <p className="text-[11px] font-bold text-red-100/60 leading-relaxed italic uppercase tracking-tighter">FAULT_ID_{i+100}: {prob}</p>
                    </div>
                 )) || <div className="py-8 text-center text-white/20 italic font-black text-[9px] uppercase tracking-widest">System clear.</div>}
              </div>
           </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 h-full">
         <div className="glass bg-black/40 border border-white/5 rounded-3xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <span className="text-xs font-black uppercase tracking-widest text-white/60 italic">Memory Consolidation Timeline</span>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
               {state.dreamMode.dreamCycles.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                     <Database size={32} />
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] italic">Layers Empty</span>
                  </div>
               ) : (
                  state.dreamMode.dreamCycles.map((cycle) => (
                    <div key={cycle.id} className="relative pl-8 pb-6 border-l border-white/5 last:border-0 group">
                       <div className="absolute left-[-5px] top-0 w-[10px] h-[10px] rounded-full bg-white/10 group-hover:bg-[var(--p)] transition-colors shadow-[0_0_10px_rgba(var(--p-rgb),0.5)]" />
                       <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1 italic">{new Date(cycle.ts).toLocaleString()}</div>
                       <div className="text-[11px] font-bold text-white/50 leading-relaxed mb-3">{cycle.summary}</div>
                    </div>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
