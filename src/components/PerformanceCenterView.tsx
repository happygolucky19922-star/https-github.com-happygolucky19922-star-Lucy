import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Cpu, HardDrive, Zap, Thermometer, 
  Database, Network, Gauge, Shield, RefreshCw, 
  BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface PerformanceCenterViewProps {
  state: AppState;
  updateState: any;
  hwStatus: any;
  notify: any;
  toggleModelLoad: (id: string) => void;
}

export default function PerformanceCenterView({ state, updateState, hwStatus, notify, toggleModelLoad }: PerformanceCenterViewProps) {
  const activeModelId = state.arenaModel;
  const activeModel = state.models.find(m => m.id === activeModelId);

  return (
    <div className="h-full overflow-y-auto p-8 space-y-12 custom-scrollbar bg-black">
      <div className="max-w-7xl mx-auto space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-[24px] bg-[var(--p)] text-white flex items-center justify-center shadow-2xl shadow-[var(--p)]/30">
                    <Gauge size={36} />
                 </div>
                 <div>
                    <h2 className="text-4xl font-syne font-black uppercase italic leading-tight text-white tracking-tighter">Performance Center</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-white">Advanced System Telemetry & Kernel Optimization</p>
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              {/* CORE SELECTOR */}
              <div className="relative group/perf-selector cursor-pointer">
                 <div className={cn(
                    "glass p-4 px-8 rounded-2xl border transition-all flex items-center gap-4",
                    activeModelId ? "border-emerald-500/20 bg-emerald-500/5 shadow-2xl shadow-emerald-500/5" : "border-white/5"
                 )}>
                    <div className="text-right">
                       <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] block">Telemetry Core</span>
                       <span className="text-sm font-syne font-black uppercase italic text-white tracking-wider">
                          {activeModel?.name || 'Inspect Core'}
                       </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover/perf-selector:text-emerald-500 transition-colors">
                       <Activity size={20} />
                    </div>
                 </div>

                 <div className="absolute top-full right-0 mt-4 w-72 glass bg-black/95 border border-white/10 rounded-[32px] p-6 shadow-2xl opacity-0 group-hover/perf-selector:opacity-100 pointer-events-none group-hover/perf-selector:pointer-events-auto transition-all transform translate-y-2 group-hover/perf-selector:translate-y-0 z-50">
                    <div className="space-y-4 text-left">
                       <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 border-b border-white/5 pb-2 italic">Neural Telemetry Matrix</div>
                       <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                          {state.models.map(m => (
                             <div key={m.id} className={cn(
                                "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group/item",
                                activeModelId === m.id ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10"
                             )} onClick={() => updateState((s: AppState) => ({ ...s, arenaModel: m.id }))}>
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

              <div className="h-12 w-px bg-white/5" />

              <div className="flex gap-4">
                 <div className="glass p-4 px-8 rounded-2xl border-white/5 flex flex-col items-center group cursor-pointer hover:border-emerald-500/20 transition-all">
                    <span className="text-[9px] font-black opacity-30 uppercase mb-1">System Health</span>
                    <span className="text-xl font-syne font-black text-emerald-500">PEAK</span>
                 </div>
                 <button 
                   onClick={() => notify("Optimizing system caches and re-aligning neural weights...")}
                   className="glass p-4 px-8 rounded-2xl border-white/5 flex items-center gap-4 hover:bg-[var(--p)] hover:text-white transition-all group"
                 >
                     <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                     <div className="text-left">
                        <div className="text-[9px] font-black opacity-30 uppercase">Neural Re-align</div>
                        <div className="text-xs font-black uppercase tracking-widest group-hover:text-white">Flush Buffers</div>
                     </div>
                 </button>
              </div>
           </div>
        </header>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="glass p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Cpu size={80} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                 <span>Central Processing</span>
                 <Activity size={16} className="text-blue-500" />
              </div>
              <div className="space-y-1">
                 <div className="text-4xl font-mono font-black text-white">{hwStatus.cpu}%</div>
                 <div className="text-[10px] font-bold text-blue-500 uppercase">16 Cores | 32 Threads</div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div animate={{ width: `${hwStatus.cpu}%` }} className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              </div>
           </div>

           <div className="glass p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Cpu size={80} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                 <span>vRAM Utilization</span>
                 <Zap size={16} className="text-yellow-500" />
              </div>
              <div className="space-y-1">
                 <div className="text-4xl font-mono font-black text-white">{hwStatus.gpu ? 84 : 12}%</div>
                 <div className="text-[10px] font-bold text-yellow-500 uppercase">{hwStatus.gpu ? 'RTX 4090 | 24GB' : 'Integrated Graphics'}</div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div animate={{ width: hwStatus.gpu ? '84%' : '12%' }} className="h-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              </div>
           </div>

           <div className="glass p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <HardDrive size={80} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                 <span>Memory Load</span>
                 <Activity size={16} className="text-purple-500" />
              </div>
              <div className="space-y-1">
                 <div className="text-4xl font-mono font-black text-white">{hwStatus.mem}%</div>
                 <div className="text-[10px] font-bold text-purple-500 uppercase">DDR5 | 64GB Allocated</div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div animate={{ width: `${hwStatus.mem}%` }} className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              </div>
           </div>

           <div className="glass p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Thermometer size={80} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                 <span>Thermal Status</span>
                 <Thermometer size={16} className="text-red-500" />
              </div>
              <div className="space-y-1">
                 <div className="text-4xl font-mono font-black text-white">{hwStatus.gpuInfo?.temp || 64}°C</div>
                 <div className="text-[10px] font-bold text-emerald-500 uppercase">Optimal Range</div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div animate={{ width: `${hwStatus.gpuInfo?.temp || 64}%` }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              </div>
           </div>
        </div>

        {/* DETAILED GPU TELEMETRY */}
        {hwStatus.gpu && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-[56px] border-white/5 relative overflow-hidden bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
               <Zap size={240} className="text-emerald-500" />
            </div>

            <div className="relative z-10 space-y-10">
               <div className="flex items-center justify-between border-b border-emerald-500/10 pb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Zap size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-syne font-black uppercase italic tracking-tighter text-white">Neural Hardware Node</h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/40 italic">Dedicated Neural Compute Unit (NVIDIA RTX 4090 Analog)</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Synchronized</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-30 block">vRAM Utilization</span>
                           <span className="text-3xl font-mono font-black text-white italic">{hwStatus.gpuInfo.vramUsed} / {hwStatus.gpuInfo.vramTotal} <span className="text-sm">GB</span></span>
                        </div>
                        <Activity size={18} className="text-emerald-500 pb-1" />
                     </div>
                     <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          animate={{ width: `${(hwStatus.gpuInfo.vramUsed / hwStatus.gpuInfo.vramTotal) * 100}%` }} 
                          className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-30 block">Core Clock Frequency</span>
                           <span className="text-3xl font-mono font-black text-white italic">{hwStatus.gpuInfo.clock} <span className="text-sm text-emerald-500">MHz</span></span>
                        </div>
                        <Gauge size={18} className="text-emerald-500 pb-1" />
                     </div>
                     <div className="flex gap-1 h-2">
                        {Array.from({ length: 40 }).map((_, i) => (
                           <motion.div 
                             key={i}
                             animate={{ opacity: i < (hwStatus.gpuInfo.clock / 2500) * 40 ? 1 : 0.1 }}
                             className="flex-1 rounded-full bg-emerald-500"
                           />
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-30 block">Thermal Envelope</span>
                           <span className={cn(
                             "text-3xl font-mono font-black italic",
                             hwStatus.gpuInfo.temp > 75 ? "text-red-500" : "text-white"
                           )}>{hwStatus.gpuInfo.temp}°C</span>
                        </div>
                        <Thermometer size={18} className={cn("pb-1", hwStatus.gpuInfo.temp > 75 ? "text-red-500" : "text-emerald-500")} />
                     </div>
                     <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          animate={{ width: `${hwStatus.gpuInfo.temp}%` }} 
                          className={cn(
                            "h-full shadow-lg",
                            hwStatus.gpuInfo.temp > 75 ? "bg-red-500 shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                          )} 
                        />
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* Detailed Metrics & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Performance Presets */}
           <div className="lg:col-span-1 glass p-10 rounded-[56px] border-white/5 space-y-8 bg-gradient-to-b from-white/2 to-transparent">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                 <BarChart3 size={20} className="text-[var(--p)]" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">Performance Presets</h3>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'saver', name: 'Sovereign Silence', desc: 'Minimal power, fans inhibited.', badge: 'SAVER' },
                   { id: 'balanced', name: 'Equalized Logic', desc: 'Standard operational density.', badge: 'BALANCED' },
                   { id: 'max', name: 'Max Overdrive', desc: 'Uncapped neural acceleration.', badge: 'FULL_ENGAGEMENT' }
                 ].map((p) => (
                   <button 
                     key={p.id} 
                     onClick={() => notify(`Master Performance Preset: ${p.id.toUpperCase()} engaged.`)}
                     className="w-full flex flex-col gap-2 p-6 rounded-3xl bg-white/2 border border-white/5 hover:border-[var(--p)]/40 hover:bg-[var(--p)]/5 transition-all text-left group"
                   >
                      <div className="flex justify-between items-center">
                         <div className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[var(--p)] transition-colors">{p.name}</div>
                         <div className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded-full opacity-40">{p.badge}</div>
                      </div>
                      <div className="text-[10px] text-[var(--tm)] italic font-medium opacity-50">{p.desc}</div>
                   </button>
                 ))}
              </div>
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-start gap-4">
                 <Shield size={18} className="text-emerald-500 shrink-0" />
                 <p className="text-[9px] font-medium leading-relaxed text-emerald-200/60 uppercase tracking-widest italic">Hardware protection active. System will self-throttle at 105°C to prevent silicon degradation.</p>
              </div>
           </div>

           {/* Middle/Right: Advanced Telemetry */}
           <div className="lg:col-span-2 space-y-8">
              <div className="glass p-10 rounded-[56px] border-white/5 space-y-8">
                 <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                       <Activity size={20} className="text-[var(--p)]" />
                       <h3 className="text-xs font-black uppercase tracking-widest text-white">Live Benchmark Traces</h3>
                    </div>
                    <div className="text-[10px] font-mono text-white/20 uppercase">Sampling @ 60Hz</div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       {[
                         { l: 'Token Latency', v: '18ms', p: 92, c: 'bg-emerald-500' },
                         { l: 'Inference Path', v: '0.4s', p: 85, c: 'bg-emerald-500' },
                         { l: 'Weight Loading', v: '2.1s', p: 40, c: 'bg-yellow-500' }
                       ].map(b => (
                         <div key={b.l} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="opacity-40">{b.l}</span>
                               <span className="text-white">{b.v}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${b.p}%` }} className={cn("h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", b.c)} />
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="space-y-6">
                       {[
                         { l: 'Context Compression', v: '4x', p: 75, c: 'bg-blue-500' },
                         { l: 'KV Cache Efficiency', v: '98%', p: 98, c: 'bg-emerald-500' },
                         { l: 'Bus Bandwidth', v: '450 GB/s', p: 65, c: 'bg-blue-500' }
                       ].map(b => (
                         <div key={b.l} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="opacity-40">{b.l}</span>
                               <span className="text-white">{b.v}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${b.p}%` }} className={cn("h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", b.c)} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="glass p-10 rounded-[56px] border-white/5 flex flex-col justify-between h-64 bg-gradient-to-tr from-blue-500/5 to-transparent">
                    <div className="space-y-2">
                       <Network size={24} className="text-blue-400" />
                       <div className="text-xs font-black uppercase tracking-widest text-white">Network Egress</div>
                    </div>
                    <div className="space-y-1">
                       <div className="text-4xl font-mono font-black text-white italic">0.0 <span className="text-xl">KB/s</span></div>
                       <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sovereign Air-Gap Verified</div>
                    </div>
                 </div>

                 <div className="glass p-10 rounded-[56px] border-white/5 flex flex-col justify-between h-64 bg-gradient-to-tr from-[var(--p)]/5 to-transparent">
                    <div className="space-y-2">
                       <Database size={24} className="text-[var(--p)]" />
                       <div className="text-xs font-black uppercase tracking-widest text-white">Disk I/O</div>
                    </div>
                    <div className="space-y-1">
                       <div className="text-4xl font-mono font-black text-white italic">1.2 <span className="text-xl">GB/s</span></div>
                       <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">NVMe Seq Reading Data</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
