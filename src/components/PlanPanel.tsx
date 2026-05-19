import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Cpu, Database, ListChecks } from 'lucide-react';
import { AppState } from '../types';

interface Props {
  state: AppState;
}

export default function PlanPanel({ state }: Props) {
  const plan = state.appBuilder.plan;

  return (
    <AnimatePresence>
      {plan && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--p)]/20 text-[var(--p)] flex items-center justify-center">
              <ListChecks size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase italic tracking-tighter text-white">Blueprint</h4>
              <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none">Synthesized Architecture</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--p)]/60">
                <Layout size={12} /> UI Components
              </div>
              <ul className="grid grid-cols-1 gap-1.5 list-none">
                 {plan && Array.isArray(plan.ui) && plan.ui.map((item: any, i) => (
                    <li key={`ui-${i}`} className="text-[10px] font-medium text-white/50 flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-all">
                       <span className="w-1.5 h-1.5 rounded-full bg-[var(--p)]/40 shrink-0" /> 
                       <span className="truncate">{typeof item === 'object' ? (item.name || item.title || item.entity || JSON.stringify(item)) : item}</span>
                    </li>
                 ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500/60">
                <Cpu size={12} /> Logic Nodes
              </div>
              <ul className="grid grid-cols-1 gap-1.5 list-none">
                 {plan && Array.isArray(plan.backend) && plan.backend.map((item: any, i) => (
                    <li key={`backend-${i}`} className="text-[10px] font-medium text-white/50 flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-all">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 shrink-0" /> 
                       <span className="truncate">{typeof item === 'object' ? (item.name || item.title || item.entity || JSON.stringify(item)) : item}</span>
                    </li>
                 ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-500/60">
                <Database size={12} /> Data Schema
              </div>
              <ul className="grid grid-cols-1 gap-1.5 list-none">
                 {plan && Array.isArray(plan.data) && plan.data.map((item: any, i) => (
                    <li key={`data-${i}`} className="text-[10px] font-medium text-white/50 flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-all">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 shrink-0" /> 
                       <span className="truncate">{typeof item === 'object' ? (item.entity || item.name || item.title || JSON.stringify(item)) : item}</span>
                    </li>
                 ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-500/60">
                <ListChecks size={12} /> Execution Path
              </div>
              <ul className="grid grid-cols-1 gap-1.5 list-none">
                 {plan && Array.isArray(plan.steps) && plan.steps.map((item: any, i) => (
                    <li key={`step-${i}`} className="text-[10px] font-medium text-white/50 flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-all">
                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40 shrink-0" /> 
                       <span className="truncate">{typeof item === 'object' ? (item.name || item.title || item.step || JSON.stringify(item)) : item}</span>
                    </li>
                 ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
