import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Combine, FlaskConical, Save, Box as ModelIcon, Rocket, RefreshCw, XCircle, Github, Layers, DownloadCloud, Cpu, Database, Zap } from 'lucide-react';
import { AppState } from '../types';
import { cn } from '../lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// Sub-components
import { LabOverview } from './lab/LabOverview';
import { DatasetManager } from './lab/DatasetManager';
import { TrainingCore } from './lab/TrainingCore';
import { BenchmarkTester } from './lab/BenchmarkTester';
import { MergingMatrix } from './lab/MergingMatrix';
import { ExportRegistry } from './lab/ExportRegistry';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function ModelEvolutionLab({ state, updateState, notify }: Props) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'datasets' | 'training' | 'benchmark' | 'merging' | 'export' | 'retrain'>('overview');
  const [showImport, setShowImport] = React.useState(false);
  const [importSource, setImportSource] = React.useState<'hf' | 'local' | 'usb'>('hf');
  const [importUrl, setImportUrl] = React.useState('');

  const { modelLab } = state;

  const handleImport = async () => {
    if (!importUrl && importSource === 'hf') return notify("Provide a HuggingFace handle.");
    
    if (importSource === 'hf') {
      const hfRegex = /^[a-zA-Z0-9-._]+\/[a-zA-Z0-9-._]+$/;
      const singleNameRegex = /^[a-zA-Z0-9-._]+$/;
      if (!hfRegex.test(importUrl) && !singleNameRegex.test(importUrl)) {
        return notify("Invalid Hub Handle format. Expected 'user/repo'.");
      }
    }

    notify(`Connecting to ${importSource === 'hf' ? 'HuggingFace Hub' : 'Local File System'}...`);
    await new Promise(r => setTimeout(r, 2000));
    
    const newModelId = `hf-${Date.now()}`;
    const newModel = {
      id: newModelId,
      name: importUrl || (importSource === 'local' ? 'Local_Weights_v1' : 'USB_Transfer'),
      size: '7B',
      quantization: 'F16',
      status: 'ready',
      isLoaded: true
    };

    updateState(s => ({
      ...s,
      models: [...s.models, newModel as any],
      modelLab: { ...s.modelLab, selectedModelId: newModelId }
    }));

    notify("Neural Kernel successfully registered to local lab.");
    setShowImport(false);
    setImportUrl('');
  };

  const navItems = [
    { id: 'overview', label: 'Control', icon: Cpu },
    { id: 'datasets', label: 'Data', icon: Database },
    { id: 'training', label: 'Training', icon: Zap },
    { id: 'benchmark', label: 'Benchmarks', icon: Trophy },
    { id: 'merging', label: 'Merge', icon: Combine },
    { id: 'export', label: 'Export', icon: Rocket }
  ];

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-hidden">
      {/* LAB HEADER */}
      <header className="h-14 border-b border-white/5 bg-[#0b0d12] flex items-center px-6 justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-[var(--p)]/20 text-[var(--p)] flex items-center justify-center border border-[var(--p)]/20 shadow-lg">
            <FlaskConical size={18} />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase italic tracking-tighter text-white">Frontier Model Lab</h1>
            <div className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] leading-none">Neural Evolution Matrix</div>
          </div>
        </div>

        <nav className="flex bg-white/5 p-1 rounded-xl border border-white/5 mx-8 overflow-x-auto no-scrollbar">
          {navItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0",
                activeTab === tab.id ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white"
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Cluster_Online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
         <PanelGroup direction="horizontal">
            {/* LEFT PANEL: CONTEXT & FLOW */}
            <Panel defaultSize={22} minSize={18}>
               <div className="h-full flex flex-col bg-[#0b0d12] border-r border-white/5 p-6 overflow-y-auto custom-scrollbar">
                  <div className="space-y-8">
                     {/* STATS OVERVIEW */}
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">System Payload</label>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <div className="text-[8px] font-black opacity-30 uppercase tracking-widest leading-none mb-2">Active Jobs</div>
                              <div className="text-xl font-syne font-black italic text-white leading-none">
                                 {modelLab.jobs.filter(j => j.status === 'running').length}
                              </div>
                           </div>
                           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <div className="text-[8px] font-black opacity-30 uppercase tracking-widest leading-none mb-2">Distillates</div>
                              <div className="text-xl font-syne font-black italic text-white leading-none">
                                 {modelLab.checkpoints.length}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* ACTIVE MODELS */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">Active Bases</label>
                           <button 
                             onClick={() => setShowImport(true)}
                             className="text-[8px] text-[var(--p)] font-black uppercase hover:underline"
                           >
                            + Import
                           </button>
                        </div>
                        <div className="space-y-2">
                           {state.models.filter(m => m).map(m => (
                              <button 
                                key={m.id}
                                onClick={() => updateState(s => ({ ...s, modelLab: { ...s.modelLab, selectedModelId: m.id } }))}
                                className={cn(
                                   "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all group text-left",
                                   modelLab.selectedModelId === m.id ? "bg-[var(--p)]/10 border-[var(--p)]/30" : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                                )}
                              >
                                 <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                                   modelLab.selectedModelId === m.id ? "bg-[var(--p)] text-white" : "bg-black/40 text-white/20 group-hover:text-[var(--p)]"
                                 )}>
                                    <ModelIcon size={18} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-black text-white uppercase italic truncate">{m.name}</div>
                                    <div className="text-[9px] font-bold text-white/20 uppercase mt-1">{m.size} • {m.quantization || 'F16'}</div>
                                 </div>
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* RECENT JOBS */}
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">Optimization Trace</label>
                        <div className="space-y-3">
                           {modelLab.jobs.length === 0 ? (
                             <div className="text-center py-8 opacity-10 space-y-3">
                               <RefreshCw size={24} className="mx-auto" />
                               <div className="text-[8px] font-black uppercase tracking-widest">No Active Jobs</div>
                             </div>
                           ) : (
                             modelLab.jobs.slice(0, 5).map(job => (
                                <div key={job.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                                   <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-black text-white/50 uppercase italic">{job.method} Pipeline</span>
                                      <span className={cn(
                                         "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                                         job.status === 'running' ? "text-[var(--p)] border-[var(--p)]/20 animate-pulse" :
                                         job.status === 'completed' ? "text-emerald-500 border-emerald-500/20" : "text-white/20 border-white/10"
                                      )}>{job.status}</span>
                                   </div>
                                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                      <motion.div className="h-full bg-[var(--p)]" animate={{ width: `${job.progress}%` }} />
                                   </div>
                                   <div className="flex justify-between text-[8px] font-black uppercase text-white/20 tracking-widest">
                                      <span>Progress</span>
                                      <span>{job.progress.toFixed(0)}%</span>
                                   </div>
                                </div>
                             ))
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </Panel>

            <PanelResizeHandle className="w-px bg-white/5 hover:bg-[var(--p)]/20 transition-colors cursor-col-resize" />

            {/* MAIN WORKSPACE */}
            <Panel defaultSize={78}>
               <div className="h-full bg-[#050505] overflow-y-auto custom-scrollbar p-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      {activeTab === 'overview' && <LabOverview onTabChange={setActiveTab} />}
                      {activeTab === 'datasets' && <DatasetManager state={state} updateState={updateState} notify={notify} />}
                      {activeTab === 'training' && <TrainingCore state={state} updateState={updateState} notify={notify} />}
                      {activeTab === 'benchmark' && <BenchmarkTester state={state} updateState={updateState} notify={notify} />}
                      {activeTab === 'merging' && <MergingMatrix state={state} updateState={updateState} notify={notify} />}
                      {activeTab === 'export' && <ExportRegistry state={state} updateState={updateState} notify={notify} />}
                      
                      {['retrain'].includes(activeTab) && (
                        <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8 animate-in zoom-in duration-500">
                           <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center text-white/10 border border-white/10 group">
                              {activeTab === 'benchmark' && <Trophy size={48} />}
                              {activeTab === 'merging' && <Combine size={48} />}
                              {activeTab === 'export' && <Rocket size={48} />}
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-4xl font-syne font-black text-white uppercase italic tracking-tighter">{activeTab} Module Restructuring</h4>
                              <p className="text-sm font-medium text-white/40 max-w-lg mx-auto leading-relaxed">
                                 The Frontier Lab is undergoing core architectural alignment. This module is being optimized for native sovereign processing. Estimated completion: T-Zero.
                              </p>
                              <button 
                                onClick={() => setActiveTab('overview')}
                                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase italic tracking-widest rounded-2xl hover:bg-white/10 transition-all mt-8"
                              >
                                 Return to Command Center
                              </button>
                           </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
               </div>
            </Panel>
         </PanelGroup>
      </div>

      {/* IMPORT MODAL */}
      <AnimatePresence>
        {showImport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-xl glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-12 space-y-10 shadow-3xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-3xl font-syne font-black text-white uppercase italic tracking-tighter">Universal Ingress</h4>
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mt-2">Bridge external neural weights to local lab</p>
                </div>
                <button onClick={() => setShowImport(false)} className="text-white/20 hover:text-white hover:rotate-90 transition-all"><XCircle size={32} /></button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'hf' as const, label: 'HF Hub', icon: Github },
                  { id: 'local' as const, label: 'Local Disk', icon: Save },
                  { id: 'usb' as const, label: 'External', icon: Layers }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setImportSource(s.id)}
                    className={cn(
                      "p-6 rounded-[24px] border flex flex-col items-center gap-4 transition-all shadow-md group",
                      importSource === s.id 
                        ? "bg-[var(--p)]/10 border-[var(--p)]/40 text-[var(--p)]" 
                        : "bg-white/5 border-white/10 text-white/30 hover:text-white"
                    )}
                  >
                    <s.icon size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic ml-1">Ingress Identifier</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder={importSource === 'hf' ? 'e.g. meta-llama/Llama-3-8B' : 'Select target path...'}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all placeholder:text-white/10"
                  />
                  {importSource !== 'hf' && (
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/5 rounded-xl text-white/40 hover:text-white text-[9px] font-black uppercase">Browse</button>
                  )}
                </div>
              </div>

              <button 
                onClick={handleImport}
                className="w-full py-6 bg-white text-black font-black uppercase italic tracking-[0.4em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 group"
              >
                <DownloadCloud size={24} className="group-hover:animate-bounce" />
                Engage Transfer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
         .font-syne { font-family: 'Syne', sans-serif; }
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--p); }
         .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
