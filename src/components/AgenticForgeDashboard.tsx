import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Monitor, Layout, FolderTree, Settings, 
  Bot, Brain, Rocket, Activity, CheckCircle2, 
  AlertCircle, ChevronRight, FileCode, Folder,
  Play, Pause, RefreshCw, Smartphone, Tablet, Laptop, Target,
  X, Trash, Zap, ArrowLeft, Globe, Wifi, WifiOff, FileJson, FileText, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState } from '../types';
import { cn } from '../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function AgenticForgeDashboard({ state, updateState, notify }: Props) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<{id: string, msg: string, ts: number}[]>([]);
  const [viewportImage, setViewportImage] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<'IDLE' | 'EXECUTING' | 'WAITING' | 'ERROR'>('IDLE');
  const [activeTab, setActiveTab] = useState<'forge' | 'agents' | 'tasks' | 'settings'>('forge');
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, load: 0 });
  const [files, setFiles] = useState<{name: string, type: string, ext: string, path: string}[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [activeTasks, setActiveTasks] = useState([
    { id: 'workspace', label: 'Initializing Workspace', status: 'pending' },
    { id: 'logic', label: 'Modifying Core Logic', status: 'pending' },
    { id: 'ui', label: 'Verifying UI Component Assembly', status: 'pending' },
    { id: 'build', label: 'Finalizing Deployment Binaries', status: 'pending' }
  ]);
  const [command, setCommand] = useState('npm run build');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const closeDashboard = () => {
    updateState(s => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        coBuilder: {
          ...s.appBuilder.coBuilder,
          agenticDashboardOpen: false
        }
      }
    }));
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const socket = new WebSocket(`${protocol}//${host}`);

    socket.onopen = () => {
      setIsConnected(true);
      notify('Link established: Sovereign Agentic Bridge online.');
      socket.send(JSON.stringify({ type: 'LIST_FILES' }));
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        switch (type) {
          case 'FILE_LIST':
            setFiles(data);
            if (payload.currentPath) setCurrentPath(payload.currentPath);
            break;
          case 'METRICS_UPDATE':
            setMetrics(data);
            break;
          case 'TERMINAL_STREAM':
            setTerminalLogs(prev => {
              const newLog = { id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, msg: data, ts: Date.now() };
              const next = [...prev, newLog];
              return next.length > 500 ? next.slice(next.length - 500) : next;
            });
            if (data.includes('finished with exit code')) {
              setAgentStatus('IDLE');
            } else {
              setAgentStatus('EXECUTING');
            }
            break;
          case 'BROWSER_CAPTURE':
            setViewportImage(data);
            setAgentStatus('IDLE');
            break;
          case 'TASK_PROGRESS':
            setActiveTasks(prev => prev.map(t => 
              t.id === data.step ? { ...t, status: data.success ? 'complete' : 'error' } : t
            ));
            setAgentStatus(data.success ? 'IDLE' : 'ERROR');
            if (data.success) notify(`${data.step} completed successfully.`);
            else notify(`Error in ${data.step} phase.`);
            break;
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setAgentStatus('ERROR');
    };

    setWs(socket);
    return () => socket.close();
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [terminalLogs]);

  const executeCommand = (cmdOverride?: string) => {
    const finalCmd = cmdOverride || command;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const manualLog = { id: `manual-${Date.now()}`, msg: `\n$ ${finalCmd}\n`, ts: Date.now() };
      setTerminalLogs(prev => [...prev, manualLog]);
      ws.send(JSON.stringify({ type: 'EXECUTE_COMMAND', data: finalCmd }));
      setAgentStatus('EXECUTING');
      setActiveTasks(prev => prev.map(t => ({ ...t, status: 'pending' })));
    } else {
      notify('Bridge connection failure. Verify neural uplink.');
    }
  };

  const clearTerminal = () => {
    setTerminalLogs([]);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'CLEAR_TERMINAL' }));
    }
  };

  const captureViewport = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      notify('Initiating viewport capture...');
      ws.send(JSON.stringify({ type: 'CAPTURE_VIEWPORT', data: window.location.origin }));
    }
  };

  const navigateTo = (path: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'LIST_FILES', data: path }));
    }
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const parentPath = '/' + parts.join('/');
    navigateTo(parentPath);
  };

  return (
    <div className="flex w-full h-full bg-[var(--surface-low)] text-[var(--txt-high)] font-sans selection:bg-[var(--p)]/30 overflow-hidden relative backdrop-blur-3xl">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--p)]/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--a)]/10 blur-[120px] rounded-full" />
      </div>

      {/* LEFT COLUMN: NAVIGATION (15%) */}
      <nav className="w-[15%] h-full border-r border-[var(--border)] flex flex-col p-6 z-10 bg-[var(--surface-high)]/40 backdrop-blur-md">
         <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[var(--p)] flex items-center justify-center text-white shadow-[0_0_15px_var(--pg)]">
               <Bot size={20} />
            </div>
            <div>
               <h2 className="text-sm font-black uppercase tracking-widest italic">LUCY_FORGE</h2>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isConnected ? "bg-emerald-500" : "bg-red-500")} />
                  <span className={cn("text-[8px] font-bold uppercase", isConnected ? "text-emerald-500" : "text-red-500")}>
                    {isConnected ? "Bridge Active" : "Bridge Offline"}
                  </span>
               </div>
            </div>
         </div>

         <div className="space-y-4 mb-12">
            <button 
              onClick={closeDashboard}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            >
               <ArrowLeft size={16} className="text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">Exit to Workspace</span>
            </button>
         </div>

         <div className="space-y-2">
            {[
               { id: 'forge', label: 'Dashboard', icon: Layout },
               { id: 'agents', label: 'Agent Manager', icon: Bot },
               { id: 'tasks', label: 'Agent Tasks', icon: Rocket },
               { id: 'settings', label: 'Bridge Config', icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  activeTab === item.id 
                    ? "bg-white/10 text-white border border-white/10 shadow-lg" 
                    : "text-white/30 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={16} className={cn(activeTab === item.id ? "text-blue-400" : "group-hover:text-blue-400/50")} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
              </button>
            ))}
         </div>

         <div className="mt-auto p-4 bg-white/5 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "w-2 h-2 rounded-full",
                agentStatus === 'EXECUTING' ? "bg-blue-400" : 
                agentStatus === 'ERROR' ? "bg-red-400" : "bg-emerald-400"
              )} />
              <span className="text-[10px] font-black uppercase tracking-widest">{agentStatus}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Signal Latency</span>
               <span className="text-[9px] font-black text-emerald-500 uppercase italic">1.2ms</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-[95%]" />
            </div>
         </div>
      </nav>

      {/* CENTER COLUMN: MAIN VIEWPORT (55%) */}
      <main className="w-[55%] h-full flex flex-col border-r border-[var(--border)] relative z-10 bg-[var(--surface)]/20 backdrop-blur-sm">
         <AnimatePresence mode="wait">
            {activeTab === 'forge' && (
               <motion.div 
                 key="forge"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="flex-1 flex flex-col overflow-hidden"
               >
                  {/* TOP ZONE: FILE EXPLORER (70%) */}
                  <div className="h-[70%] flex flex-col">
                     <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 shrink-0">
                        <div className="flex items-center gap-3">
                           <FolderTree size={14} className="text-white/40" />
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{currentPath}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={goUp}
                             disabled={currentPath === '/'}
                             className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors disabled:opacity-20"
                           >
                              Back
                           </button>
                           <button 
                             onClick={() => ws?.send(JSON.stringify({ type: 'LIST_FILES' }))}
                             className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                           >
                              Root
                           </button>
                        </div>
                     </header>

                     <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                           {files.length === 0 ? (
                             <div className="text-[10px] font-black text-white/5 uppercase tracking-[0.2em] italic p-4 text-center">
                               Mapping Workspace Topology...
                             </div>
                           ) : (
                             files.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1)).map(item => (
                               <div 
                                 key={item.path} 
                                 onClick={() => item.type === 'folder' && navigateTo(item.path)}
                                 className={cn(
                                   "flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer group",
                                   "text-white/20 hover:text-white/40 hover:bg-white/5"
                                 )}
                               >
                                  {item.type === 'folder' ? <Folder size={14} className="text-blue-400/40" /> : 
                                   item.ext === 'json' ? <FileJson size={14} className="text-amber-400/40" /> :
                                   item.ext === 'tsx' || item.ext === 'ts' ? <FileCode size={14} className="text-blue-400/40" /> :
                                   <FileText size={14} className="text-emerald-400/40" />}
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                               </div>
                             ))
                           )}
                        </div>
                     </div>
                  </div>

                  {/* BOTTOM ZONE: TERMINAL (30%) */}
                  <div className="h-[30%] flex flex-col border-t border-white/5 bg-[#08080a]">
                     <header className="h-10 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 shrink-0">
                        <div className="flex items-center gap-2">
                           <Terminal size={12} className="text-emerald-400" />
                           <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Neural_SDR_Terminal // Live Stream</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => executeCommand('npm run build')}
                             className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] font-bold text-blue-400 hover:bg-blue-500/20 uppercase"
                           >
                             Build
                           </button>
                           <button 
                             onClick={() => executeCommand('npm run lint')}
                             className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-bold text-emerald-400 hover:bg-emerald-500/20 uppercase"
                           >
                             Lint
                           </button>
                           <div className="w-px h-3 bg-white/10 mx-1" />
                           <button 
                             onClick={clearTerminal}
                             className="p-1 hover:bg-white/10 rounded flex items-center gap-1 text-[8px] font-bold text-white/40 uppercase"
                           >
                             <Trash size={10} /> Clear
                           </button>
                        </div>
                     </header>
                     <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar bg-black/60 scroll-smooth">
                        {terminalLogs.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2">
                            <Cpu size={24} />
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] italic">Bridge connected. Ready for execution.</div>
                          </div>
                        ) : (
                          terminalLogs.map((log) => (
                            <div key={log.id} className="mb-0.5 whitespace-pre-wrap break-words leading-relaxed text-blue-100/60">
                               {log.msg}
                            </div>
                          ))
                        )}
                        <div ref={terminalEndRef} />
                     </div>
                     <div className="h-12 border-t border-white/5 px-6 flex items-center gap-4 bg-black/20">
                        <span className="text-blue-500 font-bold">$</span>
                        <input 
                          type="text" 
                          value={command}
                          onChange={(e) => setCommand(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
                          className="flex-1 bg-transparent text-[11px] font-mono outline-none text-white/60 placeholder:text-white/5"
                          placeholder="Enter Terminal Build Payload..."
                        />
                        <button 
                          onClick={executeCommand}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                        >
                           <Play size={14} />
                        </button>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'agents' && (
               <motion.div 
                 key="agents"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar"
               >
                  <div className="mb-12">
                     <h2 className="text-3xl font-syne font-black uppercase italic italic tracking-tighter">Agent Manager</h2>
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 italic">Neural Health & Process Supervision</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     {[
                        { id: 'lucy', name: 'LUCY_CORE', description: 'Primary Reasoning & Logic Engine', icon: Brain, color: 'blue' },
                        { id: 'forge', name: 'FORGE_ASSIST', description: 'App Construction & Assembly Subsystem', icon: Layout, color: 'emerald' }
                     ].map(agent => (
                        <div 
                          key={agent.id}
                          className="p-8 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden group"
                        >
                           <div className={cn(
                             "absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 transition-opacity group-hover:opacity-20",
                             agent.color === 'blue' ? "bg-blue-500" : "bg-emerald-500"
                           )} />

                           <div className="flex items-start justify-between mb-8">
                              <div className="flex items-center gap-5">
                                 <div className={cn(
                                   "w-14 h-14 rounded-2xl flex items-center justify-center border",
                                   agent.color === 'blue' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                 )}>
                                    <agent.icon size={28} />
                                 </div>
                                 <div>
                                    <h3 className="text-xl font-bold uppercase tracking-tighter">{agent.name}</h3>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1 italic">{agent.description}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-8">
                              <div className="space-y-3">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">CPU Utilisation</span>
                                    <span className="text-[10px] font-black text-white/60 tracking-wider">
                                       {(metrics.cpu * (agent.id === 'lucy' ? 1 : 0.8)).toFixed(1)}%
                                    </span>
                                 </div>
                                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      layout
                                      className="h-full bg-blue-500" 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${metrics.cpu * (agent.id === 'lucy' ? 1 : 0.8)}%` }}
                                      transition={{ type: 'tween', ease: 'easeInOut', duration: 1 }}
                                    />
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Memory Density</span>
                                    <span className="text-[10px] font-black text-white/60 tracking-wider">
                                       {Math.round(metrics.memory * (agent.id === 'lucy' ? 1 : 0.6))} MB
                                    </span>
                                 </div>
                                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      layout
                                      className="h-full bg-emerald-500" 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(metrics.memory / 500) * 100}%` }}
                                      transition={{ type: 'tween', ease: 'easeInOut', duration: 1 }}
                                    />
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Task Load</span>
                                    <span className="text-[10px] font-black text-white/60 tracking-wider">
                                       {Math.max(1, Math.round(metrics.load * (agent.id === 'lucy' ? 1 : 0.4)))}/10
                                    </span>
                                 </div>
                                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      layout
                                      className="h-full bg-amber-500" 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.max(1, Math.round(metrics.load * (agent.id === 'lucy' ? 1 : 0.4))) * 10}%` }}
                                      transition={{ type: 'tween', ease: 'easeInOut', duration: 1 }}
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                              <div className="flex gap-4">
                                 <div className="flex items-center gap-2">
                                    <Activity size={12} className="text-white/20" />
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Uptime: 4h 12m</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Rocket size={12} className="text-white/20" />
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Tasks Completed: 1,204</span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Reboot Agent</button>
                                 <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all">Optimise Kernal</button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}

            {activeTab === 'tasks' && (
               <motion.div 
                 key="tasks"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar"
               >
                  <div className="mb-12">
                     <h2 className="text-3xl font-syne font-black uppercase italic tracking-tighter">Task Engine</h2>
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 italic">Asynchronous Process Lifecycle</p>
                  </div>

                  <div className="space-y-4">
                     {activeTasks.map((task, idx) => (
                        <div key={task.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-white/20">
                                {String(idx + 1).padStart(2, '0')}
                              </div>
                              <div>
                                 <h4 className="text-xs font-black uppercase tracking-widest">{task.label}</h4>
                                 <p className="text-[9px] font-bold text-white/20 uppercase mt-1">PID: {Math.floor(Math.random() * 9000) + 1000}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              {task.status === 'completed' ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                   <CheckCircle2 size={10} className="text-emerald-400" />
                                   <span className="text-[8px] font-black text-emerald-400 uppercase">Success</span>
                                </div>
                              ) : task.status === 'error' ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                                   <AlertCircle size={10} className="text-red-400" />
                                   <span className="text-[8px] font-black text-red-400 uppercase">System Error</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                   <RefreshCw size={10} className="text-blue-400 animate-spin" />
                                   <span className="text-[8px] font-black text-blue-400 uppercase">Processing</span>
                                </div>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}

            {activeTab === 'settings' && (
               <motion.div 
                 key="settings"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar"
               >
                  <div className="mb-12">
                     <h2 className="text-3xl font-syne font-black uppercase italic tracking-tighter">Bridge Config</h2>
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 italic">Neural Ingress & Socket Topology</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                        <div className="flex items-center gap-3">
                           <Globe size={20} className="text-blue-400" />
                           <h3 className="text-sm font-black uppercase tracking-widest">Network Protocol</h3>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-white/40 uppercase font-black">Link Protocol</span>
                              <span className="text-white/80 font-mono tracking-wider">WebSocket/Secure (WSS)</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-white/40 uppercase font-black">Handoff Mode</span>
                              <span className="text-white/80 font-mono tracking-wider">Non-Blocking Async</span>
                           </div>
                        </div>
                     </div>
                     <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                        <div className="flex items-center gap-3">
                           <Zap size={20} className="text-amber-400" />
                           <h3 className="text-sm font-black uppercase tracking-widest">Latency Optimization</h3>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-white/40 uppercase font-black">Compression</span>
                              <span className="text-emerald-400 uppercase font-black">Enabled (zlib)</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-white/40 uppercase font-black">Haggle Timeout</span>
                              <span className="text-white/80 font-mono tracking-wider">250ms</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-8 p-10 bg-blue-500/5 border border-blue-500/10 rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-blue-500/10 transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                           <Wifi size={32} />
                        </div>
                        <div>
                           <h4 className="text-lg font-black uppercase tracking-tighter">Hard-Refresh Bridge</h4>
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1 italic">Force re-initiation of all neural sockets</p>
                        </div>
                     </div>
                     <ChevronRight size={24} className="text-blue-500/40 group-hover:text-blue-400 transition-colors" />
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </main>

      {/* RIGHT COLUMN: MISSION CONTROL (30%) */}
      <aside className="w-[30%] h-full flex flex-col p-8 z-10 space-y-10 relative bg-[var(--surface-high)]/20 backdrop-blur-xl">
         <button 
           onClick={closeDashboard}
           className="absolute top-4 right-4 z-50 p-2 text-white/40 hover:text-[var(--p)] hover:bg-[var(--p)]/10 rounded-full transition-all"
         >
           <X size={20} />
         </button>

         {/* Mission Control Panel */}
         <div className="flex-1 bg-[var(--surface-high)]/40 border border-[var(--border)] rounded-[40px] p-10 flex flex-col relative overflow-hidden backdrop-blur-2xl group">
            {/* Neon highlight border effect */}
            <div className="absolute inset-0 border border-[var(--p)]/20 rounded-[40px] pointer-events-none group-hover:border-[var(--p)]/40 transition-all duration-700 shadow-[inset_0_0_20px_var(--pg)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--p)]/50 to-transparent shadow-[0_0_20px_var(--pg)]" />

            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                     <Target size={20} />
                  </div>
                  <div>
                     <h3 className="text-xl font-syne font-black uppercase italic italic tracking-tighter">Mission Control</h3>
                     <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1 italic">Agent Protocol: Active</p>
                  </div>
               </div>
               <button 
                 onClick={() => setActiveTasks(prev => prev.map(t => ({ ...t, status: 'pending' })))}
                 className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
               >
                  <RefreshCw size={16} />
               </button>
            </div>

            {/* Task Checklist */}
            <div className="flex-1 space-y-6">
               <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic mb-6 leading-none">Active Phase Checkpoints</h4>
               {activeTasks.map(task => (
                 <div key={task.id} className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                          task.status === 'complete' ? "bg-emerald-500/20 text-emerald-500" :
                          task.status === 'error' ? "bg-red-500/20 text-red-500" :
                          "bg-white/5 text-white/20 group-hover/item:text-white/40"
                       )}>
                          {task.status === 'complete' ? <CheckCircle2 size={12} /> : 
                           task.status === 'error' ? <AlertCircle size={12} /> :
                           <div className="w-1 h-1 rounded-full bg-current" />}
                       </div>
                       <span className={cn(
                          "text-[11px] font-black uppercase tracking-widest transition-all",
                          task.status === 'complete' ? "text-emerald-500/80" : 
                          task.status === 'error' ? "text-red-500/80" :
                          "text-white/40"
                       )}>
                          {task.label}
                       </span>
                    </div>
                    {task.status === 'pending' && <Activity size={12} className="text-blue-500/20 animate-pulse" />}
                 </div>
               ))}
            </div>

            {/* Quick Actions / Missions */}
            <div className="space-y-4 pt-10 border-t border-white/5">
               <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic mb-4 leading-none">Automated Missions</h4>
               <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'verify', label: 'Full System Verification', icon: CheckCircle2, onClick: () => executeCommand('npm run build && npm run lint'), color: 'blue' },
                    { id: 'visual', label: 'Visual Ingress Capture', icon: Monitor, onClick: captureViewport, color: 'blue' },
                    { id: 'fix', label: 'Self-Correct Linter', icon: Zap, onClick: () => executeCommand('npm run lint -- --fix'), color: 'emerald' },
                    { id: 'clean', label: 'Purge Build Artifacts', icon: Trash, onClick: () => executeCommand('rm -rf dist'), color: 'red' }
                  ].map(mission => (
                    <button
                      key={mission.id}
                      onClick={mission.onClick}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                        mission.color === 'blue' ? "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10" :
                        mission.color === 'emerald' ? "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10" :
                        "bg-red-500/5 border-red-500/10 hover:bg-red-500/10"
                      )}
                    >
                       <mission.icon size={14} className={cn(
                         mission.color === 'blue' ? "text-blue-400" :
                         mission.color === 'emerald' ? "text-emerald-400" :
                         "text-red-400"
                       )} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{mission.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Live Verification Viewport */}
            <div className="mt-auto space-y-4 pt-10 border-t border-white/5">
               <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-white uppercase italic tracking-tighter">Live Verification Viewport</h4>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                     <span className="text-[9px] font-black text-red-500 uppercase tracking-widest italic">Live Capture Feed</span>
                  </div>
               </div>

               <div className="relative aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl group/viewport">
                  {viewportImage ? (
                    <img 
                      src={viewportImage} 
                      alt="Capture Feed" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                       <Monitor size={32} strokeWidth={1} className="text-white/10 group-hover/viewport:text-white/20 transition-all" />
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] leading-relaxed italic">
                          Awaiting Neural Browser Inversion Payload
                       </p>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 flex gap-1">
                     <Laptop size={12} className="text-blue-500 shadow-lg" />
                     <Tablet size={12} className="text-white/20" />
                     <Smartphone size={12} className="text-white/20" />
                  </div>
               </div>

               <button 
                 onClick={captureViewport}
                 className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3"
               >
                  Generate Verification Loop
               </button>
            </div>
         </div>
      </aside>
    </div>
  );
}
