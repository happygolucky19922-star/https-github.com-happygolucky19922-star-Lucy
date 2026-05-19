import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Search, 
  FileText, 
  AlertCircle, 
  Gavel, 
  History, 
  Settings, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Landmark,
  Scale,
  Brain,
  Zap,
  Activity,
  FileCheck,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState, OversightAlert, Bill, Donation, Patent } from '../types';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function HouseOversightView({ state, updateState, notify }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'bills' | 'donations' | 'patents' | 'config'>('alerts');
  const oversight = state.houseOversight;

  const toggleMonitoring = () => {
    updateState(s => ({
      ...s,
      houseOversight: {
        ...s.houseOversight,
        isMonitoring: !s.houseOversight.isMonitoring
      }
    }));
    notify(oversight.isMonitoring ? "Oversight standby..." : "Active oversight protocols engaged.");
  };

  return (
    <div className="flex flex-col h-full bg-[#050507] overflow-hidden">
      {/* HEADER BAR */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="font-syne font-black text-xs uppercase tracking-[0.4em] text-white/90 italic">House Oversight</h2>
            <div className="flex items-center gap-2 mt-1">
               <div className={cn("w-2 h-2 rounded-full animate-pulse", oversight.isMonitoring ? "bg-emerald-500 shadow-[0_0_8px_var(--emerald-500)]" : "bg-white/20")} />
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
                  {oversight.isMonitoring ? "Active Verification Node" : "Standby Mode"}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-8 px-8 border-x border-white/5 h-20">
              <div className="text-center">
                 <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 italic">Active Scans</div>
                 <div className="text-lg font-black text-white font-mono">{oversight.isMonitoring ? '24' : '0'}</div>
              </div>
              <div className="text-center">
                 <div className="text-[10px] font-black text-amber-500/40 uppercase tracking-widest mb-1 italic">Threats Detected</div>
                 <div className="text-lg font-black text-amber-500 font-mono">{oversight.alerts.length}</div>
              </div>
           </div>

           <button 
              onClick={toggleMonitoring}
              className={cn(
                "px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
                oversight.isMonitoring 
                  ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" 
                  : "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
              )}
           >
              {oversight.isMonitoring ? "Shut Down oversight" : "Initialize oversight"}
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SUB-NAVIGATION */}
        <div className="w-64 border-r border-white/5 flex flex-col bg-black/20 shrink-0">
          <div className="p-4 space-y-1">
             {[
               { id: 'alerts', label: 'Threat Alerts', icon: AlertCircle, count: oversight.alerts.length },
               { id: 'bills', label: 'Bill Tracker', icon: Landmark, count: oversight.trackedBills.length },
               { id: 'donations', label: 'Donation Pulse', icon: TrendingUp, count: oversight.trackedDonations.length },
               { id: 'patents', label: 'Patent Registry', icon: FileCheck, count: oversight.patents.length },
               { id: 'config', label: 'Automation', icon: Clock },
             ].map((item) => (
               <button
                 key={item.id}
                 onClick={() => setActiveSubTab(item.id as any)}
                 className={cn(
                   "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
                   activeSubTab === item.id 
                     ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                     : "text-white/30 hover:text-white/60 hover:bg-white/5"
                 )}
               >
                 <div className="flex items-center gap-3">
                    <item.icon size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest italic">{item.label}</span>
                 </div>
                 {item.count !== undefined && (
                   <span className={cn(
                     "text-[8px] font-black px-1.5 py-0.5 rounded-md border",
                     activeSubTab === item.id ? "border-amber-500/30 text-amber-500" : "border-white/10 text-white/20"
                   )}>
                     {item.count}
                   </span>
                 )}
               </button>
             ))}
          </div>

          <div className="mt-auto p-6 space-y-4 border-t border-white/5">
             <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-2 mb-3">
                   <Brain size={14} className="text-amber-500" />
                   <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">Neural Advisory</span>
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed font-medium italic">
                   "Corruption flourishes in shadows. My active scan identifies legislative anomalies at 99.4% precision."
                </p>
             </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
           <AnimatePresence mode="wait">
              {activeSubTab === 'alerts' && (
                 <motion.div 
                   key="alerts"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 italic">Critical Integrity Alerts</h3>
                       <button className="flex items-center gap-2 text-[9px] font-black text-white/30 hover:text-white transition-colors uppercase italic">
                          <History size={12} />
                          View Archive
                       </button>
                    </div>

                    {oversight.alerts.map(alert => (
                       <div key={alert.id} className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                          {/* Severity Indicator */}
                          <div className={cn(
                             "absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-[0.2em] italic border-l border-b",
                             alert.severity === 'critical' ? "bg-red-500/20 border-red-500/30 text-red-500" :
                             alert.severity === 'high' ? "bg-orange-500/20 border-orange-500/30 text-orange-500" :
                             "bg-blue-500/20 border-blue-500/30 text-blue-500"
                          )}>
                             {alert.severity} Priority
                          </div>

                          <div className="flex gap-8">
                             <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                <AlertCircle size={32} className={cn(
                                   alert.severity === 'critical' ? "text-red-500" : "text-amber-500"
                                )} />
                             </div>
                             <div className="flex-1 space-y-6">
                                <div>
                                   <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 italic">
                                      Node Detection: {new Date(alert.ts).toLocaleTimeString()} • {alert.type.replace('_', ' ')}
                                   </div>
                                   <h4 className="text-xl font-syne font-black text-white leading-tight">{alert.title}</h4>
                                   <p className="text-sm text-white/40 mt-3 leading-relaxed max-w-2xl">{alert.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                   <div className="space-y-4">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">
                                         <Zap size={14} />
                                         Recommended Next Steps
                                      </div>
                                      <div className="space-y-2">
                                         {alert.nextSteps.map((step, i) => (
                                            <div key={i} className="flex gap-3 text-[11px] text-white/60 font-medium">
                                               <span className="text-emerald-500/40">0{i+1}</span>
                                               {step}
                                            </div>
                                         ))}
                                      </div>
                                   </div>

                                   <div className="space-y-4">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest italic">
                                         <FileText size={14} />
                                         AI Generated Drafts
                                      </div>
                                      <div className="space-y-2">
                                         {alert.drafts.map((draft, i) => (
                                            <button 
                                              key={i}
                                              onClick={() => notify(`Draft "${draft.title}" copied to synaptic clipboard.`)}
                                              className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group/draft"
                                            >
                                               <div className="text-[10px] font-bold text-white/80 uppercase italic truncate">{draft.title}</div>
                                               <div className="text-[9px] text-white/20 mt-1 line-clamp-1 group-hover/draft:text-white/40">{draft.content}</div>
                                            </button>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}

                    {oversight.alerts.length === 0 && (
                       <div className="py-32 text-center space-y-6">
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/10 border border-white/5 animate-pulse">
                             <Zap size={40} />
                          </div>
                          <div className="space-y-2">
                             <div className="text-lg font-black text-white uppercase italic tracking-widest">Horizon Clear</div>
                             <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">No immediate threats identified in the current buffer cycle.</p>
                          </div>
                       </div>
                    )}
                 </motion.div>
              )}

              {activeSubTab === 'bills' && (
                 <motion.div 
                   key="bills"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                 >
                    <div className="flex items-center justify-between mb-4">
                       <div className="space-y-1">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 italic">Legislative Pulse</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Tracking active congressional movements</p>
                       </div>
                       <button className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-2">
                          <Plus size={14} />
                          Track New Bill
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {oversight.trackedBills.map(bill => (
                          <div key={bill.id} className="glass p-6 rounded-3xl border border-white/5 hover:border-amber-500/20 transition-all group">
                             <div className="flex justify-between items-start mb-6">
                                <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/80 font-mono italic uppercase">
                                   {bill.number}
                                </div>
                                <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 italic uppercase">
                                   {bill.status}
                                </div>
                             </div>
                             
                             <h4 className="text-lg font-syne font-black text-white leading-tight group-hover:text-amber-500 transition-colors">{bill.title}</h4>
                             <p className="text-xs text-white/30 mt-3 leading-relaxed line-clamp-2 italic">{bill.summary}</p>
                             
                             <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Sponsor</span>
                                   <span className="text-[10px] font-medium text-white/60">{bill.sponsor}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Last Update</span>
                                   <span className="text-[10px] font-medium text-white/40 italic">{new Date(bill.lastUpdated).toLocaleDateString()}</span>
                                </div>
                             </div>

                             <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] italic hover:bg-white/10 transition-all text-white/40 hover:text-white">
                                Full Bill Intelligence
                             </button>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}

              {activeSubTab === 'donations' && (
                 <motion.div 
                   key="donations"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                    <div className="flex items-center justify-between mb-4">
                       <div className="space-y-1">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 italic">Integrity Pulse</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Mapping financial influence networks</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       {oversight.trackedDonations.map(donation => (
                          <div key={donation.id} className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                             <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                <Landmark size={24} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                   <div className="text-[10px] font-black text-white/20 uppercase tracking-widest italic truncate">{donation.donor} → {donation.recipient}</div>
                                   <div className="text-xs font-black text-white font-mono">${donation.amount.toLocaleString()}</div>
                                </div>
                                <div className="text-[11px] text-white/60 font-medium italic truncate">{donation.description}</div>
                                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-2">{new Date(donation.ts).toLocaleString()}</div>
                             </div>
                             <button className="p-2 rounded-lg bg-black/40 text-white/20 hover:text-blue-500 transition-colors">
                                <ChevronRight size={16} />
                             </button>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}

              {activeSubTab === 'patents' && (
                 <motion.div 
                   key="patents"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                    <div className="flex items-center justify-between mb-4">
                       <div className="space-y-1">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 italic">Neural Intellectual Assets</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Proprietary protocols applied to oversight</p>
                       </div>
                       <button className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                          <Plus size={14} />
                          Ingest Patent
                       </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                       {oversight.patents.map(patent => (
                          <div key={patent.id} className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
                                <Scale size={120} />
                             </div>
                             <div className="flex gap-8 relative z-10">
                                <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                                   <FileCheck size={40} />
                                </div>
                                <div className="flex-1 space-y-4">
                                   <div className="flex items-center gap-3">
                                      <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 italic">#{patent.number}</div>
                                      <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase italic">{patent.status}</div>
                                   </div>
                                   <h4 className="text-xl font-syne font-black text-white tracking-tight">{patent.title}</h4>
                                   <p className="text-sm text-white/40 italic leading-relaxed max-w-2xl">{patent.abstract}</p>
                                   <div className="text-[9px] font-black text-white/20 uppercase tracking-widest italic pt-2">Filed: {patent.filingDate}</div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}

              {activeSubTab === 'config' && (
                 <motion.div 
                   key="config"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="max-w-2xl bg-[#08080a] p-10 rounded-3xl border border-white/5 space-y-12 shadow-2xl"
                 >
                    <div className="space-y-4">
                       <h3 className="text-xl font-syne font-black text-white italic tracking-tight">Oversight Automation Engine</h3>
                       <p className="text-sm text-white/40 leading-relaxed font-medium">Configure the duration and intensity of the autonomous neural oversight cycles.</p>
                    </div>

                    <div className="space-y-8">
                       <div className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/5">
                          <div>
                             <div className="text-[10px] font-black text-white/80 uppercase tracking-widest italic mb-1">Autonomous Cycle Mode</div>
                             <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Automatic scan every 24 hours</p>
                          </div>
                          <button 
                            onClick={() => updateState(s => ({ ...s, houseOversight: { ...s.houseOversight, dailyCheckConfig: { ...s.houseOversight.dailyCheckConfig, active: !s.houseOversight.dailyCheckConfig.active }}}))}
                            className={cn(
                               "w-12 h-6 rounded-full transition-all relative",
                               oversight.dailyCheckConfig.active ? "bg-emerald-500" : "bg-white/10"
                            )}>
                             <div className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-lg",
                                oversight.dailyCheckConfig.active ? "right-1" : "left-1"
                             )} />
                          </button>
                       </div>

                       <div className="space-y-6">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block italic">Cycle Duration (Hours)</label>
                          <div className="flex items-center gap-6">
                             <input 
                               type="range" 
                               min="1" 
                               max="12" 
                               value={oversight.dailyCheckConfig.durationHours}
                               onChange={(e) => updateState(s => ({ ...s, houseOversight: { ...s.houseOversight, dailyCheckConfig: { ...s.houseOversight.dailyCheckConfig, durationHours: parseInt(e.target.value) }}}))}
                               className="flex-1 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500"
                             />
                             <span className="text-lg font-black text-white font-mono w-12 text-center">{oversight.dailyCheckConfig.durationHours}H</span>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block italic">Scan Initialization (UTC)</label>
                          <div className="flex gap-4">
                             {['00:00', '02:00', '04:00', '08:00', '12:00', '18:00'].map(time => (
                                <button 
                                   key={time}
                                   onClick={() => updateState(s => ({ ...s, houseOversight: { ...s.houseOversight, dailyCheckConfig: { ...s.houseOversight.dailyCheckConfig, startTime: time }}}))}
                                   className={cn(
                                      "flex-1 py-3 rounded-xl border font-black font-mono text-[10px] transition-all",
                                      oversight.dailyCheckConfig.startTime === time 
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                                        : "bg-white/5 border-white/5 text-white/20 hover:text-white/60"
                                   )}>
                                   {time}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="pt-8 border-t border-white/5 flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                             <Activity size={24} />
                          </div>
                          <div className="flex-1">
                             <div className="text-[10px] font-black text-white uppercase tracking-widest italic mb-1">System Load Analysis</div>
                             <p className="text-[9px] text-white/40 leading-relaxed font-medium italic">
                                Projected VRAM utilization: <span className="text-emerald-400 font-black">2.4GB</span> • Expected threats processed: <span className="text-white font-black">1.2M/cycle</span>
                             </p>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
