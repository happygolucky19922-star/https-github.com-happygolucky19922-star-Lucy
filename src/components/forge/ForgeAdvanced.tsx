import React from 'react';
import { Search, FlaskConical, Target, Shield, Layers, Binary, Cpu, Info, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ForgeAdvanced: React.FC = () => {
  const patents = [
    {
      title: "Vector-Based Semantic Divergence",
      cat: "Semantic Deduplication",
      summary: "Detect and prune near-identical neural patterns using high-dimensional embedding clusters.",
      note: "Reduces training compute by up to 40% while preserving dataset entropy."
    },
    {
      title: "Immutable Lineage Proofs",
      cat: "Provenance Tracking",
      summary: "Cryptographic chaining of data transformations using distributed ledger anchors.",
      note: "Ensures sovereign auditability and legal defensibility of neural assets."
    },
    {
      title: "Anomaly Signature Detection",
      cat: "Poisoned Data Detection",
      summary: "Identifies adversarial injections and Trojan patterns in massive unstructured batches.",
      note: "Primary defense against low-integrity synthetic data contamination."
    },
    {
      title: "Entropy-Weighted Batching",
      cat: "Training Data Cleaning",
      summary: "Dynamic re-weighting of dataset sequences based on information density metrics.",
      note: "Accelerates model convergence by prioritizing high-utility cognitive samples."
    },
    {
      title: "Cross-Modal Fingerprinting",
      cat: "Lineage Tracking",
      summary: "Tracking the flow of intelligence across different data formats (images to text).",
      note: "Essential for multi-modal foundational architecture development."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-4">
            <h1 className="text-4xl font-syne font-black text-white uppercase italic tracking-tighter">Advanced Research</h1>
            <p className="text-sm font-medium text-white/40 uppercase tracking-widest max-w-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
               Exploring the bleeding edge of neural architecture and sovereign data protocols.
            </p>
         </div>
         <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
            <Info size={16} className="text-blue-400" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Optional Expert Module</span>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
         {patents.map((p, idx) => (
           <div key={idx} className="p-10 bg-white/[0.01] border border-white/5 rounded-[48px] hover:border-white/10 transition-all flex flex-col md:flex-row items-center gap-10 group">
              <div className="w-20 h-20 rounded-[32px] bg-black border border-white/5 flex items-center justify-center text-white/20 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all shrink-0 shadow-2xl">
                 <Binary size={32} strokeWidth={1} />
              </div>
              <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest leading-none border border-blue-500/20">{p.cat}</span>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Ref: ARCH-{2026 + idx}</span>
                 </div>
                 <h3 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter leading-none">{p.title}</h3>
                 <p className="text-sm font-medium text-white/40 leading-relaxed uppercase tracking-wider max-w-3xl">
                    {p.summary}
                 </p>
                 <div className="p-4 bg-black/40 border border-white/5 rounded-2xl inline-block">
                    <span className="text-[9px] font-black text-[var(--p)] uppercase tracking-widest italic">{p.note}</span>
                 </div>
              </div>
              <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                 <ExternalLink size={24} />
              </button>
           </div>
         ))}
      </div>
    </div>
  );
};
