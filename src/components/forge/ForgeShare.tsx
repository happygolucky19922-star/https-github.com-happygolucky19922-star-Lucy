import React, { useState } from 'react';
import { 
  Lock, Share2, DollarSign, ArrowRight, CheckCircle2, 
  DownloadCloud, Globe, Shield, Scale, Info, ExternalLink,
  Table, FileJson, FileText, Layout
} from 'lucide-react';
import { AppState } from '../../types';
import { cn } from '../../lib/utils';
import { DatasetPassport } from './DatasetPassport';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export const ForgeShare: React.FC<Props> = ({ state, updateState, notify }) => {
  const dsId = state.dataForge.activeDatasetId;
  const ds = state.dataForge.datasets.find(d => d.id === dsId);
  const [mode, setMode] = useState<'private' | 'share_free' | 'sell' | null>(null);
  const [priceType, setPriceType] = useState('one-time');
  const [license, setLicense] = useState('Open Use');

  if (!ds) return <div className="text-center py-20 text-white/20">Select a dataset to begin.</div>;

  const licenses = ["Open Use", "Attribution Required", "Research Only", "Commercial Use", "Custom License"];

  const handleExport = () => {
    notify(`Finalizing sovereign distribution package for ${ds.name}...`);
    setTimeout(() => {
       notify("Package exported. Distribution lineage updated in Passport.");
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-4">
            <h1 className="text-4xl font-syne font-black text-white uppercase italic tracking-tighter">Distribution Terminal</h1>
            <p className="text-sm font-medium text-white/40 uppercase tracking-widest max-w-lg">
               Step 5: Define egress parameters. Finalize your sovereign asset for local use or global distribution.
            </p>
         </div>
      </header>

      {/* Main Choice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { id: 'private', label: 'Private', icon: Lock, desc: 'Keep local only. Encrypt weights for internal use.' },
           { id: 'share_free', label: 'Share Free', icon: Share2, desc: 'Generate public distribution package.' },
           { id: 'sell', label: 'Market Ready', icon: DollarSign, desc: 'Prepare for sovereign marketplace sale.' }
         ].map(m => (
           <button
             key={m.id}
             onClick={() => setMode(m.id as any)}
             className={cn(
               "p-10 rounded-[64px] border transition-all text-center flex flex-col items-center gap-6 group relative overflow-hidden",
               mode === m.id 
                 ? "bg-white text-black border-white shadow-[0_0_60px_rgba(255,255,255,0.1)] scale-105 z-20" 
                 : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04] hover:border-white/10"
             )}
           >
              <div className={cn(
                "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all",
                mode === m.id ? "bg-black text-white shadow-2xl" : "bg-white/5 text-white/20 group-hover:text-white"
              )}>
                 <m.icon size={28} />
              </div>
              <div className="space-y-3">
                 <div className="text-2xl font-syne font-black uppercase italic tracking-tighter leading-none">{m.label}</div>
                 <p className={cn(
                   "text-[10px] font-bold uppercase tracking-widest leading-relaxed px-6",
                   mode === m.id ? "text-black/60" : "text-white/20"
                 )}>
                    {m.desc}
                 </p>
              </div>
              {mode === m.id && (
                 <motion.div layoutId="check" className="absolute top-8 right-8">
                    <CheckCircle2 size={32} />
                 </motion.div>
              )}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
         {mode === 'sell' && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8"
           >
              <div className="lg:col-span-12">
                 <div className="p-1 underline-offset-8 h-px bg-white/5 w-full mb-12" />
              </div>

              {/* Pricing & License */}
              <div className="lg:col-span-8 space-y-8">
                 <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-6">
                          <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">Pricing Model</h4>
                          <div className="flex flex-wrap gap-2">
                             {['one-time', 'subscription', 'free', 'custom'].map(t => (
                               <button 
                                 key={t}
                                 onClick={() => setPriceType(t)}
                                 className={cn(
                                   "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                   priceType === t ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 text-white/40 hover:text-white"
                                 )}
                               >
                                  {t}
                               </button>
                             ))}
                          </div>
                          <div className="relative">
                             <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 uppercase font-black text-xs">$</div>
                             <input 
                               type="text" 
                               placeholder="0.00" 
                               className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 pl-12 text-2xl font-syne font-black text-white italic outline-none focus:border-emerald-500/30 transition-all"
                             />
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">License Assignment</h4>
                          <div className="space-y-2">
                             {licenses.map(l => (
                               <button 
                                 key={l}
                                 onClick={() => setLicense(l)}
                                 className={cn(
                                   "w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all group",
                                   license === l ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/[0.04]"
                                 )}
                               >
                                  <span className="text-[10px] font-black uppercase tracking-widest">{l}</span>
                                  {license === l && <CheckCircle2 size={12} className="text-emerald-500" />}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Package Preview */}
              <div className="lg:col-span-4 space-y-8">
                 <div className="p-10 glass bg-[#0b0d12] border border-white/10 rounded-[40px] space-y-8">
                    <h4 className="text-[11px] font-black text-[var(--p)] uppercase tracking-[0.4em] italic leading-none">Package Manifest</h4>
                    
                    <ul className="space-y-4">
                       {[
                         { id: 'bin', label: 'Dataset Binaries (.safetensors)', icon: Database },
                         { id: 'meta', label: 'JSON Metadata & Lineage', icon: FileJson },
                         { id: 'read', label: 'README & Usage Guide', icon: FileText },
                         { id: 'pass', label: 'Exported Neural Passport', icon: Shield },
                         { id: 'thumb', label: 'Product Thumbnails', icon: Layout }
                       ].map(item => (
                         <li key={item.id} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                               <item.icon size={14} />
                            </div>
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{item.label}</span>
                         </li>
                       ))}
                    </ul>

                    <div className="pt-4">
                       <DatasetPassport cp={ds} />
                    </div>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {(mode === 'private' || mode === 'share_free') && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-2xl mx-auto p-12 bg-white/[0.01] border border-white/5 rounded-[64px] text-center space-y-8"
         >
            <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 mx-auto">
               <DownloadCloud size={32} />
            </div>
            <div className="space-y-3">
               <h4 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter">Ready for Egress</h4>
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] leading-relaxed px-12">
                  All binaries have been finalized and verified against the factory core. Proceed to generate the local distribution package.
               </p>
            </div>
         </motion.div>
      )}

      {mode && (
        <div className="flex justify-center pb-12">
           <button 
             onClick={handleExport}
             className="px-16 py-6 bg-emerald-600 text-white font-black uppercase text-sm tracking-widest rounded-[32px] hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-emerald-500/20 flex items-center gap-4"
           >
              Finalize & Export <DownloadCloud size={20} />
           </button>
        </div>
      )}
    </div>
  );
};
