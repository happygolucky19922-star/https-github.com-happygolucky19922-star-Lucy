import React, { useState } from 'react';
import { 
  Package, Rocket, FlaskConical, BarChart3, Search, 
  Share2, Archive, ArrowRight, CheckCircle2, FileJson,
  Table, Layers, Cpu, Database
} from 'lucide-react';
import { AppState } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
  onNext: () => void;
}

export const ForgePackage: React.FC<Props> = ({ state, updateState, notify, onNext }) => {
  const dsId = state.dataForge.activeDatasetId;
  const ds = state.dataForge.datasets.find(d => d.id === dsId);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);

  if (!ds) return <div className="text-center py-20 text-white/20">Select a dataset to begin.</div>;

  const purposes = [
    { id: 'ai', label: 'AI Training', icon: Cpu, desc: 'Optimized JSONL instruction format for SFT/DPO.' },
    { id: 'ft', label: 'Fine-Tuning', icon: FlaskConical, desc: 'Curated preference pairs for human alignment.' },
    { id: 'res', label: 'Research', icon: Search, desc: 'Raw archives with deep metadata and source tracking.' },
    { id: 'ana', label: 'Analytics', icon: BarChart3, desc: 'Clean CSV structures for quantitative ingestion.' },
    { id: 'sea', label: 'Search', icon: Database, desc: 'Pre-chunked embeddings compatible with Vector DBs.' },
    { id: 'pub', label: 'Public Sharing', icon: Share2, desc: 'Highly legible README + metadata distribution.' },
    { id: 'arc', label: 'Archive', icon: Archive, desc: 'Cold storage compressed binary format.' }
  ];

  const handlePackage = () => {
    if (!selectedPurpose) return notify("Select a packaging purpose.");
    notify(`Generating binary structure for ${selectedPurpose.toUpperCase()}...`);
    
    updateState(s => ({
      ...s,
      dataForge: {
        ...s.dataForge,
        datasets: s.dataForge.datasets.map(d => d.id === dsId ? {
          ...d,
          status: 'share',
          config: { ...d.config, purpose: selectedPurpose || d.config.purpose },
          provenance: [...d.provenance, { ts: Date.now(), action: 'Package', description: `Packaged for ${selectedPurpose}` }]
        } : d)
      }
    }));

    setTimeout(() => {
      notify("Binary distribution ready for export.");
      onNext();
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-syne font-black text-white uppercase italic tracking-tighter">Packaging Core</h1>
        <p className="text-sm font-medium text-white/40 uppercase tracking-widest max-w-2xl mx-auto">
           Step 4: Define your distribution targets. The Forge will automatically reshape your intelligence into industry-standard binaries.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {purposes.map(p => (
           <button
             key={p.id}
             onClick={() => setSelectedPurpose(p.label)}
             className={cn(
               "p-8 rounded-[48px] border transition-all text-left flex flex-col gap-6 group relative overflow-hidden",
               selectedPurpose === p.label 
                 ? "bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]" 
                 : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04] hover:border-white/10"
             )}
           >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                selectedPurpose === p.label ? "bg-black text-white" : "bg-white/5 text-white/20 group-hover:text-white"
              )}>
                 <p.icon size={20} />
              </div>
              <div className="space-y-2">
                 <div className="text-xl font-syne font-black uppercase italic tracking-tighter leading-none">{p.label}</div>
                 <p className={cn(
                   "text-[9px] font-bold uppercase tracking-widest leading-relaxed",
                   selectedPurpose === p.label ? "text-black/60" : "text-white/20"
                 )}>
                    {p.desc}
                 </p>
              </div>
              {selectedPurpose === p.label && (
                 <div className="absolute top-8 right-8">
                    <CheckCircle2 size={24} />
                 </div>
              )}
           </button>
         ))}
      </div>

      <div className="flex flex-col items-center gap-8 pt-10">
         <div className="flex items-center gap-3 p-8 glass bg-white/[0.02] border border-white/5 rounded-[40px] max-w-xl">
            <Layers size={24} className="text-blue-400 shrink-0" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-relaxed text-center">
               Selecting a purpose enables specialized compression algorithms and metadata mapping unique to your selected production environment.
            </p>
         </div>

         <button 
           onClick={handlePackage}
           className="px-12 py-5 bg-white text-black font-black uppercase text-sm tracking-widest rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 flex items-center gap-4"
         >
            Generate Distribution <Rocket size={18} />
         </button>
      </div>
    </div>
  );
};
