import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Zap, 
  Shield, 
  Terminal, 
  Search, 
  Trash2, 
  Bot,
  Brain,
  Cpu,
  Fingerprint,
  Activity,
  CheckCircle2,
  X,
  Gauge,
  Clock,
  ChevronRight,
  Monitor,
  Play,
  Rocket
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState, Model } from '../types';
import { AngelicAgent, AGENT_SKILLS } from '../services/agentService';

interface Props {
  state: AppState;
  updateState: (fn: (s: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function AgentManagerView({ state, updateState, notify }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [agentInstance, setAgentInstance] = useState<AngelicAgent | null>(null);
  
  const [newAgent, setNewAgent] = useState({
    name: '',
    role: 'Developer' as any,
    modelId: state.models[0]?.id || '',
    isSuperAgent: true,
    bio: '',
  });
  
  const [executingAgent, setExecutingAgent] = useState<string | null>(null);
  const [taskPrompt, setTaskPrompt] = useState("");

  useEffect(() => {
    const ai = new AngelicAgent(state, updateState, notify);
    setAgentInstance(ai);
    ai.startPerceptionLoop();
    return () => ai.stopPerceptionLoop();
  }, []);

  const handleCreateAgent = () => {
    if (!newAgent.name) return;
    
    const agent = {
      id: `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newAgent.name,
      role: newAgent.role,
      modelId: newAgent.modelId,
      status: 'idle' as const,
      efficiency: newAgent.isSuperAgent ? 99 : 85,
      isSuperAgent: newAgent.isSuperAgent,
      capabilities: newAgent.isSuperAgent ? ['Orchestration', 'Cross-Domain Synthesis', 'Deep Reasoning'] : ['Task Execution'],
      bio: newAgent.bio
    };

    updateState(s => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        agents: [...s.appBuilder.agents, agent as any]
      }
    }));
    
    setIsCreating(false);
    setNewAgent({ name: '', role: 'Developer', modelId: state.models[0]?.id || '', isSuperAgent: true, bio: '' });
    notify(`${agent.name} initialized in the neural cluster.`);
  };

  const removeAgent = (id: string) => {
    updateState(s => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        agents: s.appBuilder.agents.filter((a: any) => a.id !== id)
      }
    }));
    notify("Agent de-rezed from memory.");
  };

  const toggleAgentStatus = (id: string, currentStatus: string) => {
    const newStatus = (currentStatus === 'idle' || currentStatus === 'working') ? 'active' : 'idle';
    updateState(s => ({
       ...s,
       appBuilder: {
          ...s.appBuilder,
          agents: s.appBuilder.agents.map((a: any) => a.id === id ? { ...a, status: newStatus } : a)
       }
    }));
  };

  const handleExecuteTask = async (id: string) => {
     if (!taskPrompt || !agentInstance) return;
     const agent = state.appBuilder.agents.find((a: any) => a.id === id);
     if (!agent) return;
     
     notify(`Engaging ${agent.name} for objective: ${taskPrompt}`);
     setExecutingAgent(null);
     
     if (state.appBuilder.coBuilder.executionLevel === 'Planning') {
        const tasks = await agentInstance.plan(taskPrompt);
        for (const t of tasks) {
           await agentInstance.executeTask(t);
        }
     } else {
        await agentInstance.executeTask({
          id: 'manual-task',
          name: taskPrompt,
          type: 'code',
          status: 'idle',
          payload: { description: taskPrompt }
        });
     }
     setTaskPrompt("");
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] p-6 lg:p-10 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
               <Fingerprint size={20} />
            </div>
            <div className="flex flex-col">
               <h2 className="text-lg font-bold text-white tracking-tight">Agent Lexicon</h2>
               <span className="text-[9px] font-medium text-white/20 uppercase tracking-[0.2em]">Neural Unit Orchestration</span>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
               {(['Fast', 'Planning'] as const).map(l => (
                  <button 
                     key={l}
                     onClick={() => updateState(s => ({ ...s, appBuilder: { ...s.appBuilder, coBuilder: { ...s.appBuilder.coBuilder, executionLevel: l } } }))}
                     className={cn(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        state.appBuilder.coBuilder.executionLevel === l ? "bg-cyan-500 text-black" : "text-white/20 hover:text-white/40"
                     )}
                  >
                     {l}
                  </button>
               ))}
            </div>
            <button 
               onClick={() => setIsCreating(true)}
               className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl flex items-center gap-2 group hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/10"
            >
               <Plus size={14} strokeWidth={3} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Synthesize Agent</span>
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {state.appBuilder.agents.map(agent => (
             <motion.div 
               layout
               key={agent.id}
               className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] relative group overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border",
                            agent.isSuperAgent ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-white/40"
                         )}>
                            <Bot size={20} />
                         </div>
                         <div>
                            <h4 className="text-lg font-bold text-white tracking-tight">{agent.name}</h4>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{agent.role}</span>
                         </div>
                      </div>
                      <div className={cn(
                         "w-2 h-2 rounded-full",
                         (agent.status === 'active' || agent.status === 'working') ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/20"
                      )} />
                   </div>

                   <p className="text-[12px] text-white/40 leading-relaxed h-12 overflow-hidden line-clamp-2">
                      {agent.bio || 'Autonomous logic unit initialized and awaiting mission parameters.'}
                   </p>

                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <button 
                         onClick={() => setExecutingAgent(executingAgent === agent.id ? null : agent.id)}
                         className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                         <Play size={12} fill="currentColor" /> Execute
                      </button>
                      <button 
                         onClick={() => removeAgent(agent.id)}
                         className="flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-400/60 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                         Deconstruct
                      </button>
                   </div>

                   <AnimatePresence>
                      {executingAgent === agent.id && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="space-y-4 pt-4 border-t border-white/5">
                               <textarea 
                                  placeholder="Define objective..." 
                                  value={taskPrompt} 
                                  onChange={(e) => setTaskPrompt(e.target.value)}
                                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/10 outline-none focus:border-cyan-500/40 min-h-[100px] resize-none"
                               />
                               <button 
                                  onClick={() => handleExecuteTask(agent.id)}
                                  className="w-full py-4 bg-cyan-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3"
                               >
                                  <Rocket size={16} /> Deploy Task
                               </button>
                            </div>
                         </motion.div>
                      )}
                   </AnimatePresence>

                   <div className="space-y-2 pt-4">
                      {state.appBuilder.outputStream.slice(0, 3).map((log, i) => (
                         <div key={i} className="flex items-center gap-2 text-[9px] font-mono text-white/20 truncate">
                            <ChevronRight size={10} /> {log.msg}
                         </div>
                      ))}
                   </div>
                </div>
             </motion.div>
          ))}
      </div>

      <div className="glass p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
               <Activity size={16} className="text-cyan-400" /> Live Logic Synthesis Streams
            </h3>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Neural Sync: Stable</span>
            </div>
         </div>

         <div className="space-y-2 font-mono text-[11px] leading-relaxed">
            {state.appBuilder.outputStream.map((log, i) => (
               <div key={`${log.ts}-${i}`} className={cn(
                  "flex items-start gap-4 p-3 rounded-xl transition-all",
                  log.type === 'error' ? "bg-red-500/5 text-red-400/80" :
                  log.type === 'success' ? "bg-emerald-500/5 text-emerald-400/80" : "bg-white/[0.01] text-white/40"
               )}>
                  <span className="opacity-20 shrink-0">{new Date(log.ts).toLocaleTimeString()}</span>
                  <span className="font-bold shrink-0">[{log.type.toUpperCase()}]</span>
                  <span className="break-all">{log.msg}</span>
               </div>
            ))}
         </div>
      </div>

      {createPortal(
        <AnimatePresence>
           {isCreating && (
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setIsCreating(false)}
                 className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                 <motion.div 
                   onClick={(e) => e.stopPropagation()}
                   initial={{ scale: 0.9, y: 20 }}
                   animate={{ scale: 1, y: 0 }}
                   className="w-full max-w-xl bg-[#08080a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden pointer-events-auto"
                 >
                    <header className="flex justify-between items-center mb-10">
                       <div className="space-y-1">
                          <h3 className="text-2xl font-bold text-white tracking-tight">Neural Synthesis</h3>
                          <p className="text-xs text-white/40 font-medium">Define parameters for the new autonomous unit.</p>
                       </div>
                       <button onClick={() => setIsCreating(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full text-white/20 transition-all z-10 relative">
                          <X size={20} />
                       </button>
                    </header>
  
                    <div className="space-y-8 relative z-10">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-white/20 tracking-[0.2em]">Unit_Designation</label>
                          <input 
                             type="text" 
                             value={newAgent.name}
                             onChange={(e) => setNewAgent(p => ({ ...p, name: e.target.value }))}
                             placeholder="e.g. ARCHON-V1"
                             className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/10 outline-none focus:border-cyan-500/40 transition-all font-mono"
                          />
                       </div>
  
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase text-white/20 tracking-[0.2em]">Neural_Role</label>
                             <select 
                                value={newAgent.role}
                                onChange={(e) => setNewAgent(p => ({ ...p, role: e.target.value as any }))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-cyan-500/40 uppercase tracking-widest appearance-none"
                             >
                                {['Architect', 'Developer', 'Analyst', 'Growth', 'Business', 'Research', 'QA', 'Security'].map(r => (
                                   <option key={r} value={r} className="bg-black">{r}</option>
                                ))}
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase text-white/20 tracking-[0.2em]">Base_Model</label>
                             <select 
                                value={newAgent.modelId}
                                onChange={(e) => setNewAgent(p => ({ ...p, modelId: e.target.value }))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-cyan-500/40 uppercase tracking-widest appearance-none"
                             >
                                {state.models.map(m => (
                                   <option key={m.id} value={m.id} className="bg-black">{m.name}</option>
                                ))}
                             </select>
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-white/20 tracking-[0.2em]">Unit_Grade</label>
                          <button 
                            onClick={() => setNewAgent(p => ({ ...p, isSuperAgent: !p.isSuperAgent }))}
                            className={cn(
                               "w-full h-[54px] rounded-2xl border transition-all flex items-center justify-center gap-3",
                               newAgent.isSuperAgent 
                                 ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                                 : "bg-white/5 border-white/10 text-white/20"
                            )}
                          >
                             <Shield size={16} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Sovereign unit</span>
                          </button>
                       </div>
  
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-white/20 tracking-[0.2em]">Deployment_Directive</label>
                          <textarea 
                             value={newAgent.bio}
                             onChange={(e) => setNewAgent(p => ({ ...p, bio: e.target.value }))}
                             placeholder="Primary focus and autonomous motivation..."
                             className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-white h-28 placeholder:text-white/10 outline-none focus:border-cyan-500/40 transition-all resize-none font-medium"
                          />
                       </div>
  
                       <button 
                          onClick={handleCreateAgent}
                          className="w-full py-5 bg-cyan-600 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-cyan-500 active:scale-[0.98] transition-all shadow-2xl shadow-cyan-600/20 mt-4"
                       >
                          Initiate Unit Synthesis
                       </button>
                    </div>
                 </motion.div>
              </motion.div>
           )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}


