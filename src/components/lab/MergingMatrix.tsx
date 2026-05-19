import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Combine, Layers, FlaskConical, Github, Zap, ShieldCheck, History, Save, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AppState } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export const MergingMatrix: React.FC<Props> = ({ state, updateState, notify }) => {
  const { modelLab } = state;
  const [targetBaseId, setTargetBaseId] = useState('');
  const [adapterId, setAdapterId] = useState('');
  const [mergeMethod, setMergeMethod] = useState<'slerp' | 'linear' | 'ties' | 'dare'>('slerp');
  const [quantization, setQuantization] = useState<'INT4' | 'INT8' | 'FP16' | 'BF16'>('FP16');
  const [exportFormat, setExportFormat] = useState<'GGUF' | 'Safetensors' | 'EXL2'>('Safetensors');

  const handleMerge = () => {
    if (!targetBaseId || !adapterId) return notify("Select both a base kernel and an adapter.");
    
    const mergeId = `merge-${Date.now()}`;
    notify(`Initiating ${mergeMethod} fusion for ${exportFormat} export...`);
    
    const newMerge = {
       id: mergeId,
       baseId: targetBaseId,
       adapterId,
       method: mergeMethod,
       quantization,
       format: exportFormat,
       ts: Date.now(),
       status: 'processing' as const
    };

    updateState(s => ({
       ...s,
       modelLab: {
          ...s.modelLab,
          merges: [newMerge, ...s.modelLab.merges]
       }
    }));

    setTimeout(() => {
       updateState(s => ({
          ...s,
          modelLab: {
             ...s.modelLab,
             merges: s.modelLab.merges.map(m => m.id === mergeId ? { ...m, status: 'completed' } : m)
          }
       }));
       notify("Fusion complete. Sovereign weights distilled.");
    }, 5000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-4">
        <h3 className="text-5xl font-syne font-black text-white uppercase italic tracking-tighter">Neural Path Fusion</h3>
        <p className="text-sm font-medium text-white/40 max-w-2xl leading-relaxed uppercase tracking-widest">Combine weights from multiple kernels or merge trained adapters into a unified sovereign core. Our fusion protocol preserves orthogonal integrity during deep-weight interpolation.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <div className="glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-12 space-y-12 shadow-3xl">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] italic flex items-center gap-2">
                       <div className="w-1 h-5 bg-[var(--p)]" /> 1. Base Principal Kernel
                    </label>
                    <select 
                       value={targetBaseId}
                       onChange={(e) => setTargetBaseId(e.target.value)}
                       className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-[11px] font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all shadow-inner appearance-none cursor-pointer"
                    >
                       <option value="">Select Base Model</option>
                       {state.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                 </div>

                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] italic flex items-center gap-2">
                       <div className="w-1 h-5 bg-blue-500" /> 2. Neural Adapter
                    </label>
                    <select 
                       value={adapterId}
                       onChange={(e) => setAdapterId(e.target.value)}
                       className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-[11px] font-black uppercase text-white outline-none focus:border-blue-500 transition-all shadow-inner appearance-none cursor-pointer"
                    >
                       <option value="">Select Checkpoint</option>
                       {modelLab.checkpoints.length === 0 ? (
                         <option disabled>No Checkpoints Available</option>
                       ) : (
                         modelLab.checkpoints.map(cp => <option key={cp.id} value={cp.id}>{cp.name}</option>)
                       )}
                    </select>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] italic leading-none mb-2 block">Fusion Architecture</label>
                    <div className="flex flex-col gap-2">
                       {['slerp', 'ties', 'dare', 'linear'].map(m => (
                          <button 
                             key={m}
                             onClick={() => setMergeMethod(m as any)}
                             className={cn(
                                "p-4 rounded-xl border text-[10px] font-black uppercase transition-all text-left",
                                mergeMethod === m ? "bg-[var(--p)] text-white border-[var(--p)] shadow-lg shadow-[var(--p)]/20" : "bg-white/5 border-white/10 text-white/30 hover:text-white"
                             )}
                          >
                             {m}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] italic leading-none mb-2 block">Quantization Matrix</label>
                    <div className="flex flex-col gap-2">
                       {['INT4', 'INT8', 'FP16', 'BF16'].map(q => (
                          <button 
                             key={q}
                             onClick={() => setQuantization(q as any)}
                             className={cn(
                                "p-4 rounded-xl border text-[10px] font-black uppercase transition-all text-left",
                                quantization === q ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-white/5 border-white/10 text-white/30 hover:text-white"
                             )}
                          >
                             {q} bit
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] italic leading-none mb-2 block">Binary Format Target</label>
                    <div className="flex flex-col gap-2">
                       {['Safetensors', 'GGUF', 'EXL2'].map(f => (
                          <button 
                             key={f}
                             onClick={() => setExportFormat(f as any)}
                             className={cn(
                                "p-4 rounded-xl border text-[10px] font-black uppercase transition-all text-left",
                                exportFormat === f ? "bg-blue-500/20 text-blue-400 border-blue-500/20" : "bg-white/5 border-white/10 text-white/30 hover:text-white"
                             )}
                          >
                             {f}
                          </button>
                       ))}
                    </div>
                 </div>
               </div>

               <div className="space-y-8 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between">
                     <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] italic flex items-center gap-2">
                        Fusion Alpha (Interpolation Ratio)
                     </label>
                     <span className="text-xl font-syne font-black text-[var(--p)] italic">0.5</span>
                  </div>
                  <input type="range" className="w-full accent-[var(--p)] h-1 bg-white/5 rounded-full appearance-none cursor-pointer" defaultValue={50} />
                  <div className="flex justify-between text-[9px] font-black uppercase text-white/10 tracking-[0.4em]">
                     <span>Stable Base</span>
                     <span>Hybrid Equilibrium</span>
                     <span>Adapter Aggressive</span>
                  </div>
               </div>

               <button 
                 onClick={handleMerge}
                 className="w-full py-8 bg-white text-black font-black uppercase italic tracking-[0.5em] rounded-[24px] hover:scale-[1.01] active:scale-95 transition-all shadow-3xl flex items-center justify-center gap-6 group"
               >
                  <Combine size={28} className="group-hover:rotate-12 transition-transform" /> Engage Binary Fusion
               </button>
            </div>
         </div>

         <div className="space-y-10">
            {/* RECENT MERGES */}
            <div className="glass bg-[#0b0d12] border border-white/10 rounded-[32px] p-10 space-y-8 shadow-2xl">
               <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">Fusion Trace</h4>
                  <History size={16} className="text-white/10" />
               </div>
               <div className="space-y-4">
                  {modelLab.merges.length === 0 ? (
                     <div className="py-20 text-center opacity-10 flex flex-col items-center gap-6 border-2 border-dashed border-white/5 rounded-[24px]">
                        <Layers size={48} />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] px-10">Zero Recent Merges Registered</div>
                     </div>
                  ) : (
                     modelLab.merges.map(merge => (
                        <div key={merge.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-4 group relative overflow-hidden">
                           {merge.status === 'processing' && (
                              <motion.div 
                                className="absolute bottom-0 left-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 5, ease: "linear" }}
                              />
                           )}
                           <div className="flex items-center justify-between relative">
                              <div className="text-[11px] font-black text-white uppercase italic">{merge.method} Linearization</div>
                              <div className={cn(
                                 "text-[9px] font-black uppercase px-3 py-1 rounded-full border",
                                 merge.status === 'processing' ? "text-blue-400 border-blue-400/20 animate-pulse bg-blue-500/5" :
                                 merge.status === 'completed' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-red-400 border-red-400/20 bg-red-400/5"
                              )}>{merge.status}</div>
                           </div>
                           <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none">
                              <span>{merge.quantization}</span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span>{merge.format} Target</span>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* SECURITY/PROTOCOL BOX */}
            <div className="p-10 border border-white/5 bg-white/[0.02] rounded-[48px] space-y-8 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                  <ShieldCheck size={160} />
               </div>
               <div className="flex items-center gap-5 relative">
                  <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center text-[var(--p)] shadow-inner">
                     <ShieldCheck size={32} />
                  </div>
                  <div>
                     <div className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Fusion Guard</div>
                     <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Neural Invariant Protocol</div>
                  </div>
               </div>
               <p className="text-[13px] font-medium text-white/40 leading-relaxed relative">
                  Our fusion architecture employs Spherical Linear Interpolation (slerp) to harmonize high-dimensional weights while preventing feature collapse.
                </p>
                <ul className="space-y-4 relative">
                   {[
                      { l: 'Parameter De-Sparsification', c: 'emerald' },
                      { l: 'Orthogonal Alignment', c: 'white' },
                      { l: 'Gradient Optimization', c: 'blue' }
                   ].map(check => (
                      <li key={check.l} className="flex items-center gap-4 text-[10px] font-black text-white/60 uppercase italic tracking-widest">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> {check.l}
                      </li>
                   ))}
                </ul>
            </div>
         </div>
      </div>
    </div>
  );
};
