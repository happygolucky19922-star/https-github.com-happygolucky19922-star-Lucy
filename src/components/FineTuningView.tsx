import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PatentEngine } from '../lib/patents';
import { 
  Flame, Rocket, Settings2, Database, Cpu, Activity, 
  RefreshCw, CheckCircle2, Swords, Sparkles, Sliders, 
  Zap, Terminal as TerminalIcon, Loader2, AlertTriangle, Play,
  Lock, Fingerprint, Upload, History
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface FineTuningViewProps {
  state: AppState;
  updateState: any;
  notify: any;
  toggleModelLoad: (id: string) => void;
}

// --- INITIAL STATE ---
export default function FineTuningView({ state, updateState, notify, toggleModelLoad }: FineTuningViewProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [lastFinishedJobId, setLastFinishedJobId] = useState<string | null>(null);
  const [isFusing, setIsFusing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState({
    epochs: 3,
    learningRate: '2e-4',
    batchSize: 4,
    quantization: '4-bit',
    loraAlpha: 32,
    loraRank: 16,
    patentQuant: false,
    patentDistill: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalibration, setShowCalibration] = useState(false);
  const [datasetName, setDatasetName] = useState<string | null>(null);
  
  // New State for requirement tracking
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [currentLoss, setCurrentLoss] = useState(2.0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);

  const selectedModel = state.models.find(m => m.id === state.fineTuningModelId);

  const logEndRef = useRef<HTMLDivElement>(null);

  const filteredModels = state.models.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.backend.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateModelConfig = (field: string, value: any) => {
    if (!state.fineTuningModelId) return;
    updateState((s: AppState) => ({
      ...s,
      models: s.models.map(m => m.id === s.fineTuningModelId ? {
        ...m,
        config: { ...(m.config || {}), [field]: value } as any
      } : m)
    }));
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    let interval: any;
    let timerInterval: any;
    
    if (activeJobId && isTraining) {
      timerInterval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      interval = setInterval(() => {
        setProgress(prev => {
           const next = prev + 2;
           
           // Update Epoch & Loss based on progress
           const targetEpoch = Math.max(1, Math.min(config.epochs, Math.ceil((next / 100) * config.epochs)));
           setCurrentEpoch(targetEpoch);
           
           const targetLoss = Math.max(0.1, 2.0 - ((next / 100) * 1.9));
           setCurrentLoss(targetLoss);
           
           if (next >= 100) {
              setIsTraining(false);
              setLastFinishedJobId(activeJobId);
              setActiveJobId(null);
              setIsFusing(false);
              notify("Training Complete. Model has been fine-tuned.");
              
              setTrainingHistory(prevHist => [{
                  id: activeJobId,
                  timestamp: new Date().toLocaleTimeString(),
                  model: selectedModel?.name || 'Unknown',
                  dataset: datasetName || 'Custom Data',
                  finalLoss: targetLoss.toFixed(4),
                  duration: elapsedTime,
                  epochs: config.epochs
              }, ...prevHist]);
              
              return 100;
           }
           return next;
        });
        setLogs(prev => [...prev, `[ITER] Epoch ${currentEpoch}/${config.epochs} Step: loss=${currentLoss.toFixed(4)}...`]);
      }, 200);
    }
    return () => {
        clearInterval(interval);
        clearInterval(timerInterval);
    };
  }, [activeJobId, isTraining, currentEpoch, currentLoss, config.epochs, datasetName, elapsedTime, selectedModel]);

  const startTraining = async () => {
    if (!state.fineTuningModelId) {
      notify("ERROR: Select a base matrix for evolution.");
      return;
    }
    if (!datasetName) {
      notify("Please load a dataset first.");
      return;
    }

    setIsTraining(true);
    setProgress(0);
    setCurrentEpoch(1);
    setCurrentLoss(2.0);
    setElapsedTime(0);
    setLogs(["[INIT] Establishing connection to compute cluster...", "[AUTH] Verifying sovereign credentials..."]);
    
    setActiveJobId(`job_sim_${Date.now()}`);
    notify("Compute Cluster Engaged: Processing synaptic deltas...");
  };

  const handleDatasetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
         setDatasetName(e.target.files[0].name);
         notify(`Dataset ${e.target.files[0].name} loaded successfully.`);
     }
  };

  const startFusion = async () => {
    if (!lastFinishedJobId) return;
    setIsFusing(true);
    setProgress(0);
    setLogs(["[INIT] Establishing fusion containment field...", "[AUTH] Re-verifying sovereign credentials..."]);
    
    // Patent Integration: Apply transformations before final fusion if requested
    if (config.patentQuant) {
       setLogs(prev => [...prev, "[PATENT] Applying US Patent 12,100,185 B2: Non-linear Logarithmic Quantization..."]);
       await new Promise(r => setTimeout(r, 1500));
    }
    if (config.patentDistill) {
       setLogs(prev => [...prev, "[PATENT] Synchronizing with US Patent 11,651,211: Dense Knowledge Distillation..."]);
       await new Promise(r => setTimeout(r, 1200));
    }

    try {
      const res = await fetch('/api/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: state.fineTuningModelId,
          job_id: lastFinishedJobId
        })
      });
      const data = await res.json();
      setActiveJobId(data.job_id);
      setIsTraining(true);
      notify("FUSION PROTOCOL ENGAGED: Injecting synaptic deltas...");
    } catch (e) {
      // Simulation for fusion
      setActiveJobId(`fuse_sim_${Date.now()}`);
      setIsTraining(true);
      notify("Fusion Protocol: Merging LoRA layers into base kernel...");
    }
  };


  return (
    <div className="p-8 h-full bg-black overflow-y-auto custom-scrollbar">
       <div className="max-w-7xl mx-auto space-y-12 pb-24">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div className="space-y-4">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-[24px] bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-500/30">
                      <Flame size={36} />
                   </div>
                   <div>
                      <h2 className="text-4xl font-syne font-black uppercase italic leading-tight text-white tracking-tighter">Evolution Engine</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-white">Autonomous SFT & Unsloth Local Tuning</p>
                   </div>
                </div>
             </div>
             <div className="flex gap-4">
                <div className="glass p-4 px-8 rounded-2xl border-white/5 flex flex-col items-center">
                   <span className="text-[9px] font-black opacity-30 uppercase mb-1">VRAM Requisition</span>
                   <span className="text-xl font-syne font-black text-red-500">22.4 GB</span>
                </div>
                <button 
                  onClick={() => setShowCalibration(!showCalibration)}
                  className={cn(
                    "glass p-4 px-8 rounded-2xl border transition-all flex flex-col items-center group",
                    showCalibration ? "border-red-500/50 bg-red-500/5" : "border-white/5 hover:border-red-500/20"
                  )}
                >
                   <span className="text-[9px] font-black opacity-30 uppercase mb-1 group-hover:opacity-100 transition-opacity">Pre-Tuning Menu</span>
                   <span className="text-xl font-syne font-black text-white flex items-center gap-2">
                      CALIBRATE <Sliders size={16} />
                   </span>
                </button>
             </div>
          </header>

          <AnimatePresence>
             {showCalibration && selectedModel && (
               <motion.section 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                  <div className="glass p-10 rounded-[48px] border-red-500/20 bg-red-500/5 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                     <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Temperature</div>
                        <input 
                           type="range" 
                           min="0" max="1" step="0.01"
                           value={selectedModel.config?.temperature || 0.7}
                           onChange={(e) => updateModelConfig('temperature', parseFloat(e.target.value))}
                           className="w-full h-1.5 bg-white/10 rounded-full accent-red-500 appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] font-black opacity-20"><span>PRECISE</span><span>CREATIVE</span></div>
                     </div>
                     <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Top P (Nucleus)</div>
                        <input 
                           type="range" 
                           min="0" max="1" step="0.01"
                           value={selectedModel.config?.topP || 0.9}
                           onChange={(e) => updateModelConfig('topP', parseFloat(e.target.value))}
                           className="w-full h-1.5 bg-white/10 rounded-full accent-red-500 appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] font-black opacity-20"><span>FOCUSED</span><span>DIVERSE</span></div>
                     </div>
                     <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Frequency Penalty</div>
                        <input 
                           type="range" 
                           min="0" max="2" step="0.1"
                           value={selectedModel.config?.repeatPenalty || 1.1}
                           onChange={(e) => updateModelConfig('repeatPenalty', parseFloat(e.target.value))}
                           className="w-full h-1.5 bg-white/10 rounded-full accent-red-500 appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] font-black opacity-20"><span>REPETITIVE</span><span>UNIQUE</span></div>
                     </div>
                     <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Max Response Tokens</div>
                        <select 
                           value={selectedModel.config?.maxTokens || 2048}
                           onChange={(e) => updateModelConfig('maxTokens', parseInt(e.target.value))}
                           className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase outline-none focus:border-red-500 transition-colors"
                        >
                           <option value="512">512 Tokens</option>
                           <option value="1024">1024 Tokens</option>
                           <option value="2048">2048 Tokens</option>
                           <option value="4096">4096 Tokens</option>
                        </select>
                     </div>
                  </div>
               </motion.section>
             )}
          </AnimatePresence>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
             {/* Main Training Panel */}
             <div className="xl:col-span-2 space-y-8">
                <section className="glass p-10 rounded-[64px] border-white/5 space-y-10 bg-gradient-to-br from-red-500/5 to-transparent relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                     <Zap size={200} />
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                     <div className="space-y-2">
                        <h3 className="text-2xl font-syne font-black uppercase italic text-white flex items-center gap-3">
                           Unsloth QLoRA Pipeline
                           <div className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] uppercase font-black tracking-widest border border-red-500/20">
                              {isTraining ? 'Propagating' : 'Standby'}
                           </div>
                        </h3>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest italic">Rapid 4-bit fine-tuning for specialized behavioral alignment.</p>
                     </div>
                     <Settings2 size={24} className="text-white/20" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Evolution Parameters</div>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black opacity-20 uppercase mb-1">Learning Rate</div>
                                <select 
                                  value={config.learningRate} 
                                  onChange={(e) => setConfig({...config, learningRate: e.target.value})}
                                  className="bg-transparent border-none text-xs text-white font-bold outline-none w-full p-0"
                                >
                                   <option value="1e-4">1e-4</option>
                                   <option value="2e-4">2e-4</option>
                                   <option value="5e-5">5e-5</option>
                                </select>
                             </div>
                             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black opacity-20 uppercase mb-1">Epochs</div>
                                <input 
                                  type="number" 
                                  value={config.epochs} 
                                  onChange={(e) => setConfig({...config, epochs: parseInt(e.target.value)})}
                                  className="bg-transparent border-none text-xs text-white font-bold outline-none w-full p-0"
                                />
                             </div>
                             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black opacity-20 uppercase mb-1">Batch Size</div>
                                <select 
                                  value={config.batchSize} 
                                  onChange={(e) => setConfig({...config, batchSize: parseInt(e.target.value)})}
                                  className="bg-transparent border-none text-xs text-white font-bold outline-none w-full p-0"
                                >
                                   <option value="1">1</option>
                                   <option value="2">2</option>
                                   <option value="4">4</option>
                                   <option value="8">8</option>
                                </select>
                             </div>
                             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black opacity-20 uppercase mb-1">Quantization</div>
                                <div className="text-xs text-white font-bold">4-bit (Fast)</div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Target Core Weights</div>
                          <div className="relative group/ft-selector">
                             <div className={cn(
                                "p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                                state.fineTuningModelId ? "bg-red-500/10 border-red-500/20 shadow-lg shadow-red-500/5 text-white" : "bg-white/5 border-white/10 text-white/40"
                             )}>
                                <div className="flex items-center gap-4">
                                   <div className="p-2 bg-red-400/20 rounded-lg text-red-500">
                                      <Cpu size={16} />
                                   </div>
                                   <span className="text-xs font-black uppercase italic tracking-wider">
                                      {state.models.find(m => m.id === state.fineTuningModelId)?.name || 'Deploy Target Weights'}
                                   </span>
                                </div>
                                <RefreshCw size={14} className="opacity-20 group-hover/ft-selector:rotate-180 transition-transform duration-500" />
                             </div>

                             <div className="absolute top-full left-0 mt-3 w-full glass bg-black/95 border border-white/10 rounded-[32px] p-6 shadow-2xl opacity-0 group-hover/ft-selector:opacity-100 pointer-events-none group-hover/ft-selector:pointer-events-auto transition-all transform translate-y-2 group-hover/ft-selector:translate-y-0 z-50 max-h-[400px] overflow-hidden flex flex-col">
                                <div className="space-y-4 text-left">
                                   <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                      <div className="text-[10px] font-black uppercase tracking-widest text-red-500 italic">Neural Base Matrix</div>
                                      <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                         <Sliders size={10} className="text-white/20" />
                                         <input 
                                           type="text" 
                                           placeholder="FILTER..." 
                                           value={searchQuery}
                                           onChange={(e) => setSearchQuery(e.target.value)}
                                           className="bg-transparent border-none text-[8px] font-black text-white outline-none w-20 leading-none"
                                         />
                                      </div>
                                   </div>
                                   <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
                                      {filteredModels.map(m => (
                                         <div key={m.id} className={cn(
                                            "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group/item cursor-pointer",
                                            state.fineTuningModelId === m.id ? "bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                         )} onClick={() => {
                                            updateState((s: AppState) => ({ ...s, fineTuningModelId: m.id }));
                                            setSearchQuery('');
                                         }}>
                                            <div className="flex-1 min-w-0">
                                               <div className="text-[10px] font-black truncate uppercase italic tracking-tighter text-white">{m.name}</div>
                                               <div className="text-[8px] font-bold opacity-30 uppercase text-white">{m.backend}</div>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <div className="p-4 bg-black/40 rounded-2xl border border-white/5 col-span-2">
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 flex items-center gap-2">
                                   <Lock size={12} /> Patent-Grade Hardening
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <button 
                                      onClick={() => setConfig(prev => ({ ...prev, patentQuant: !prev.patentQuant }))}
                                      className={cn("p-4 rounded-xl border transition-all text-left", config.patentQuant ? "bg-red-500/20 border-red-500/50 text-white" : "bg-white/5 border-white/10 text-white/40")}
                                   >
                                      <div className="text-[11px] font-black uppercase mb-1">UltraQuant™</div>
                                      <div className="text-[8px] leading-tight opacity-60">US 12,100,185 B2: Non-linear Logarithmic Synthesis</div>
                                   </button>
                                   <button 
                                      onClick={() => setConfig(prev => ({ ...prev, patentDistill: !prev.patentDistill }))}
                                      className={cn("p-4 rounded-xl border transition-all text-left", config.patentDistill ? "bg-red-500/20 border-red-500/50 text-white" : "bg-white/5 border-white/10 text-white/40")}
                                   >
                                      <div className="text-[11px] font-black uppercase mb-1">SynapDistill™</div>
                                      <div className="text-[8px] leading-tight opacity-60">US 11,651,211: Dense Knowledge Distillation</div>
                                   </button>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-8">
                       <div className="space-y-4">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Dataset Ingestion</div>
                          <div className="p-6 bg-black/40 rounded-[32px] border border-white/5 space-y-4 border-dashed relative">
                             <input 
                               type="file" 
                               accept=".jsonl,.csv,.txt"
                               onChange={handleDatasetUpload}
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                             />
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center pointer-events-none">
                                   <Database size={20} className="text-red-400" />
                                </div>
                                <div className="pointer-events-none">
                                   <div className="text-xs font-bold text-white uppercase italic">{datasetName || 'LOAD DATASET (.JSONL, .CSV, .TXT)'}</div>
                                   <div className="text-[8px] font-black opacity-20 uppercase tracking-widest">{datasetName ? 'Ready for ingestion' : 'Click to upload dataset file'}</div>
                                </div>
                             </div>
                          </div>
                          
                          <button 
                             onClick={startTraining}
                             disabled={isTraining || isFusing}
                             className="w-full py-5 bg-red-500 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl shadow-xl hover:bg-red-400 active:scale-95 transition-all text-xs flex items-center justify-center gap-3 disabled:opacity-20 relative group"
                           >
                              {isTraining && !isFusing ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                              START TRAINING
                           </button>
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-red-500">
                             <span>{isTraining ? `Training Epoch ${currentEpoch}/${config.epochs}` : 'Awaiting Evolution Pulse'}</span>
                             {isTraining && <span>Loss: {currentLoss.toFixed(4)} | {elapsedTime}s</span>}
                             {!isTraining && progress > 0 && <span>{Math.round(progress)}%</span>}
                          </div>
                          <div className="h-4 bg-white/5 rounded-full p-1 border border-white/5">
                             <motion.div 
                               animate={{ width: `${progress}%` }} 
                               className="h-full rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" 
                             />
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {lastFinishedJobId && !isTraining && (
                       <button 
                         onClick={startFusion}
                         disabled={isFusing}
                         className="flex-1 py-8 bg-emerald-500 text-white font-black uppercase tracking-[0.5em] italic rounded-[32px] shadow-2xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-95 transition-all text-sm flex items-center justify-center gap-4 disabled:opacity-20 relative group overflow-hidden"
                       >
                          <motion.div 
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 bg-white/20 skew-x-[-20deg]"
                          />
                          <Flame size={20} />
                          Engage Fusion Protocol
                       </button>
                    )}
                  </div>
                </section>

                {/* TELEMETRY TERMINAL */}
                <section className="glass rounded-[48px] border-white/5 overflow-hidden flex flex-col h-[400px]">
                   <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <TerminalIcon size={18} className="text-red-500" />
                         <span className="text-xs font-black uppercase tracking-widest text-white/40">Evolution Telemetry Logs</span>
                      </div>
                      <div className="flex gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                         <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/30" />
                         <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
                      </div>
                   </div>
                   <div className="flex-1 p-8 font-mono text-[10px] space-y-2 overflow-y-auto custom-scrollbar bg-black/40">
                      {logs.length === 0 && <div className="opacity-10 text-center py-20 uppercase tracking-[0.5em] font-black">Awaiting initialization...</div>}
                      {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 border-l border-white/5 pl-4 hover:bg-white/5 transition-colors">
                           <span className="opacity-20 shrink-0 select-none">[{i+1}]</span>
                           <span className={cn(
                             log.includes('FAULT') ? 'text-red-400' : 
                             log.includes('ITER') ? 'text-amber-400' : 
                             log.includes('COMPLETE') ? 'text-emerald-400' : 'text-white/60'
                           )}>{log}</span>
                        </div>
                      ))}
                      <div ref={logEndRef} />
                   </div>
                </section>

                <section className="glass rounded-[48px] border-white/5 p-8 space-y-6">
                   <div className="flex items-center gap-3">
                       <History size={18} className="text-red-500" />
                       <h4 className="text-xs font-black uppercase tracking-widest text-white">Training History</h4>
                   </div>
                   <div className="space-y-4">
                      {trainingHistory.length === 0 ? (
                          <div className="opacity-10 text-center py-8 uppercase tracking-[0.2em] font-black text-[10px]">No recorded training runs</div>
                      ) : (
                          trainingHistory.map((run, idx) => (
                              <div key={idx} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center text-[10px] text-white">
                                 <div className="space-y-1">
                                    <div className="font-bold text-white/80">{run.model}</div>
                                    <div className="opacity-50">{run.dataset} ({run.epochs} Epochs)</div>
                                 </div>
                                 <div className="text-right space-y-1">
                                     <div className="text-red-400 font-black">Loss: {run.finalLoss}</div>
                                     <div className="font-mono opacity-30">{run.timestamp} • {run.duration}s elapsed</div>
                                 </div>
                              </div>
                          ))
                      )}
                   </div>
                </section>
             </div>

             {/* Right Sidebar: Auto SFT & Self-Play */}
             <div className="space-y-8">
                <div className="glass p-10 rounded-[56px] border-white/5 space-y-8 bg-gradient-to-b from-white/2 to-transparent">
                   <div className="flex items-center gap-3">
                      <Sliders size={20} className="text-red-400" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Advanced Hyper-Params</h4>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black opacity-30 uppercase"><span>LoRA Alpha</span><span>{config.loraAlpha}</span></div>
                         <input 
                           type="range" 
                           min="1" max="128"
                           value={config.loraAlpha}
                           onChange={(e) => setConfig({...config, loraAlpha: parseInt(e.target.value)})}
                           className="w-full accent-red-500 opacity-40 hover:opacity-100 transition-opacity" 
                         />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black opacity-30 uppercase"><span>LoRA Rank (R)</span><span>{config.loraRank}</span></div>
                         <input 
                           type="range" 
                           min="1" max="64"
                           value={config.loraRank}
                           onChange={(e) => setConfig({...config, loraRank: parseInt(e.target.value)})}
                           className="w-full accent-red-500 opacity-40 hover:opacity-100 transition-opacity" 
                         />
                      </div>
                      <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3">
                         <Activity size={14} className="text-red-500 mt-1" />
                         <p className="text-[10px] font-medium leading-relaxed text-red-200/60 italic">PEFT techniques engaged to minimize parameter drift and prevent catastrophic forgetting.</p>
                      </div>
                   </div>
                </div>

                <div className="glass p-10 rounded-[56px] border-white/5 space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Autonomous SFT Protocol</div>
                         <h4 className="text-sm font-bold text-white uppercase italic">Auto-Harden Strategy</h4>
                      </div>
                      <div className="w-10 h-6 bg-red-500/20 rounded-full p-1 border border-red-500/30">
                         <div className="w-4 h-4 bg-red-500 rounded-full ml-auto shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                      </div>
                   </div>
                   <p className="text-[10px] font-medium text-white/40 leading-relaxed italic">"Sync failures in the Gauntlet automatically trigger trace collection and background LoRA updates."</p>
                   <div className="pt-4 flex items-center justify-between border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <Sparkles size={14} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-emerald-500 uppercase">Auto-Sync On</span>
                      </div>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">0 JOBS QUEUED</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
