import React from 'react';
import { 
  Plus, Database, ArrowRight, CheckCircle2, 
  BarChart3, Clock, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { AppState } from '../../types';
import { cn } from '../../lib/utils';
import { DatasetPassport } from './DatasetPassport';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  onAction: (section: string) => void;
}

export const ForgeOverview: React.FC<Props> = ({ state, updateState, onAction }) => {
  const { datasets } = state.dataForge;

  const steps = [
    { id: 'import', label: 'Import', desc: 'Securely upload local or cloud sources.', icon: Plus },
    { id: 'clean', label: 'Clean', desc: 'AI-driven health check & sanitization.', icon: CheckCircle2 },
    { id: 'review', label: 'Review', desc: 'Manual validation & semantic audit.', icon: BarChart3 },
    { id: 'package', label: 'Package', desc: 'Structure binaries for targeted use.', icon: Clock },
    { id: 'share', label: 'Share', desc: 'Sovereign export or marketplace prep.', icon: ShieldCheck }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
         <div className="space-y-6">
            <h1 className="text-6xl font-syne font-black text-white uppercase italic tracking-tighter leading-none">
               Canva for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Datasets.</span>
            </h1>
            <p className="text-lg text-white/40 font-medium max-w-xl leading-relaxed uppercase tracking-[0.1em]">
               Transform raw entropy into high-fidelity neural fuel. Clean, package, and distribute your intelligence assets with professional-grade precision.
            </p>
            <div className="flex items-center gap-4 pt-4">
               <button 
                 onClick={() => onAction('new')}
                 className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-3"
               >
                  <Plus size={16} /> Start New Dataset
               </button>
               <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                  Documentation
               </button>
            </div>
         </div>

         <div className="lg:w-1/3">
            <div className="glass bg-white/[0.02] border border-white/5 rounded-[40px] p-8 space-y-6">
               <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] italic">System Intelligence</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-black text-white/60">Total Intelligence Stored</span>
                     <span className="text-xs font-black text-white italic">{(datasets.length * 4.2).toFixed(1)} GB</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[65%]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                     <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                        <div className="text-xl font-syne font-black text-emerald-400 italic">{datasets.length}</div>
                        <div className="text-[8px] font-black text-white/20 uppercase mt-1">Active Batches</div>
                     </div>
                     <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                        <div className="text-xl font-syne font-black text-blue-400 italic">214</div>
                        <div className="text-[8px] font-black text-white/20 uppercase mt-1">Verified Nodes</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Visual Workflow */}
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <h3 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter">Manufacturing Workflow</h3>
            <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/5 to-transparent" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                 <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all h-full space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-white/40 group-hover:text-[var(--p)] group-hover:border-[var(--p)]/30 transition-all">
                       <step.icon size={18} />
                    </div>
                    <div>
                       <div className="text-[11px] font-black text-white uppercase italic mb-1">{idx + 1}. {step.label}</div>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                          {step.desc}
                       </p>
                    </div>
                 </div>
                 {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-white/10">
                       <ArrowRight size={16} />
                    </div>
                 )}
              </div>
            ))}
         </div>
      </div>

      {/* Recent Datasets */}
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <h3 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter">Active Archives</h3>
            <button className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">View All Archive</button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {datasets.map(ds => (
              <div key={ds.id} className="group relative">
                 <div className="p-10 glass bg-[#0b0d12] border border-white/10 rounded-[48px] hover:border-white/20 transition-all space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                             <Database size={24} />
                          </div>
                          <div>
                             <h4 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter">{ds.name}</h4>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                  "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border",
                                  ds.status === 'review' ? "border-amber-500/20 text-amber-500 bg-amber-500/5" : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                                )}>
                                   Status: {ds.status.toUpperCase()}
                                </span>
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={() => {
                           updateState(s => ({ ...s, dataForge: { ...s.dataForge, activeDatasetId: ds.id } }));
                           onAction(ds.status);
                         }}
                         className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                       >
                          <ArrowRight size={20} />
                       </button>
                    </div>

                    <DatasetPassport cp={ds} />
                 </div>
              </div>
            ))}

            {datasets.length === 0 && (
              <div className="lg:col-span-2 py-24 text-center opacity-10 flex flex-col items-center gap-6 border-2 border-dashed border-white/5 rounded-[48px]">
                 <Plus size={64} strokeWidth={1} />
                 <div className="space-y-1">
                    <h5 className="text-xl font-syne font-black uppercase italic tracking-tighter">Neural Archives Empty</h5>
                    <p className="text-[10px] font-black uppercase tracking-widest">Start your first distillation sequence to begin.</p>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
