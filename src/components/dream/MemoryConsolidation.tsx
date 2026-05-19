import React from 'react';
import { Box, Database, Shield, Sparkles, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppState } from '../../types';

interface Props {
  state: AppState;
}

export const MemoryConsolidation: React.FC<Props> = ({ state }) => {
  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
       <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
             <h2 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                Memory Consolidation <span className="text-white/20 text-xl font-sans not-italic">Recursive Summarization</span>
             </h2>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-[var(--p)] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[var(--p)]/20 hover:scale-105 transition-all">
             <Box size={16} />
             <span>Forge Core Memory</span>
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.dreamMode.memories.length === 0 ? (
             <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-10 gap-6">
                <Database size={64} className="animate-pulse" />
                <div className="text-xl font-black uppercase tracking-[0.5em] mb-2 italic">Neural Abyss</div>
             </div>
          ) : (
             state.dreamMode.memories.map(mem => (
                <div key={mem.id} className="glass bg-black/40 border border-white/5 rounded-3xl p-6 group hover:border-[var(--p)]/30 transition-all flex flex-col min-h-[240px]">
                   <div className="flex items-center justify-between mb-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 shadow-lg",
                        mem.type === 'core' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                        mem.type === 'persistent' ? "bg-[var(--p)]/10 border-[var(--p)]/20 text-[var(--p)]" :
                        "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                      )}>
                         {mem.type === 'core' ? <Shield size={18} /> : mem.type === 'persistent' ? <Sparkles size={18} /> : <Layers size={18} />}
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-black text-white/20 italic mb-1 uppercase tracking-widest">{mem.type}</div>
                         <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest italic">{new Date(mem.ts).toLocaleDateString()}</div>
                      </div>
                   </div>
                   <p className="flex-1 text-[12px] font-bold text-white/60 leading-relaxed mb-6 italic line-clamp-4 group-hover:line-clamp-none transition-all">
                      "{mem.content}"
                   </p>
                   <div className="space-y-2 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center px-1">
                         <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Memory Decay</span>
                         <span className="text-[8px] font-bold text-white/40 uppercase">{Math.round((1 - mem.decay) * 100)}% Integrity</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500/50" style={{ width: `${(1 - mem.decay) * 100}%` }} />
                      </div>
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );
};
