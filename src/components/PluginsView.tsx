import React from 'react';
import { Box, Download, Settings, ToggleLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PluginsView() {
  const plugins = [
    { name: 'Browser Interface', desc: 'Allows models to execute web searches and crawl dynamic sites.', icon: '🌐', enabled: true },
    { name: 'Python Interpreter', desc: 'Secure Docker-isolated environment for code execution.', icon: '🐍', enabled: true },
    { name: 'Wolfram Alpha', desc: 'High-precision symbolic computation for scientific logic.', icon: '📐', enabled: false },
    { name: 'File System Bridge', desc: 'Read/Write access to designated local sanctum directories.', icon: '📂', enabled: true },
  ];

  return (
    <div className="h-full p-20 flex flex-col items-center justify-center bg-black overflow-hidden relative">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[var(--p)]/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
       
       <div className="max-w-4xl w-full space-y-12 relative z-10">
          <div className="flex items-center gap-10">
             <div className="w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                <Box size={48} className="text-[var(--p)]" strokeWidth={1} />
             </div>
             <div>
                <h2 className="text-6xl font-syne font-black uppercase italic tracking-tighter text-white">Plugins</h2>
                <p className="text-xl font-medium text-white/30 uppercase tracking-[0.2em] mt-2">Extend Sovereign Logic via External Tools</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {plugins.map((plugin, i) => (
               <div key={i} className={cn("glass p-8 rounded-[48px] border-white/5 space-y-6 group transition-all", plugin.enabled ? "bg-white/[0.03] border-white/10" : "opacity-40 grayscale")}>
                  <div className="flex items-center justify-between">
                     <span className="text-4xl">{plugin.icon}</span>
                     <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", plugin.enabled ? "text-emerald-500" : "text-white/20")}>{plugin.enabled ? 'Enabled' : 'Disabled'}</span>
                        <ToggleLeft className={cn("transition-all", plugin.enabled ? "text-emerald-500 rotate-180" : "text-white/20")} size={24} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-xl font-syne font-black uppercase text-white">{plugin.name}</h4>
                     <p className="text-sm text-white/50 leading-relaxed font-medium">{plugin.desc}</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                     <button className="flex-1 py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all">Config</button>
                     <button className="p-3 bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all">
                        <Settings size={18} />
                     </button>
                  </div>
               </div>
             ))}
             <button className="group border-2 border-dashed border-white/10 rounded-[48px] flex flex-col items-center justify-center gap-4 p-8 hover:border-[var(--p)]/40 transition-all bg-transparent h-[280px]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--p)]/20 transition-all overflow-hidden relative">
                   <Download size={24} className="text-white/20 group-hover:text-[var(--p)] transition-all" />
                </div>
                <div className="text-center">
                   <span className="block text-sm font-black uppercase text-white/20 group-hover:text-white transition-all tracking-widest">Install Component</span>
                   <span className="text-[9px] font-medium text-white/10 uppercase mt-1 tracking-widest">Browse Global Repository</span>
                </div>
             </button>
          </div>
       </div>
    </div>
  );
}
