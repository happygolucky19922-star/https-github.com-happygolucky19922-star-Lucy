import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Shield, Cpu, Zap, Search, ArrowUpRight, BarChart3, Target, RefreshCw } from 'lucide-react';
import { AppState, Benchmark } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export const BenchmarkTester: React.FC<Props> = ({ state, updateState, notify }) => {
  const { modelLab } = state;
  const [isTesting, setIsTesting] = useState(false);

  const startBenchmark = (id: string) => {
    setIsTesting(true);
    notify(`Neural Probing Sequence ${id} initiated...`);
    setTimeout(() => {
      setIsTesting(false);
      notify(`Sequence ${id} finalized. Delta registered.`);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Shield size={12} className="text-amber-500" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Formal Verification Active</span>
           </div>
           <h3 className="text-5xl font-syne font-black text-white uppercase italic tracking-tighter">Neural Benchmarks</h3>
        </div>
        <div className="flex items-center gap-4">
           <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Global Integrity</div>
              <div className="text-xl font-syne font-black text-emerald-400 italic">94.8%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modelLab.benchmarks.map(bm => (
          <motion.div 
            key={bm.id}
            whileHover={{ y: -5 }}
            className="glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-10 space-y-8 shadow-2xl relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <Target size={120} />
             </div>

             <div className="flex items-center gap-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--p)]">
                   <Trophy size={24} />
                </div>
                <div>
                   <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{bm.name}</h4>
                   <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2">{bm.results.length} Kernels Tested</div>
                </div>
             </div>

             <div className="space-y-6 relative">
                {bm.results.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl bg-black/40 border border-white/5 opacity-40">
                     <BarChart3 size={32} />
                     <div className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Data Points</div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {bm.results.map((res, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                          <span className="text-white/40 truncate max-w-[140px]">{state.models.find(m => m.id === res.modelId)?.name || 'Unknown Kernel'}</span>
                          <span className={cn(i === 0 ? "text-emerald-400" : "text-white/80")}>{res.score}%</span>
                        </div>
                        <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${res.score}%` }}
                            className={cn("h-full", i === 0 ? "bg-emerald-400" : "bg-white/20")}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             <button 
               onClick={() => startBenchmark(bm.id)}
               disabled={isTesting}
               className={cn(
                 "w-full py-5 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.3em] transition-all flex items-center justify-center gap-3",
                 isTesting ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-white text-black hover:bg-[var(--p)] hover:text-white"
               )}
             >
                {isTesting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )}
                {isTesting ? "Probing..." : "Engage Sequence"}
             </button>
          </motion.div>
        ))}

        {/* CUSTOM BENCHMARK CARD */}
        <div className="border-2 border-dashed border-white/10 rounded-[40px] p-10 flex flex-col items-center justify-center space-y-6 hover:border-[var(--p)]/40 hover:bg-[var(--p)]/5 transition-all group cursor-pointer">
           <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[var(--p)] group-hover:scale-110 transition-all">
              <Search size={32} />
           </div>
           <div className="text-center">
              <div className="text-xl font-syne font-black text-white uppercase italic tracking-tighter">Custom Probe</div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2 px-8 leading-loose">Inject custom validation datasets into the formal logic grid.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
