import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, DownloadCloud, Trash2, CheckCircle2, Clock, Globe, Shield, Cpu, ExternalLink } from 'lucide-react';
import { AppState } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export const ExportRegistry: React.FC<Props> = ({ state, updateState, notify }) => {
  const { modelLab } = state;
  const [publishing, setPublishing] = useState<string | null>(null);

  const handlePublish = (id: string) => {
    setPublishing(id);
    notify("Initiating sovereign deployment protocol...");
    setTimeout(() => {
      setPublishing(null);
      notify("Neural core successfully published to distributed node network.");
    }, 3000);
  };

  const handleDownload = (name: string) => {
    notify(`Preparing binary distribution for ${name}...`);
    setTimeout(() => {
      notify(`Download stream initiated: ${name}.safetensors`);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-4">
        <h3 className="text-5xl font-syne font-black text-white uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Export Registry</h3>
        <p className="text-sm font-medium text-white/40 max-w-2xl leading-relaxed uppercase tracking-widest leading-loose">Deploy your distilled neural architectures to production environments. Manage weights, format conversions, and sovereign node synchronization from a unified command interface.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            <div className="glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-10 space-y-10 shadow-3xl">
               <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic mb-2">Ready for Distribution</h4>
                  <div className="flex items-center gap-4 text-[9px] font-black text-white/40 uppercase tracking-widest">
                     <span>Filter: All Binaries</span>
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
               </div>

               <div className="space-y-4">
                  {modelLab.checkpoints.length === 0 ? (
                    <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6 border-2 border-dashed border-white/5 rounded-[32px]">
                       <Rocket size={64} strokeWidth={1} />
                       <div className="space-y-2 px-12">
                          <h5 className="text-xl font-syne font-black uppercase italic tracking-tighter">No Binary Targets Detected</h5>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Optimization sequences must reach terminal status before weights can be registered for export.</p>
                       </div>
                    </div>
                  ) : (
                    modelLab.checkpoints.map(cp => (
                      <div key={cp.id} className="p-8 bg-white/[0.03] border border-white/5 rounded-[32px] hover:bg-white/[0.05] transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-black/40 border border-white/5 flex items-center justify-center text-[var(--p)] shadow-inner">
                               <Cpu size={24} />
                            </div>
                            <div className="space-y-1">
                               <div className="text-xl font-syne font-black text-white uppercase italic tracking-tighter">{cp.name}</div>
                               <div className="flex items-center gap-3 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                  <span>{cp.baseId.toUpperCase()} Base</span>
                                  <span className="w-1 h-1 rounded-full bg-white/10" />
                                  <span>FP16 Weights</span>
                               </div>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleDownload(cp.name)}
                              className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-2"
                            >
                               <DownloadCloud size={14} /> Local
                            </button>
                            <button 
                              onClick={() => handlePublish(cp.id)}
                              disabled={publishing === cp.id}
                              className="px-6 py-3 bg-[var(--p)] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--p)]/20 flex items-center gap-2 disabled:opacity-50"
                            >
                               {publishing === cp.id ? <Clock size={14} className="animate-spin" /> : <Globe size={14} />}
                               {publishing === cp.id ? "Syncing..." : "Publish"}
                            </button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <div className="p-10 border border-white/5 bg-white/[0.01] rounded-[40px] space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                     <Shield size={20} />
                  </div>
                  <div>
                     <h4 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">Security Masking</h4>
                     <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Weight Provenance Encryption</p>
                  </div>
               </div>
               <p className="text-[12px] font-medium text-white/40 leading-relaxed uppercase tracking-wider">All exported binaries undergo automated metadata stripping and fingerprinting to ensure sovereign anonymity across distributed grids.</p>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center">
                     <div className="text-xs font-black text-white">AES-256</div>
                     <div className="text-[8px] font-bold text-white/20 uppercase mt-1">Encryption</div>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center">
                     <div className="text-xs font-black text-white">SHA-512</div>
                     <div className="text-[8px] font-bold text-white/20 uppercase mt-1">Neural ID</div>
                  </div>
               </div>
            </div>

            <div className="glass bg-[#0b0d12] border border-white/10 rounded-[40px] p-10 space-y-8 overflow-hidden relative group shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                  <ExternalLink size={120} />
               </div>
               <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic mb-2 relative">Target Infrastructure</h4>
               <ul className="space-y-5 relative">
                  {[
                     { l: 'Local Inference (ollama/llama.cpp)', active: true },
                     { l: 'Private Inference Gateway', active: false },
                     { l: 'P2P Decentralized Compute', active: true },
                     { l: 'Authoritative Secure Enclave', active: false }
                  ].map(item => (
                     <li key={item.l} className="flex items-center justify-between">
                        <span className={cn("text-[10px] font-black uppercase italic tracking-widest", item.active ? "text-white/60" : "text-white/20")}>{item.l}</span>
                        {item.active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
};
