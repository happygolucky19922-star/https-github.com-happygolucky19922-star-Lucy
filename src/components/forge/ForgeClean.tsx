import React, { useState } from 'react';
import { 
  Activity, CheckCircle2, AlertTriangle, Shield, 
  Trash2, RefreshCw, Layers, Gauge, Sparkles,
  ArrowRight, Info
} from 'lucide-react';
import { AppState, DataForgeDataset } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
  onNext: () => void;
}

export const ForgeClean: React.FC<Props> = ({ state, updateState, notify, onNext }) => {
  const dsId = state.dataForge.activeDatasetId;
  const ds = state.dataForge.datasets.find(d => d.id === dsId);
  const [cleaning, setCleaning] = useState<string[]>([]);

  if (!ds) return <div className="text-center py-20 text-white/20">Select a dataset to begin.</div>;

  const handleClean = (action: string) => {
    setCleaning(prev => [...prev, action]);
    notify(`Executing: ${action}...`);
    
    setTimeout(() => {
      setCleaning(prev => prev.filter(a => a !== action));
      updateState(s => ({
        ...s,
        dataForge: {
          ...s.dataForge,
          datasets: s.dataForge.datasets.map(d => d.id === dsId ? {
            ...d,
            healthScore: Math.min(d.healthScore + 10, 100),
            qualityMetrics: {
               ...d.qualityMetrics,
               duplicates: action === 'Remove Duplicates' ? 0 : d.qualityMetrics.duplicates,
               brokenRows: action === 'Fix Formatting' ? 0 : d.qualityMetrics.brokenRows
            },
            provenance: [...d.provenance, { ts: Date.now(), action: 'Clean', description: action }]
          } : d)
        }
      }));
      notify(`${action} phase finalized.`);
    }, 2000);
  };

  const metrics = [
    { label: 'Quality Score', val: `${ds.healthScore}%`, icon: Gauge, color: 'text-blue-500' },
    { label: 'Duplicates', val: `${ds.qualityMetrics.duplicates}%`, icon: RefreshCw, color: 'text-amber-500' },
    { label: 'Missing Values', val: `${ds.qualityMetrics.missingValues}%`, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'AI Risk', val: `${ds.qualityMetrics.aiGeneratedProb}%`, icon: Sparkles, color: 'text-purple-500' }
  ];

  const controls = [
    { label: 'Remove Duplicates', desc: 'Spatially cross-reference neural patterns.' },
    { label: 'Fix Formatting', desc: 'Normalize schema to factory standards.' },
    { label: 'Remove Broken Rows', desc: 'Prune corrupted structural elements.' },
    { label: 'Normalize Schema', desc: 'Align labels with universal benchmarks.' },
    { label: 'OCR Cleanup', desc: 'Sharpen textual extraction artifacts.' },
    { label: 'Detect AI Content', desc: 'Benchmark against known LLM entropy.' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-4">
            <h1 className="text-4xl font-syne font-black text-white uppercase italic tracking-tighter">Health Audit</h1>
            <p className="text-sm font-medium text-white/40 uppercase tracking-widest max-w-lg">
               Step 2: Automated diagnostics and cleaning. Sanitize your intelligence assets before validation.
            </p>
         </div>
         <button 
           onClick={onNext}
           className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
         >
            Proceed to Review <ArrowRight size={16} />
         </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Diagnostics */}
         <div className="lg:col-span-4 space-y-8">
            <div className="glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-10 space-y-10">
               <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] italic">Diagnostics</h4>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  {metrics.map(m => (
                    <div key={m.label} className="p-5 bg-black/40 border border-white/5 rounded-[24px] space-y-3">
                       <m.icon size={16} className={m.color} />
                       <div>
                          <div className="text-xl font-syne font-black text-white italic leading-none">{m.val}</div>
                          <div className="text-[8px] font-black text-white/20 uppercase mt-1">{m.label}</div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                     <Shield size={16} className="text-emerald-500" />
                     <span className="text-[11px] font-black text-white uppercase italic">Security Risk Analysis</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                     No critical sensitive data leaks detected in current sampling. Federated privacy layers active.
                  </p>
               </div>
            </div>
         </div>

         {/* Cleaning Actions */}
         <div className="lg:col-span-8">
            <div className="p-10 border border-white/5 bg-white/[0.01] rounded-[40px] space-y-10">
               <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] italic">Sanitization Core</h4>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none flex items-center gap-2">
                    <Info size={12} /> Guided One-Click Scrubbing
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {controls.map(ctrl => (
                    <button
                      key={ctrl.label}
                      onClick={() => handleClean(ctrl.label)}
                      disabled={cleaning.includes(ctrl.label)}
                      className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all text-left flex items-start gap-6 group relative overflow-hidden"
                    >
                       <div className={cn(
                         "w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all",
                         cleaning.includes(ctrl.label) && "animate-spin"
                       )}>
                          {cleaning.includes(ctrl.label) ? <RefreshCw size={18} /> : <CheckCircle2 size={18} />}
                       </div>
                       <div className="flex-1">
                          <div className={cn(
                            "text-base font-syne font-black uppercase italic tracking-tighter mb-1",
                            cleaning.includes(ctrl.label) ? "text-blue-400" : "text-white"
                          )}>
                             {ctrl.label}
                          </div>
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                             {ctrl.desc}
                          </p>
                       </div>
                       {cleaning.includes(ctrl.label) && (
                          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 animate-[loading_2s_linear_infinite]" />
                       )}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <style>{`
         @keyframes loading {
            0% { transform: translateX(-100%); width: 100%; }
            100% { transform: translateX(100%); width: 100%; }
         }
      `}</style>
    </div>
  );
};
