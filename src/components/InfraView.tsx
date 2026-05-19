import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Boxes, 
  Flame, 
  Activity, 
  Database,
  Cpu,
  Monitor,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppState } from '../types';
import { cn } from '../lib/utils';

interface InfraViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function InfraView({ state, updateState, notify }: InfraViewProps) {
  const frameworks = [
    { 
      name: 'Kubernetes', 
      icon: Boxes, 
      color: 'text-blue-400', 
      desc: 'Auto-scaling POD management and orchestration.', 
      key: 'kubernetes', 
      connectionType: 'KUBECONFIG Path' 
    },
    { 
      name: 'TensorFlow', 
      icon: Flame, 
      color: 'text-orange-500', 
      desc: 'Keras-integrated distributed graph acceleration.', 
      key: 'tensorflow', 
      connectionType: 'GRPC Master IP' 
    },
    { 
      name: 'PyTorch', 
      icon: Activity, 
      color: 'text-red-500', 
      desc: 'Dynamic computation graphs and TorchScript JIT.', 
      key: 'pytorch', 
      connectionType: 'NCCL Sync URL' 
    },
    { 
      name: 'Datasets', 
      icon: Database, 
      color: 'text-green-500', 
      desc: 'Unified tensor sharding and parquet streaming.', 
      key: 'datasets', 
      connectionType: 'S3/HF Data Endpoint' 
    }
  ];

  const toggleFramework = (key: string, name: string) => {
    const isActive = state.infra.activeFrameworks.includes(key);
    updateState((s: AppState) => ({
      ...s,
      infra: {
        ...s.infra,
        activeFrameworks: isActive 
          ? s.infra.activeFrameworks.filter((n: string) => n !== key)
          : [...s.infra.activeFrameworks, key]
      }
    }));
    notify(`${name} distributed status: ${isActive ? 'OFFLINE' : 'SYNCHRONIZED'}`);
  };

  const updateEndpoint = (key: string, value: string) => {
    updateState(s => ({
      ...s,
      infra: {
        ...s.infra,
        endpoints: { ...s.infra.endpoints, [key]: value }
      }
    }));
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-black">
      <div className="max-w-7xl mx-auto space-y-12 pb-24">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 glass p-10 rounded-[48px] border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent">
           <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-[32px] bg-[var(--p)] text-white flex items-center justify-center shadow-2xl shadow-[var(--p)]/30 relative group overflow-hidden">
                 <Settings size={40} />
                 <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                   className="absolute inset-0 border-4 border-dashed border-white/20 rounded-full scale-150 pointer-events-none"
                 />
              </div>
              <div>
                 <h2 className="text-5xl font-syne font-black uppercase italic leading-tight text-white tracking-tighter">Cluster Config</h2>
                 <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-white">Distributed Neural Resource Management</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                 </div>
              </div>
           </div>
           
           <div className="flex gap-4">
              <div className="glass p-5 px-8 rounded-3xl border-white/5 flex flex-col items-center bg-white/[0.02]">
                 <span className="text-[10px] font-black opacity-30 uppercase mb-2 tracking-widest text-white">Total TFLOPS</span>
                 <span className="text-2xl font-syne font-black text-blue-400">12.4K</span>
              </div>
              <div className="glass p-5 px-8 rounded-3xl border-white/5 flex flex-col items-center bg-white/[0.02]">
                 <span className="text-[10px] font-black opacity-30 uppercase mb-2 tracking-widest text-white">Global Sync</span>
                 <span className="text-2xl font-syne font-black text-green-500">99.2%</span>
              </div>
           </div>
        </header>

        {/* FRAMEWORKS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {frameworks.map(f => {
             const isActive = state.infra.activeFrameworks.includes(f.key);
             return (
               <div key={f.name} className={cn(
                 "glass p-10 rounded-[56px] border transition-all duration-500 flex flex-col bg-gradient-to-br space-y-8",
                 isActive 
                   ? "border-[var(--p)]/40 from-[var(--p)]/[0.03] to-transparent shadow-2xl shadow-[var(--p)]/5" 
                   : "border-white/5 from-white/[0.01] to-transparent"
               )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 border",
                        isActive ? "bg-[var(--p)]/10 border-[var(--p)]/20" : "bg-white/5 border-white/10"
                      )}>
                        <f.icon size={28} className={cn(isActive ? "text-[var(--p)]" : "opacity-30")} />
                      </div>
                      <div>
                         <h4 className="font-syne font-black uppercase text-xl text-white tracking-tight">{f.name}</h4>
                         <div className="flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500 animate-pulse" : "bg-white/10")} />
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isActive ? 'Operational' : 'Idle / Standby'}</span>
                         </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleFramework(f.key, f.name)}
                      className={cn(
                        "relative w-16 h-8 rounded-full transition-all duration-300 p-1 flex items-center",
                        isActive ? "bg-emerald-500" : "bg-white/10"
                      )}
                    >
                      <motion.div 
                        initial={false}
                        animate={{ x: isActive ? 32 : 0 }}
                        className="w-6 h-6 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-8">
                     <p className="text-xs text-white/50 leading-relaxed font-medium italic">"{f.desc}"</p>
                     
                     <div className="space-y-6 pt-8 border-t border-white/5">
                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase opacity-30 tracking-[0.2em] text-white ml-1">Network Access Protocol</label>
                          <div className="relative">
                            <input 
                              type="text"
                              value={state.infra.endpoints?.[f.key] || ''}
                              onChange={(e) => updateEndpoint(f.key, e.target.value)}
                              placeholder={`Enter ${f.connectionType}...`}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-xs font-mono font-bold text-white/80 outline-none focus:border-[var(--p)] focus:ring-2 focus:ring-[var(--p)]/20 transition-all shadow-inner"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20">
                              <Zap size={16} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 glass bg-white/[0.02] rounded-[32px] border border-white/5 relative overflow-hidden group">
                             <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <div className="text-[8px] font-black uppercase opacity-20 mb-2 tracking-widest text-white">Neural Latency (E2E)</div>
                             <div className="flex items-center gap-3">
                                <span className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500")} />
                                <span className="text-sm font-syne font-black uppercase tracking-tighter text-white">{isActive ? '1.2ms' : 'INF/FAULT'}</span>
                             </div>
                          </div>
                          <div className="p-5 glass bg-white/[0.02] rounded-[32px] border border-white/5 relative overflow-hidden group">
                             <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <div className="text-[8px] font-black uppercase opacity-20 mb-2 tracking-widest text-white">Sync Throughput</div>
                             <div className="text-sm font-syne font-black uppercase tracking-tighter text-white">{isActive ? '8.4 GB/s' : '0 B/s'}</div>
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
             );
           })}
        </div>

        {/* INFRASTRUCTURE MAP */}
        <div className="glass p-12 rounded-[64px] border-white/5 space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[var(--p)]/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                    <Boxes size={24} />
                 </div>
                 <h3 className="text-2xl font-syne font-black uppercase italic text-white tracking-tight">Neural Infrastructure Map</h3>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                 <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-green-500">GPU Cluster: ONLINE</span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              <div className="space-y-6">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-white ml-1">Active Compute Nodes</div>
                 <div className="space-y-3">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className="flex items-center justify-between p-5 glass bg-white/[0.03] rounded-3xl border-white/5 hover:border-white/20 transition-all group cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-blue-400/10 transition-colors">
                              <Cpu size={18} className="text-blue-400 group-hover:scale-110 transition-all" />
                            </div>
                            <span className="text-xs font-black text-white/80 tracking-tight">NODE_0{n} / A100_SXM4</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className={cn("text-[10px] font-black", n===1 ? "text-red-500" : "text-green-500")}>{n===1 ? '98%' : (n === 3 ? '12%' : '72%')}</span>
                            <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }} 
                                 animate={{ width: n===1 ? '98%' : (n === 3 ? '12%' : '72%') }} 
                                 className={cn("h-full", n===1 ? "bg-red-500" : "bg-green-500")} 
                               />
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-white ml-1">Distributed Orchestration Logs</div>
                 <div className="glass bg-black/60 p-10 rounded-[48px] font-mono text-xs text-blue-400/80 space-y-3 h-[420px] overflow-hidden shadow-inner border border-white/10 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
                    <div className="opacity-40 animate-pulse">[07:11:02] Initializing K8s Master Control Plane... OK</div>
                    <div className="opacity-40">[07:11:04] Establishing Pytorch RPC Handshake... OK</div>
                    <div className="opacity-40">[07:11:05] NCCL Communications backend: [AUTHORIZED]</div>
                    <div className="opacity-60 text-white">[K8S] NODE_01 reaching thermal threshold (82C). Scheduling failover...</div>
                    <div className="opacity-60 text-white">[DIST] Migrating weights from NODE_01 to NODE_05... SUCCESS</div>
                    <div className="text-white">[SYS] Allocating 1.2TB Sharded Dataset VRAM... [SHARD_V_09]</div>
                    <div className="text-green-400 font-bold">[SYS] TensorFlow ClusterStrategy: SYNCHRONIZED across 8 nodes.</div>
                    <div className="text-white opacity-80">[AUDIT] Latency peak detected in us-east-1. Automating traffic re-route...</div>
                    <div className="text-blue-400/50 animate-pulse italic mt-4">--- Awaiting multi-model inference orchestration command ---</div>
                    
                    <div className="absolute bottom-6 right-10 flex items-center gap-3">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Inference Socket: 3001</span>
                       <Monitor size={16} className="text-white/20" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
