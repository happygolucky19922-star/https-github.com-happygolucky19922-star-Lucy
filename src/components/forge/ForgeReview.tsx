import React, { useState } from 'react';
import { 
  Eye, CheckCircle2, XCircle, Edit3, Sparkles, 
  Search, ArrowRight, Tag, ShieldCheck, AlertCircle,
  ChevronLeft, ChevronRight, Split
} from 'lucide-react';
import { AppState, DataForgeDataset } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
  onNext: () => void;
}

export const ForgeReview: React.FC<Props> = ({ state, updateState, notify, onNext }) => {
  const dsId = state.dataForge.activeDatasetId;
  const ds = state.dataForge.datasets.find(d => d.id === dsId);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!ds) return <div className="text-center py-20 text-white/20">Select a dataset to begin.</div>;

  const samples = [
    { orig: '{"text": "  hello world!  ", "label": "greet"}', clean: '{"text": "hello world!", "label": "greeting"}' },
    { orig: '{"text": "user: hi\nbot: hey dere", "label": "chat"}', clean: '{"instruction": "Respond to a greeting.", "input": "hi", "output": "Hello! How can I assist you today?"}' },
    { orig: '{"text": "123 Main St, New York, NY", "label": "addr"}', clean: '{"address": "123 Main St", "city": "New York", "state": "NY", "country": "USA"}' }
  ];

  const handleAction = (type: string) => {
    notify(`${type} applied to current sequence.`);
    if (activeIdx < samples.length - 1) setActiveIdx(prev => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-4">
            <h1 className="text-4xl font-syne font-black text-white uppercase italic tracking-tighter">Semantic Audit</h1>
            <p className="text-sm font-medium text-white/40 uppercase tracking-widest max-w-lg">
               Step 3: Human-in-the-loop validation. Verify distillation accuracy and cross-reference patterns.
            </p>
         </div>
         <button 
           onClick={onNext}
           className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
         >
            Finish Review <ArrowRight size={16} />
         </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-12 space-y-8">
            {/* Split Preview */}
            <div className="p-1 glass bg-[#0b0d12] border border-white/10 rounded-[48px] overflow-hidden flex flex-col md:flex-row h-[500px]">
               {/* Left: Original */}
               <div className="flex-1 p-12 space-y-8 flex flex-col border-b md:border-b-0 md:border-r border-white/5">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">Raw Sequence</h4>
                     <span className="text-[9px] font-black text-white/40 uppercase">Entropy: High</span>
                  </div>
                  <div className="flex-1 bg-black/40 rounded-[32px] p-8 border border-white/5 font-mono text-xs text-white/40 overflow-auto custom-scrollbar">
                     {samples[activeIdx].orig}
                  </div>
               </div>

               {/* Divider */}
               <div className="hidden md:flex flex-col items-center justify-center p-4 bg-white/5 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl relative">
                     <Split size={20} />
                     <div className="absolute top-[-100%] bottom-[-100%] w-px bg-white/10 -z-10" />
                  </div>
               </div>

               {/* Right: Cleaned */}
               <div className="flex-1 p-12 space-y-8 flex flex-col bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic leading-none">Normalized Target</h4>
                     <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-2">
                       <CheckCircle2 size={10} /> Auto-Fixed
                     </span>
                  </div>
                  <div className="flex-1 bg-black/60 rounded-[32px] p-8 border border-blue-500/20 font-mono text-xs text-blue-100 overflow-auto custom-scrollbar shadow-inner shadow-blue-500/5">
                     {samples[activeIdx].clean}
                  </div>
               </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
               <div className="flex items-center gap-4">
                  <button 
                    disabled={activeIdx === 0}
                    onClick={() => setActiveIdx(prev => prev - 1)}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-all"
                  >
                     <ChevronLeft size={20} />
                  </button>
                  <div className="text-[10px] font-black text-white uppercase italic tracking-[0.2em]">Sample {activeIdx + 1} / {samples.length}</div>
                  <button 
                    disabled={activeIdx === samples.length - 1}
                    onClick={() => setActiveIdx(prev => prev + 1)}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-all"
                  >
                     <ChevronRight size={20} />
                  </button>
               </div>

               <div className="flex flex-wrap items-center justify-center gap-3">
                  <button 
                    onClick={() => handleAction('Rejected')}
                    className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                  >
                     <XCircle size={14} /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction('Modified')}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                     <Edit3 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleAction('Approved')}
                    className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-2"
                  >
                     <CheckCircle2 size={14} /> Approve Sequence
                  </button>
               </div>
            </div>
         </div>

         {/* Sidebar Insights */}
         <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-4">
               <div className="flex items-center gap-3">
                  <Tag size={16} className="text-blue-400" />
                  <span className="text-[11px] font-black text-white uppercase italic">Auto-Labeling Confidence</span>
               </div>
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[92%]" />
               </div>
               <div className="flex justify-between text-[9px] font-bold text-white/20 uppercase tracking-widest italic">
                  <span>Probability</span>
                  <span>92% Stable</span>
               </div>
            </div>

            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-4">
               <div className="flex items-center gap-3">
                  <AlertCircle size={16} className="text-amber-500" />
                  <span className="text-[11px] font-black text-white uppercase italic">Semantic Duplicates</span>
               </div>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                  2 similar sequences detected in neighborhood clusters. Verify uniqueness.
               </p>
            </div>

            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-4">
               <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-[11px] font-black text-white uppercase italic">Anonymity Proof</span>
               </div>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                  All PII markers successfully masked. Provenance lineage preserved.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
