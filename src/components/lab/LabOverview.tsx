import React from 'react';
import { motion } from 'motion/react';
import { FlaskConical, Zap, Combine, Stethoscope, Save, Rocket, History, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  onTabChange: (tab: any) => void;
}

export const LabOverview: React.FC<Props> = ({ onTabChange }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HERO SECTION */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--p)]/30 via-blue-500/20 to-[var(--p)]/30 rounded-[40px] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />
        <div className="relative glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <FlaskConical size={240} />
          </div>
          
          <div className="max-w-2xl space-y-8 relative">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-[var(--p)]/10 border border-[var(--p)]/20 rounded-full"
              >
                <Zap size={14} className="text-[var(--p)] animate-pulse" />
                <span className="text-[10px] font-black text-[var(--p)] uppercase tracking-[0.2em] italic">Neural Engine v3.1_Sovereign</span>
              </motion.div>
              
              <h2 className="text-6xl font-syne font-black text-white uppercase italic tracking-tighter leading-none">
                Distill Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--p)] to-blue-500">Domain Intelligence</span>
              </h2>
              
              <p className="text-base font-medium text-white/50 leading-relaxed max-w-xl">
                The Frontier Lab provides an industrial-grade workspace for fine-tuning, merging, and benchmarking local weights. Achieve maximum inference performance with evidence-led architectural optimization.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => onTabChange('training')}
                className="px-8 py-5 bg-[var(--p)] hover:bg-[#ff4d94] text-white font-black uppercase italic tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--p)]/30"
              >
                Launch Optimization
              </button>
              <button 
                onClick={() => onTabChange('retrain')}
                className="px-8 py-5 glass bg-white/5 border border-white/10 text-white/60 font-black uppercase italic tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all"
              >
                View Trajectories
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={Combine}
          title="Neural Merging"
          desc="Orchestrate weight arithmetic. Fuse multiple kernels into a hybrid sovereign core without retraining."
          action={() => onTabChange('merging')}
          color="text-[var(--p)]"
        />
        <FeatureCard 
          icon={Stethoscope}
          title="Structural Audit"
          desc="Quantifiably measure logic drift and hallucination risk using multi-domain benchmarks."
          action={() => onTabChange('benchmark')}
          color="text-emerald-500"
        />
        <FeatureCard 
          icon={Save}
          title="Export Logic"
          desc="Compress Distilled weights into deployment-ready GGUF or EXL2 binary formats."
          action={() => onTabChange('export')}
          color="text-blue-500"
        />
      </div>
    </div>
  );
};

function FeatureCard({ icon: Icon, title, desc, action, color }: any) {
  return (
    <div 
      onClick={action}
      className="glass bg-[#0b0d12] border border-white/5 rounded-[32px] p-8 space-y-6 hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-[60px] group-hover:bg-[var(--p)]/10 transition-colors" />
      <div className={cn("w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg mb-8", color)}>
        <Icon size={28} />
      </div>
      <div className="space-y-3">
        <h4 className="text-xl font-syne font-black text-white uppercase italic tracking-tighter">{title}</h4>
        <p className="text-[12px] font-medium text-white/40 leading-relaxed">{desc}</p>
      </div>
      <div className="pt-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-all">
        Engage Module <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
