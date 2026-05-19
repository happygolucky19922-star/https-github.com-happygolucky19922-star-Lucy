import React from 'react';
import { HelpCircle, BookOpen, Brain, Sparkles, Database, Shield, Rocket, Info, PlayCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ForgeGuides: React.FC = () => {
  const guides = [
    {
      title: "Neural Foundations",
      q: "What is a dataset?",
      a: "Think of a dataset as the 'textbook' for an AI. It's a structured collection of examples that teach a model how to reason, write code, or understand human emotions. The better the textbook, the smarter the student.",
      icon: Database,
      color: "text-blue-400"
    },
    {
      title: "Entropy Management",
      q: "Why cleaning matters?",
      a: "Raw data is often noisy, repetitive, and filled with errors. If an AI learns from trash, it outputs trash ('Garbage In, Garbage Out'). Cleaning ensures the model focuses on high-quality patterns, reducing hallucinations.",
      icon: Sparkles,
      color: "text-emerald-400"
    },
    {
      title: "Pattern Integrity",
      q: "What are semantic duplicates?",
      a: "A dataset might have 100 sentences that all mean the same thing. Training on these 'echoes' makes a model repetitive and narrow. Semantic deduplication removes the echoes and keeps the unique insights.",
      icon: Brain,
      color: "text-purple-400"
    },
    {
      title: "Neural Lineage",
      q: "What is provenance?",
      a: "Provenance is the 'family tree' of your data. It tracks where the data came from, who cleaned it, and how it was modified. This is critical for legal safety, transparency, and building trust in your assets.",
      icon: Shield,
      color: "text-amber-500"
    },
    {
      title: "Clean Distribution",
      q: "Safe sharing or selling?",
      a: "Packaging your data for sale requires stripping sensitive info (PII), verifying licenses, and providing a Trust Card (Dataset Passport). It ensures your asset is ready for terminal production anywhere.",
      icon: Rocket,
      color: "text-cyan-400"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-syne font-black text-white uppercase italic tracking-tighter">Forge Academy</h1>
        <p className="text-sm font-medium text-white/40 uppercase tracking-widest max-w-xl mx-auto">
           Master the art of neural distillation. Simple guides for the foundational era of synthetic intelligence.
        </p>
      </header>

      <div className="space-y-6">
         {guides.map((g, idx) => (
           <div key={idx} className="p-10 glass bg-white/[0.01] border border-white/5 rounded-[48px] hover:border-white/10 transition-all group flex flex-col md:flex-row gap-8">
              <div className={cn("w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", g.color)}>
                 <g.icon size={28} />
              </div>
              <div className="space-y-4 flex-1">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter leading-none">{g.title}</h3>
                    <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Module {idx + 1}</div>
                 </div>
                 <div className="space-y-4">
                    <div className="text-lg font-black text-white/80 uppercase italic tracking-tight">{g.q}</div>
                    <p className="text-sm font-medium text-white/40 leading-relaxed uppercase tracking-wider">{g.a}</p>
                 </div>
                 <div className="pt-2">
                    <button className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] hover:text-white transition-colors">
                       <PlayCircle size={14} /> watch visual breakdown
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="p-10 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-white/5 rounded-[40px] flex items-center justify-between gap-10">
         <div className="space-y-2">
            <h4 className="text-xl font-syne font-black text-white uppercase italic tracking-tighter">Ready to Build?</h4>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Apply these principles in your first Genesis sequence.</p>
         </div>
         <button className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl">
            Go to Factory
         </button>
      </div>
    </div>
  );
};
