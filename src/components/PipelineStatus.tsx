import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Loader2, 
  Search, 
  Code, 
  Zap, 
  ShieldCheck, 
  Rocket,
  XCircle 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface Props {
  state: AppState;
}

export default function PipelineStatus({ state }: Props) {
  const { pipeline, isBuilding } = state.appBuilder;
  const hasStarted = isBuilding || Object.values(pipeline).some(s => s !== 'idle');

  if (!hasStarted) return null;

  const steps = [
    { key: 'planning', label: 'Planning & Mapping', icon: Search },
    { key: 'generating', label: 'Neural Synthesis', icon: Code },
    { key: 'wiring', label: 'Logic Integration', icon: Zap },
    { key: 'validating', label: 'Structural Audit', icon: ShieldCheck },
    { key: 'finalizing', label: 'Stage Deployment', icon: Rocket },
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <Rocket size={16} />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase italic tracking-tighter text-white text-left">Synthesis Pipeline</h4>
          <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none text-left">Real-time build sequence</div>
        </div>
      </div>

      <div className="space-y-1.5 pl-1">
        {steps.map((step, i) => {
          const status = pipeline[step.key];
          return (
            <div key={step.key} className="flex items-center gap-4 group">
              <div className="relative flex items-center justify-center">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border shrink-0",
                  status === 'idle' ? "bg-white/[0.02] border-white/5 text-white/10" :
                  status === 'running' ? "bg-[var(--p)]/10 border-[var(--p)]/30 text-[var(--p)] shadow-[0_0_10px_rgba(var(--p-rgb),0.1)]" :
                  status === 'complete' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
                  "bg-red-500/10 border-red-500/30 text-red-400"
                )}>
                  {status === 'running' ? <Loader2 size={14} className="animate-spin" /> : 
                   status === 'complete' ? <CheckCircle2 size={14} /> : 
                   status === 'error' ? <XCircle size={14} /> : 
                   <step.icon size={14} />}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "absolute top-8 left-1/2 -translate-x-1/2 w-[1px] h-3",
                    status === 'complete' ? "bg-emerald-500/20" : "bg-white/5"
                  )} />
                )}
              </div>

              <div className="flex-1 flex items-center justify-between min-w-0 pr-2">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest truncate",
                  status === 'idle' ? "text-white/20" : "text-white/70"
                )}>{step.label}</span>
                <span className={cn(
                  "text-[7px] font-black uppercase italic px-2 py-0.5 rounded-full border",
                  status === 'running' ? "text-[var(--p)] border-[var(--p)]/20 animate-pulse" :
                  status === 'complete' ? "text-emerald-500/60 border-emerald-500/10" :
                  status === 'error' ? "text-red-400 border-red-400/10" :
                  "text-white/5 border-transparent"
                )}>{status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
