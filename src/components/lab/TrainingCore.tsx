import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Play, Terminal as TerminalIcon, Activity, Cpu, Rocket, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppState, TrainingJob } from '../../types';
import { cn } from '../../lib/utils';
import { LabEngine } from '../../services/labEngine';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export const TrainingCore: React.FC<Props> = ({ state, updateState, notify }) => {
  const { modelLab } = state;
  const [view, setView] = useState<'monitor' | 'history'>('monitor');
  const activeJob = modelLab.jobs.find(j => j.id === modelLab.activeJobId);
  const [method, setMethod] = useState<TrainingJob['method']>('LoRA');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAbort = (jobId: string) => {
    updateState(s => ({
      ...s,
      modelLab: {
        ...s.modelLab,
        jobs: s.modelLab.jobs.map(j => j.id === jobId ? { ...j, status: 'failed', logs: [...j.logs, '[SYSTEM] FATAL: Process terminated by supervisor core.'] } : j)
      }
    }));
    notify(`Job ${jobId} aborted. All progress discarded.`);
  };

  // Simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      const runningJobs = modelLab.jobs.filter(j => j.status === 'running' || j.status === 'pending');
      if (runningJobs.length === 0) return;

      updateState(s => ({
        ...s,
        modelLab: {
          ...s.modelLab,
          jobs: s.modelLab.jobs.map(j => {
            if (j.status === 'running' || j.status === 'pending') {
              const next = LabEngine.getNextJobState(j);
              if (next.status === 'completed' && j.status !== 'completed') {
                // Auto-notify when a job finish
                setTimeout(() => notify(`Optimization ${j.id} finalized. Checkpoint preserved.`), 100);
              }
              return next;
            }
            return j;
          })
        }
      }));
    }, 2000);

    return () => clearInterval(timer);
  }, [modelLab.jobs.length]);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeJob?.logs.length]);

  const handleLaunch = async () => {
    if (!modelLab.selectedModelId) return notify("Select a target kernel first.");
    if (modelLab.datasets.length === 0) return notify("No datasets available for training.");

    const newJob = await LabEngine.initializeTraining(
      modelLab.selectedModelId,
      modelLab.datasets[0].id,
      method
    );

    updateState(s => ({
      ...s,
      modelLab: {
        ...s.modelLab,
        jobs: [newJob, ...s.modelLab.jobs],
        activeJobId: newJob.id
      }
    }));

    notify(`Training job ${newJob.id} queued on virtual cluster.`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter">Optimization Core</h3>
          <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Surface-weight distillation & neural pruning</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-black/60 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-emerald-400 italic flex items-center gap-3">
            <Cpu size={14} className="animate-spin-slow" /> Cluster Status: Operational (A100-80G x 8)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONFIG PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-10 space-y-10 shadow-2xl">
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic ml-1">1. Principal Kernel</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all appearance-none cursor-pointer"
                    value={modelLab.selectedModelId || ''}
                    onChange={(e) => updateState(s => ({ ...s, modelLab: { ...s.modelLab, selectedModelId: e.target.value } }))}
                  >
                    <option value="">Select Base Model</option>
                    {state.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic ml-1">2. Training Pipeline</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['LoRA', 'QLoRA', 'DPO', 'SFT'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setMethod(m as any)}
                        className={cn(
                          "py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                          method === m 
                            ? "bg-[var(--p)] text-white border-[var(--p)] shadow-lg shadow-[var(--p)]/20" 
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic ml-1">3. Epoch Capacity</label>
                  <div className="flex items-center justify-between p-5 bg-black/40 border border-white/10 rounded-2xl">
                     <span className="text-xs font-black text-white font-mono">3.0</span>
                     <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">-</button>
                        <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">+</button>
                     </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleLaunch}
              className="w-full py-6 bg-white text-black font-black uppercase italic tracking-[0.4em] rounded-[24px] hover:bg-[var(--p)] hover:text-white hover:scale-[1.02] active:scale-95 transition-all shadow-3xl flex items-center justify-center gap-4 group"
            >
              <Zap size={24} className="group-hover:animate-pulse" />
              Engage Optimization
            </button>
          </div>
        </div>

        {/* MONITORING PANEL */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-8 flex flex-col h-[600px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--p)]/20 overflow-hidden">
               {activeJob?.status === 'running' && (
                 <motion.div 
                   className="h-full bg-[var(--p)] shadow-[0_0_15px_var(--p)]"
                   animate={{ x: ['-100%', '100%'] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 />
               )}
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--p)]">
                   <Activity size={20} className={activeJob?.status === 'running' ? "animate-pulse" : ""} />
                </div>
                <div>
                   <div className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic leading-none">Real-time telemetry</div>
                   <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">Sovereign Cluster Node_01</div>
                </div>
              </div>
              
              {activeJob && (
                <div className="flex items-center gap-6">
                   <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                      <button 
                        onClick={() => setView('monitor')}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          view === 'monitor' ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white"
                        )}
                      >Monitor</button>
                      <button 
                        onClick={() => setView('history')}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          view === 'history' ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white"
                        )}
                      >History</button>
                   </div>
                   <div className="text-right">
                      <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Loss Value</div>
                      <div className="text-xl font-syne font-black text-white italic">
                         {activeJob.metrics.loss[activeJob.metrics.loss.length - 1].toFixed(4)}
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Throughput</div>
                      <div className="text-xl font-syne font-black text-emerald-400 italic">
                         {activeJob.metrics.tokensPerSecond.toLocaleString()} <span className="text-[8px] opacity-40">T/s</span>
                      </div>
                   </div>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
               {view === 'history' ? (
                 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {modelLab.jobs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                         <Rocket size={48} />
                         <div className="text-[10px] font-black uppercase tracking-widest">No Historical Logs</div>
                      </div>
                    ) : (
                      modelLab.jobs.map(job => (
                        <div key={job.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/[0.05] transition-all group">
                           <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                 <span className="text-[11px] font-black text-white uppercase italic">{job.method} Optimization</span>
                                 <span className={cn(
                                   "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                                   job.status === 'completed' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                                   job.status === 'failed' ? "text-red-500 border-red-500/20 bg-red-500/5" : "text-blue-400 border-blue-400/20 bg-blue-400/5"
                                 )}>{job.status}</span>
                              </div>
                              <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{job.id} • {job.progress.toFixed(0)}% Progress</div>
                           </div>
                           <button 
                             onClick={() => {
                               updateState(s => ({ ...s, modelLab: { ...s.modelLab, activeJobId: job.id } }));
                               setView('monitor');
                             }}
                             className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-black text-[9px] font-black uppercase rounded-xl transition-all"
                           >Inspect</button>
                        </div>
                      ))
                    )}
                 </div>
               ) : activeJob ? (
                 <>
                   <div 
                     ref={scrollRef}
                     className="flex-1 bg-black/60 rounded-3xl border border-white/10 p-8 font-mono text-[11px] leading-relaxed text-white/60 overflow-y-auto custom-scrollbar space-y-2 mb-8 shadow-inner"
                   >
                     {activeJob.logs.map((log, i) => (
                       <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                         <span className="text-white/20 shrink-0 select-none">[{i.toString().padStart(3, '0')}]</span>
                         <span className={cn(
                           log.includes('[SYSTEM]') ? 'text-[var(--p)] font-black' : 
                           log.includes('[ERROR]') ? 'text-red-500' : 'text-white/70'
                         )}>{log}</span>
                       </div>
                     ))}
                     <div className="w-2.5 h-5 bg-[var(--p)] animate-pulse inline-block align-middle ml-2" />
                   </div>

                   <div className="h-32 flex items-end gap-1 px-4">
                      {activeJob.metrics.loss.map((l, i) => (
                        <motion.div 
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-[var(--p)]/40 to-[var(--p)]/80 rounded-t-sm" 
                          style={{ height: `${Math.max(5, Math.min(100, (1.2 / l) * 30))}%` }} 
                        />
                      ))}
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 opacity-10">
                   <TerminalIcon size={120} strokeWidth={0.5} className="text-white" />
                   <div className="space-y-2">
                     <h4 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter">Cluster Standby</h4>
                     <p className="text-[11px] font-medium max-w-[280px] uppercase tracking-widest leading-loose">Neural paths are offline. Initiate an optimization sequence to begin weight distillation.</p>
                   </div>
                 </div>
               )}
            </div>

            <div className="mt-8 flex items-center justify-between pt-8 border-t border-white/5">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border",
                    activeJob?.status === 'running' ? "text-[var(--p)] border-[var(--p)]/30 animate-pulse bg-[var(--p)]/5" : 
                    activeJob?.status === 'completed' ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5" : "text-white/20 border-white/10"
                  )}>
                    {activeJob?.status || 'IDLE'}
                  </div>
                  {activeJob && (
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                       Job ID: {activeJob.id}
                    </div>
                  )}
               </div>
               <div className="flex items-center gap-4">
                  {activeJob?.status === 'running' && (
                    <button 
                      onClick={() => handleAbort(activeJob.id)}
                      className="px-5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all outline-none"
                    >
                      Abort Job
                    </button>
                  )}
                  {activeJob?.status === 'completed' && (
                    <button className="px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase flex items-center gap-2">
                       <CheckCircle2 size={12} /> Optimization Finalized
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
         .animate-spin-slow { animation: spin 8s linear infinite; }
         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
