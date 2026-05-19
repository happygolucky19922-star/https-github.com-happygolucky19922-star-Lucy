import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, RefreshCw, Zap, Binary, Activity as ActivityIcon, 
  Globe, Shield, Bot, Send, Cpu, Command
} from 'lucide-react';
import { cn } from '../lib/utils';
import { System2Executive } from '../lib/executive';

interface ExecutiveViewProps {
  state: any;
  updateState: any;
  toggleModelLoad: (id: string) => void;
}

export default function ExecutiveView({ state, updateState, toggleModelLoad }: ExecutiveViewProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const activeModelId = state.arenaModel;
  const activeModel = state.models.find((m: any) => m.id === activeModelId);

   const templates = [
      { id: 'sec', name: 'Security Audit', prompt: 'Audit the filesystem for weak permissions and suggest remediation.' },
      { id: 'net', name: 'Network Analysis', prompt: 'Capture 100 packets on eth0 and identify suspicious TCP patterns.' },
      { id: 'dbg', name: 'Stack Inspection', prompt: 'Run GDB on the /usr/bin/python3 process and extract stack traces for pid 1.' }
   ];

  const runExecutive = async () => {
    if (!prompt || !activeModelId) return;
    setIsExecuting(true);
    setLogs([]);
    setResult(null);

    updateState((s: any) => ({
      ...s,
      infra: {
        ...s.infra,
        agentHistory: [
          { id: Date.now(), goal: prompt, status: 'running', ts: Date.now() },
          ...(s.infra.agentHistory || [])
        ]
      }
    }));

    const exec = new System2Executive((log) => {
       setLogs(prev => [...prev, log]);
    });

    try {
      const final = await exec.run(prompt, activeModelId, 'Custom');
      setResult(final);
    } catch (e: any) {
      setLogs(prev => [...prev, `[CRITICAL_FAULT] Loop aborted: ${e.message}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 h-full flex flex-col bg-black overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--p)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-4 lg:space-y-6 overflow-hidden relative z-10 selection:bg-[var(--p)] selection:text-white">
        <header className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--p)]/20 text-[var(--p)] flex items-center justify-center border border-[var(--p)]/30 shadow-2xl">
                 <Terminal size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-syne font-black uppercase italic text-white flex items-center gap-3 tracking-tighter">
                   Executive Core
                   <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] uppercase font-black tracking-widest border border-emerald-500/20">Loop Ready</div>
                 </h2>
                 <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 text-white">Reasoning + Action Autonomous Sovereign Loop</p>
              </div>
           </div>

           {/* MODEL SELECTOR */}
           <div className="relative group/exec-selector cursor-pointer">
              <div className={cn(
                 "p-4 px-8 rounded-2xl glass border transition-all flex items-center gap-4",
                 activeModelId ? "border-[var(--p)]/40 bg-[var(--p)]/5" : "border-white/5"
              )}>
                 <div className="text-right">
                    <div className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">Execution Base</div>
                    <div className="text-xs font-black uppercase italic text-white tracking-wider">
                       {activeModel?.name || 'Select Kernel'}
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover/exec-selector:text-[var(--p)] transition-colors">
                    <Bot size={18} />
                 </div>
              </div>

              <div className="absolute top-full right-0 mt-4 w-72 glass bg-black/95 border border-white/10 rounded-[32px] p-6 shadow-2xl opacity-0 group-hover/exec-selector:opacity-100 pointer-events-none group-hover/exec-selector:pointer-events-auto transition-all transform translate-y-2 group-hover/exec-selector:translate-y-0 z-50">
                 <div className="space-y-4 text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--p)] border-b border-white/5 pb-2 italic">Neural Execution Matrix</div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                       {state.models.map((m: any) => (
                          <div key={m.id} className={cn(
                             "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group/item",
                             activeModelId === m.id ? "bg-[var(--p)]/10 border-[var(--p)]/30" : "bg-white/5 border-white/5 hover:bg-white/10"
                          )} onClick={() => updateState((s: any) => ({ ...s, arenaModel: m.id }))}>
                             <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black truncate uppercase italic tracking-tighter text-white">{m.name}</div>
                                <div className="text-[8px] font-bold opacity-30 uppercase text-white">{m.backend}</div>
                             </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); toggleModelLoad(m.id); }}
                                className={cn(
                                   "p-1.5 px-3 rounded-lg transition-all flex items-center gap-2",
                                   m.isLoaded ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 opacity-40 group-hover/item:opacity-100"
                                )}>
                                {m.isLoaded ? <Zap size={10} className="fill-current" /> : <Zap size={10} />}
                                <span className="text-[8px] font-black uppercase">{m.isLoaded ? 'Kill' : 'Init'}</span>
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 overflow-hidden">
           {/* LOGS PANEL */}
           <div className="glass rounded-[32px] border-white/5 flex flex-col overflow-hidden bg-black/40 shadow-2xl">
              <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                 <div className="text-[9px] font-black uppercase opacity-30 tracking-[0.3em]">Execution Trace Timeline</div>
                 {isExecuting && (
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-[var(--p)] animate-pulse tracking-widest">Processing</span>
                      <RefreshCw size={12} className="animate-spin text-[var(--p)]" />
                   </div>
                 )}
              </div>
              <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-3">
                 {logs.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
                      <Binary size={48} strokeWidth={0.5} />
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Loop Initialization</p>
                        <p className="text-[8px] max-w-[150px] font-medium leading-relaxed">Executive requires a specific objective to begin cognitive cycle.</p>
                      </div>
                   </div>
                 ) : (
                   logs.map((log, i) => (
                     <motion.div 
                       initial={{ opacity: 0, x: -10 }} 
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       key={i} 
                       className={cn(
                        "p-4 rounded-xl border transition-all leading-relaxed",
                        log.startsWith('[STEP') ? "bg-white/5 border-white/10 text-white font-bold" :
                        log.startsWith('[REASON') ? "bg-blue-500/5 border-blue-500/10 text-blue-300 italic" :
                        log.startsWith('[ACTION') ? "bg-[var(--p)]/10 border-[var(--p)]/20 text-[var(--p)]" :
                        log.startsWith('[OBSERVATION') ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300" :
                        "border-transparent text-white/50"
                      )}
                     >
                        {log}
                     </motion.div>
                   ))
                 )}
                 {result && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="p-6 bg-emerald-500 text-black rounded-[32px] font-bold mt-4 shadow-2xl relative overflow-hidden"
                   >
                      <div className="absolute top-0 right-0 p-4 opacity-20"><Bot size={32} /></div>
                      <div className="text-[9px] uppercase tracking-widest opacity-60 mb-2 font-black">Success: System Conclusion Reached</div>
                      <div className="text-xs leading-relaxed">{result}</div>
                   </motion.div>
                 )}
              </div>
           </div>

           {/* CONTROL PANEL */}
           <div className="space-y-4 lg:space-y-6 flex flex-col overflow-hidden">
              <div className="glass p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border-white/5 space-y-4 lg:space-y-6 bg-gradient-to-br from-white/2 to-transparent shadow-2xl flex-1 flex flex-col overflow-hidden">
                 <div className="space-y-3 flex-1 flex flex-col min-h-0">
                    <label className="text-[9px] font-black uppercase opacity-30 tracking-[0.4em]">Autonomous Objective Allocation</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Analyze clusters..."
                      className="w-full flex-1 bg-black/40 border border-white/5 rounded-[24px] lg:rounded-[32px] p-6 text-sm font-medium focus:border-[var(--p)] outline-none shadow-inner text-white placeholder:opacity-10 leading-relaxed resize-none"
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest opacity-30">
                       Objective Templates
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                       {templates.map(t => (
                          <button 
                            key={t.id}
                            onClick={() => setPrompt(t.prompt)}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 text-left hover:border-[var(--p)]/40 transition-all group lg:min-h-[60px]"
                          >
                             <div className="text-[8px] font-black text-white/40 group-hover:text-white uppercase mb-0.5">{t.name}</div>
                             <div className="text-[7px] font-medium text-white/10 uppercase truncate">{t.prompt}</div>
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest opacity-30">
                       System Sidecars
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       {[
                         { name: 'SHELL', icon: Terminal, color: 'text-white' },
                         { name: 'GDB', icon: ActivityIcon, color: 'text-red-400' },
                         { name: 'TCPDUMP', icon: Globe, color: 'text-blue-400' }
                       ].map(t => (
                         <div key={t.name} className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center gap-2 group hover:border-white/10 transition-all cursor-pointer">
                            <t.icon size={18} className={cn(t.color, "group-hover:scale-110 transition-transform")} />
                            <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">{t.name}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <button 
                   onClick={runExecutive}
                   disabled={isExecuting || !prompt || !activeModelId}
                   className="w-full py-5 bg-[var(--p)] text-white font-black uppercase tracking-[0.4em] italic rounded-[24px] lg:rounded-[32px] shadow-2xl shadow-[var(--p)]/40 hover:scale-[1.01] active:scale-95 transition-all text-[10px] flex items-center justify-center gap-3 disabled:opacity-20 relative overflow-hidden group"
                 >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isExecuting ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                    {isExecuting ? 'Engine Engaged' : 'Engage Executive'}
                 </button>
              </div>

              <div className="glass p-6 rounded-[32px] border-white/5 grid grid-cols-2 gap-4 relative overflow-hidden shrink-0">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Shield size={48} /></div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <Shield size={12} />
                       </div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Egress</span>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                       <div className="text-[8px] font-bold text-emerald-500 uppercase italic">AIR_GAP</div>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <Binary size={12} />
                       </div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Auth</span>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                       <div className="text-[8px] font-bold text-white uppercase italic">AES-256</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const CheckCircle = ({ className, size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
