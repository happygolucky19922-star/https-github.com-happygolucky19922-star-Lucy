import React from 'react';
import { Layers, History, Search, Play, Brain, RefreshCw, Activity, Share2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppState } from '../../types';

interface Props {
  state: AppState;
  updateState: any;
  selectedTrajectory: string | null;
  onSelect: (id: string | null) => void;
}

export const ReflectionEngine: React.FC<Props> = ({ state, updateState, selectedTrajectory, onSelect }) => {
  const currentTraj = state.dreamMode.trajectories.find(t => t.id === selectedTrajectory);

  return (
    <div className="grid grid-cols-12 gap-8 h-full p-8 overflow-y-auto custom-scrollbar">
       <div className="col-span-12 flex items-center justify-between mb-2">
          <div>
             <h2 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                Reflective Engine <span className="text-white/20 text-xl font-sans not-italic">Trajectory Replay</span>
             </h2>
          </div>
          <button className="flex items-center gap-3 px-6 py-3 bg-[var(--p)]/10 border border-[var(--p)]/20 rounded-2xl hover:bg-[var(--p)]/20 transition-all group">
             <RefreshCw size={16} className="text-[var(--p)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[var(--p)] italic">Recalibrate</span>
          </button>
       </div>

       <div className="col-span-12 lg:col-span-4 space-y-6 flex flex-col h-full overflow-hidden">
          <div className="glass bg-black/40 border border-white/5 rounded-3xl p-6 flex-1 flex flex-col overflow-hidden">
             <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                   <Layers className="text-white/40" size={20} />
                   <span className="text-xs font-black uppercase tracking-widest text-white/80 italic">Trajectory History</span>
                </div>
                <Search size={14} className="text-white/20" />
             </div>
             
             <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                {state.dreamMode.trajectories.map(traj => (
                   <button 
                      key={traj.id}
                      onClick={() => onSelect(traj.id === selectedTrajectory ? null : traj.id)}
                      className={cn(
                         "w-full text-left p-6 rounded-2xl border transition-all relative group",
                         selectedTrajectory === traj.id ? "bg-[var(--p)]/10 border-[var(--p)]/30 text-white" : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04]"
                      )}
                   >
                      <div className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-2 italic">{new Date(traj.ts).toLocaleTimeString()}</div>
                      <h4 className="text-[11px] font-black uppercase italic tracking-tighter leading-tight mb-4">{traj.description}</h4>
                      <Play size={12} className={cn("transition-all", selectedTrajectory === traj.id ? "text-[var(--p)] scale-125" : "opacity-0 group-hover:opacity-100")} />
                   </button>
                ))}
             </div>
          </div>
       </div>

       <div className="col-span-12 lg:col-span-8 flex flex-col h-full overflow-hidden">
          {currentTraj ? (
             <div className="glass bg-black/40 border border-white/5 rounded-3xl flex-1 flex flex-col overflow-hidden relative">
                <div className="p-8 border-b border-white/5 shrink-0 flex items-center justify-between bg-white/[0.02]">
                   <div>
                      <div className="text-[9px] font-black text-[var(--p)] uppercase tracking-[0.4em] mb-2 italic">Neural Replay Sequence</div>
                      <h3 className="text-xl font-syne font-black text-white uppercase italic tracking-tighter">{currentTraj.description}</h3>
                   </div>
                   <div className="flex gap-4">
                      <button 
                         onClick={() => {
                            updateState((s: AppState) => ({
                               ...s,
                               dreamMode: { ...s.dreamMode, trajectories: s.dreamMode.trajectories.filter(t => t.id !== selectedTrajectory) }
                            }));
                            onSelect(null);
                         }}
                         className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all italic"
                      >
                         <Trash2 size={12} /> Purge
                      </button>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                   <div className="max-w-2xl mx-auto space-y-12 py-8">
                      {currentTraj.steps.map((step, i) => (
                         <div key={i} className="relative pl-12 group">
                            <div className="absolute left-0 top-0 h-full w-px bg-white/5 last:h-0" />
                            <div className={cn(
                               "absolute left-[-12px] top-0 w-6 h-6 rounded-lg flex items-center justify-center border shadow-lg transition-all group-hover:scale-110",
                               step.type === 'thought' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                               step.type === 'action' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                               step.type === 'reflection' ? "bg-pink-500/10 border-pink-500/20 text-pink-400" :
                               "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            )}>
                               {step.type === 'thought' && <Brain size={12} />}
                               {step.type === 'action' && <Play size={12} />}
                               {step.type === 'reflection' && <RefreshCw size={12} />}
                               {step.type === 'observation' && <Activity size={12} />}
                            </div>
                            <div className="space-y-2">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">{step.type}</span>
                                  <span className="text-[8px] font-bold opacity-10 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{new Date(step.ts).toLocaleTimeString()}</span>
                               </div>
                               <div className="text-[12px] font-bold text-white/70 leading-relaxed font-mono">{step.content}</div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-6 h-full glass border border-white/5 rounded-3xl">
                <Activity size={48} className="animate-pulse" />
                <span className="text-sm font-black uppercase tracking-[0.4em] italic text-center">Awaiting Traces</span>
             </div>
          )}
       </div>
    </div>
  );
};
