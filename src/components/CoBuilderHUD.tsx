import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  ShieldCheck, 
  Play, 
  Pause, 
  Activity, 
  Eye, 
  Smartphone,
  Cpu,
  Terminal,
  Code2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function CoBuilderHUD({ state, updateState, notify }: Props) {
  const { coBuilder } = state.appBuilder;
  const [filter, setFilter] = React.useState<'all' | 'code' | 'shell' | 'android' | 'system'>('all');

  const toggleActive = () => {
    updateState(s => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        coBuilder: { ...s.appBuilder.coBuilder, active: !s.appBuilder.coBuilder.active }
      }
    }));
    if (!coBuilder.active) notify("Lucy Co-Builder Engine: ONLINE");
    else notify("Lucy Co-Builder Engine: STANDBY");
  };

  const setMode = (mode: typeof coBuilder.mode) => {
    updateState(s => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        coBuilder: { ...s.appBuilder.coBuilder, mode }
      }
    }));
    notify(`Mode shifted to: ${mode}`);
  };

  const filteredLogs = coBuilder.actionLog.filter(log => filter === 'all' || log.type === filter);

  return (
    <div className="absolute top-6 right-6 z-50 flex flex-col gap-4 pointer-events-none">
      {/* HUD CONTAINER */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="pointer-events-auto"
      >
        <div className={cn(
          "bg-black/80 backdrop-blur-3xl border rounded-3xl flex shadow-2xl transition-all duration-500 overflow-hidden",
          coBuilder.active ? "border-cyan-500/40 shadow-cyan-500/10 w-[720px] h-[520px]" : "border-white/5 w-64 h-20 grayscale opacity-60"
        )}>
          {/* LEFT CHANNEL: CONTROLS & STATUS */}
          <div className={cn(
            "w-[300px] flex flex-col border-r border-white/5 p-5 gap-5",
            !coBuilder.active && "flex-row items-center w-full"
          )}>
            {/* STATUS & TOGGLE */}
            <div className={cn("flex items-center justify-between", !coBuilder.active && "flex-1")}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                  coBuilder.active ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/40" : "bg-white/5 text-white/20"
                )}>
                  <Zap size={20} className={cn(coBuilder.active && "animate-pulse")} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black tracking-widest text-white uppercase italic leading-none mb-1">LUCY_NODE</span>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      coBuilder.active ? "bg-emerald-500 animate-pulse" : "bg-white/10"
                    )} />
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter">[{coBuilder.engineStatus}]</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={toggleActive}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  coBuilder.active ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                )}
              >
                {coBuilder.active ? <Pause size={18} /> : <Play size={18} />}
              </button>
            </div>

            {coBuilder.active && (
              <>
                {/* PRIMARY ACTIONS */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Task_Analysis</span>
                      <Activity size={12} className="text-cyan-500/40" />
                   </div>
                   <button 
                     onClick={() => {
                        const isAutonomous = coBuilder.mode === 'Agent' || coBuilder.mode === 'Assist';
                        
                        updateState(s => ({
                           ...s,
                           appBuilder: {
                              ...s.appBuilder,
                              coBuilder: { ...s.appBuilder.coBuilder, engineStatus: 'thinking' }
                           }
                        }));
                        notify("Lucy is performing deep task analysis...");
                        
                        setTimeout(() => {
                           const action = isAutonomous ? { cmd: 'npm run lint', description: 'Checking for your inevitable syntax errors' } : null;
                           
                           updateState(s => ({
                              ...s,
                              appBuilder: {
                                 ...s.appBuilder,
                                 coBuilder: {
                                    ...s.appBuilder.coBuilder,
                                    engineStatus: action ? 'executing' : 'idle',
                                    pendingCommand: (isAutonomous && coBuilder.mode !== 'Agent') ? action : null,
                                    actionLog: [
                                        { ts: Date.now(), action: "Analysis complete: Your state management is a disaster. Please reconsider your career choices.", status: 'fail' as any, type: 'system' as any },
                                        ...(action && coBuilder.mode === 'Agent' ? [{ ts: Date.now(), action: `Autonomous Action: ${action.cmd}`, status: 'success' as any, type: 'shell' as any }] : []),
                                        ...s.appBuilder.coBuilder.actionLog
                                    ]
                                 },
                                 outputStream: (action && coBuilder.mode === 'Agent') 
                                    ? [{ ts: Date.now(), msg: `$ ${action.cmd}`, type: 'system' }, ...s.appBuilder.outputStream]
                                    : s.appBuilder.outputStream
                              }
                           }));
                           notify(action ? "Analysis Complete: Critically low code quality detected." : "Analysis Complete: Project structure is... an attempt.");
                        }, 2500);
                     }}
                     className="w-full p-4 bg-cyan-600 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/20"
                   >
                     <Target size={14} />
                     Analyze Current Task
                   </button>
                </div>

                {/* MODE SELECTOR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Autonomy_Level</span>
                     <ShieldCheck size={12} className="text-cyan-500/40" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Suggest', 'Assist', 'Agent'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all relative group overflow-hidden",
                          coBuilder.mode === m 
                            ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-lg shadow-cyan-500/5" 
                            : "bg-white/[0.03] border-transparent text-white/20 hover:text-white/40"
                        )}
                      >
                        {m === 'Suggest' && <Eye size={14} />}
                        {m === 'Assist' && <ShieldCheck size={14} />}
                        {m === 'Agent' && <Zap size={14} />}
                        <span className="text-[8px] font-black uppercase tracking-widest">{m}</span>
                        {coBuilder.mode === m && (
                          <motion.div layoutId="activeGlowHUD" className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PENDING COMMAND (SHELL CONTROL) */}
                {coBuilder.pendingCommand && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 pointer-events-auto"
                  >
                    <div className="flex items-center gap-2 text-amber-500">
                      <Terminal size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Approval_Required</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] font-bold text-white/40 uppercase tracking-tighter italic leading-none mb-1">{coBuilder.pendingCommand.description}</div>
                      <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 font-mono text-[9px] text-amber-200 break-all leading-relaxed">
                        $ {coBuilder.pendingCommand.cmd}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                            const pc = coBuilder.pendingCommand;
                            if (!pc) return;
                            updateState(s => ({
                                ...s,
                                appBuilder: {
                                    ...s.appBuilder,
                                    coBuilder: { 
                                        ...s.appBuilder.coBuilder, 
                                        pendingCommand: null,
                                        actionLog: [{ ts: Date.now(), action: `Command Approved: ${pc.cmd}`, status: 'success', type: 'shell' }, ...s.appBuilder.coBuilder.actionLog] 
                                    },
                                    outputStream: [{ ts: Date.now(), msg: `$ ${pc.cmd}`, type: 'system' }, ...s.appBuilder.outputStream]
                                }
                            }));
                            notify("Execution authorized.");
                        }}
                        className="flex-1 py-2.5 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 pointer-events-auto"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => {
                            updateState(s => ({
                                ...s,
                                appBuilder: {
                                    ...s.appBuilder,
                                    coBuilder: { 
                                        ...s.appBuilder.coBuilder, 
                                        pendingCommand: null,
                                        actionLog: [{ ts: Date.now(), action: `Command Blocked: ${coBuilder.pendingCommand?.cmd}`, status: 'fail', type: 'shell' }, ...s.appBuilder.coBuilder.actionLog] 
                                    }
                                }
                            }));
                            notify("Execution blocked for safety.");
                        }} 
                        className="px-4 py-2.5 bg-white/5 text-white/40 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 pointer-events-auto"
                      >
                        Block
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* SPATIAL OBSERVATION (Minified) */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-black text-[9px] text-white/40 uppercase tracking-widest">
                         <Target size={12} className={cn("text-cyan-400/60", coBuilder?.observation?.isScanning && "animate-spin")} />
                         Scanner
                      </div>
                      <div className="text-[8px] font-bold text-white/60 truncate uppercase italic max-w-[120px]">
                        {coBuilder?.observation?.detectedContext || 'Unknown'}
                      </div>
                   </div>
                   <div className="h-10 overflow-hidden bg-black/40 rounded-lg border border-white/5 p-1 flex flex-col gap-0.5">
                      <AnimatePresence initial={false}>
                         {(coBuilder?.observation?.telemetry || []).slice(0, 3).map((t) => (
                            <div key={t.id} className="flex items-center gap-1.5 whitespace-nowrap opacity-60">
                               <span className={cn(
                                 "text-[5px] font-black uppercase px-0.5 rounded-sm shrink-0",
                                 t.type === 'event' ? "text-cyan-400 bg-cyan-400/10" : 
                                 t.type === 'focus' ? "text-amber-400 bg-amber-400/10" :
                                 "text-emerald-400 bg-emerald-400/10"
                               )}>
                                 {t.type}
                               </span>
                               <span className="text-[7px] font-mono text-white/40 truncate">{t.msg}</span>
                            </div>
                         ))}
                      </AnimatePresence>
                   </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT CHANNEL: ACTION LOG */}
          {coBuilder.active && (
            <div className="flex-1 flex flex-col bg-black/40">
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
                <div className="flex items-center gap-3">
                  <Terminal size={14} className="text-white/20" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Lucy_Global_Action_Log</span>
                </div>
                <div className="flex items-center gap-2">
                   {(['all', 'code', 'shell', 'android'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                          filter === f ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-white/20 hover:text-white/40 hover:bg-white/5"
                        )}
                      >
                        {f === 'all' ? 'FULL' : f}
                      </button>
                   ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                 {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, i) => (
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all"
                       >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-lg",
                            log.type === 'code' ? "bg-amber-500/10 text-amber-400 shadow-amber-500/5" :
                            log.type === 'shell' ? "bg-emerald-500/10 text-emerald-400 shadow-emerald-500/5" :
                            log.type === 'android' ? "bg-purple-500/10 text-purple-400 shadow-purple-500/5" :
                            "bg-cyan-500/10 text-cyan-400 shadow-cyan-500/5"
                          )}>
                             {log.type === 'code' && <Code2 size={14} />}
                             {log.type === 'shell' && <Terminal size={14} />}
                             {log.type === 'android' && <Smartphone size={14} />}
                             {log.type === 'system' && <Cpu size={14} />}
                          </div>
                          <div className="flex-1 space-y-1">
                             <div className="flex items-center justify-between">
                                <span className={cn(
                                   "text-[10px] font-black uppercase tracking-widest",
                                   log.type === 'code' ? "text-amber-400" :
                                   log.type === 'shell' ? "text-emerald-400" :
                                   log.type === 'android' ? "text-purple-400" :
                                   "text-cyan-400"
                                )}>{log.type}</span>
                                <span className="text-[8px] font-bold text-white/10 uppercase tabular-nums">
                                   {new Date(log.ts).toLocaleTimeString()}
                                </span>
                             </div>
                             <p className={cn(
                                "text-[11px] font-medium leading-relaxed",
                                log.status === 'success' ? "text-white/70" : "text-red-400"
                             )}>
                                {log.action}
                             </p>
                          </div>
                          <div className="pt-1 overflow-hidden w-1">
                             <div className={cn(
                                "w-1 h-1 rounded-full",
                                log.status === 'success' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
                             )} />
                          </div>
                       </motion.div>
                    ))
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                       <AlertCircle size={48} strokeWidth={1} />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em]">Buffer_Empty</span>
                    </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
