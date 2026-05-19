import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  MessageSquare, Target, Swords, Zap, Hammer, 
  FlaskConical, Bot, BookOpen, Activity, Box, 
  Cloud, Terminal, Settings, HelpCircle, Command,
  ChevronLeft, ChevronRight, Star, Flame, Search, 
  Layout, Shield, DownloadCloud, LayoutGrid, Users, ShieldCheck, Satellite, Brain, Database
} from 'lucide-react';
import { AppState } from '../types';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, state, updateState, hwStatus, notify }: any) {
  const [showModelDropdown, setShowModelDropdown] = useState<'primary' | 'secondary' | null>(null);

  const categories = [
    {
      group: 'Core',
      items: [
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'lucy_chat', label: 'Lucy Live', icon: ShieldCheck },
        { id: 'models', label: 'Models & Hub', icon: Bot },
        { id: 'oversight', label: 'House Oversight', icon: Shield },
      ]
    },
    {
      group: 'Game Modes',
      items: [
        { id: 'gauntlet', label: 'Gauntlet Arena', icon: Target },
        { id: 'duel', label: 'VS Duel', icon: Swords },
        { id: 'dream', label: 'Dream Mode', icon: Brain },
      ]
    },
    {
      group: 'Operations',
      items: [
        { id: 'tuning', label: 'Fine Tuning', icon: FlaskConical },
        { id: 'lab', label: 'Model Lab', icon: FlaskConical },
        { id: 'dataforge', label: 'Data Forge', icon: Database },
        { id: 'forge', label: 'App Forge', icon: Hammer },
        { id: 'market-war-room', label: 'Market Room', icon: LayoutGrid },
        { id: 'agents', label: 'Agent Lexicon', icon: Users },
      ]
    },
    {
      group: 'Infrastructure',
      items: [
        { id: 'executive', label: 'Executive Dashboard', icon: Activity },
        { id: 'perf', label: 'Performance', icon: Zap },
        { id: 'memory', label: 'Memory Vault', icon: Box },
        { id: 'infra', label: 'Network Graph', icon: Cloud },
        { id: 'orbital', label: 'Orbital Tracking', icon: Satellite },
        { id: 'terminal', label: 'Terminal', icon: Terminal },
      ]
    },
    {
      group: 'System',
      items: [
        { id: 'achievements', label: 'Achievements', icon: Star },
        { id: 'plugins', label: 'Plugins', icon: Box },
        { id: 'help', label: 'Concierge', icon: HelpCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const primaryModel = state.models.find((m: any) => m.id === state.chatModel) || state.models[0];
  const secondaryModel = state.models.find((m: any) => m.id === state.arenaConfig.battle?.modelB) || state.models[1];

  return (
    <aside className={cn(
      "glass border-r border-[var(--border)] flex flex-col transition-all duration-300 z-[100] h-full shadow-2xl overflow-visible",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-[var(--border)] space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--p)]/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--p)] to-[var(--a)] flex items-center justify-center text-white shadow-[0_0_20px_var(--pg)] shrink-0">
            <Zap size={24} className="fill-current" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="block font-syne font-black text-xs leading-none tracking-widest text-white uppercase italic">LUCY</span>
              <span className="text-[10px] opacity-60 font-bold tracking-tight whitespace-nowrap">Sovereign Neural Interface</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="space-y-4">
             {/* XP / LEVEL */}
             <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <div className="flex items-center gap-2">
                      <Star size={12} className="text-amber-500 fill-current" />
                      <span className="text-[10px] font-black text-white uppercase italic">Level {state.level}</span>
                   </div>
                   <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{state.xp}/3000 XP</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                   <div className="h-full bg-[var(--p)] shadow-[0_0_10px_rgba(var(--p-rgb),0.5)]" style={{ width: `${(state.xp / 3000) * 100}%` }} />
                </div>
             </div>

             {/* STATS */}
             <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-2 flex items-center gap-2">
                   <Flame size={12} className="text-orange-500 animate-pulse" />
                   <span className="text-[10px] font-black text-white italic">{state.curStreak} day streak</span>
                </div>
                <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-2 flex items-center gap-2">
                   <Zap size={12} className="text-amber-400" />
                   <span className="text-[10px] font-black text-white italic">{state.legendaryModels} legendary</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 py-4 space-y-6 overflow-y-auto custom-scrollbar px-3">
        {categories.map((cat) => (
          <div key={cat.group} className="space-y-1">
            {!collapsed && (
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] px-4 mb-3 block italic">
                {cat.group}
              </label>
            )}
            {cat.items.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative",
                  activeTab === item.id ? "bg-[var(--p)]/10 text-white shadow-[0_0_15px_rgba(var(--p-rgb),0.05)] border border-[var(--p)]/20" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={18} className={cn("shrink-0 transition-colors", activeTab === item.id ? "text-[var(--p)]" : "group-hover:text-white")} />
                {!collapsed && (
                  <span className={cn(
                    "font-bold text-[11px] uppercase tracking-[0.1em] italic",
                    activeTab === item.id ? "text-white" : ""
                  )}>
                    {item.label}
                  </span>
                )}
                {activeTab === item.id && !collapsed && (
                  <div className="absolute inset-y-0 right-0 w-1 flex items-center">
                     <div className="h-6 w-full bg-[var(--p)] rounded-l-full shadow-[0_0_10px_var(--p)]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ))}

        {!collapsed && (
           <div className="pt-6 space-y-4">
              <div className="px-4 text-[9px] font-black text-white/30 uppercase tracking-[0.4em] italic mb-3">Model Selection</div>
              
              <div className="space-y-3 px-2">
                 {/* PRIMARY MODEL SELECTION */}
                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest px-2">Primary</label>
                    <div className="relative">
                        <button 
                         onClick={() => setShowModelDropdown(showModelDropdown === 'primary' ? null : 'primary')}
                         className="w-full bg-[var(--surface2)]/40 border border-[var(--border)] rounded-xl p-3 flex items-center justify-between group hover:border-[var(--p)]/50 hover:bg-[var(--p)]/10 transition-all shadow-sm"
                       >
                          <span className="text-[10px] font-black truncate uppercase italic text-white/90">{primaryModel?.name || 'SELECT CORE'}</span>
                          <ChevronRight size={12} className={cn("text-[var(--p)] group-hover:text-white transition-all", showModelDropdown === 'primary' ? 'rotate-[-90deg]' : 'rotate-90')} />
                       </button>
                       <AnimatePresence>
                          {showModelDropdown === 'primary' && (
                             <motion.div 
                               initial={{ opacity: 0, y: 10, scale: 0.95 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 10, scale: 0.95 }}
                               className="absolute bottom-full left-0 w-64 glass bg-[var(--surface)]/90 backdrop-blur-2xl mb-2 rounded-2xl border border-[var(--p)]/30 p-4 z-[200] shadow-[0_10px_40px_var(--pg)] max-h-[300px] overflow-y-auto custom-scrollbar"
                             >
                                <div className="space-y-1">
                                   {state.models.map((m: any) => (
                                      <button 
                                        key={m.id}
                                        onClick={() => {
                                          updateState((s: AppState) => ({ ...s, chatModel: m.id }));
                                          setShowModelDropdown(null);
                                        }}
                                        className={cn(
                                          "w-full text-left p-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between",
                                          state.chatModel === m.id ? "bg-[var(--p)]/20 text-[var(--p)]" : "text-white/40 hover:bg-white/5 hover:text-white"
                                        )}
                                      >
                                         <span className="truncate">{m.name}</span>
                                         <span className="text-[8px] opacity-30 italic">{m.backend}</span>
                                      </button>
                                   ))}
                                </div>
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>

                 {/* SECONDARY MODEL SELECTION */}
                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest px-2">Secondary (VS Mode)</label>
                    <div className="relative">
                       <button 
                         onClick={() => setShowModelDropdown(showModelDropdown === 'secondary' ? null : 'secondary')}
                         className="w-full bg-[var(--surface2)]/40 border border-[var(--border)] rounded-xl p-3 flex items-center justify-between group hover:border-[var(--a)]/50 hover:bg-[var(--a)]/10 transition-all shadow-sm"
                       >
                          <span className="text-[10px] font-black truncate uppercase italic text-white/90">{secondaryModel?.name || 'SELECT CORE'}</span>
                          <ChevronRight size={12} className={cn("text-[var(--a)] group-hover:text-white transition-all", showModelDropdown === 'secondary' ? 'rotate-[-90deg]' : 'rotate-90')} />
                       </button>
                       <AnimatePresence>
                          {showModelDropdown === 'secondary' && (
                             <motion.div 
                               initial={{ opacity: 0, y: 10, scale: 0.95 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 10, scale: 0.95 }}
                               className="absolute bottom-full left-0 w-64 glass bg-[var(--surface)]/90 backdrop-blur-2xl mb-2 rounded-2xl border border-[var(--a)]/30 p-4 z-[200] shadow-[0_10px_40px_rgba(236,72,153,0.2)] max-h-[300px] overflow-y-auto custom-scrollbar"
                             >
                                <div className="space-y-1">
                                   {state.models.map((m: any) => (
                                      <button 
                                        key={m.id}
                                        onClick={() => {
                                          updateState((s: AppState) => ({ ...s, arenaConfig: { ...s.arenaConfig, battle: { ...s.arenaConfig.battle, modelB: m.id }}}));
                                          setShowModelDropdown(null);
                                        }}
                                        className={cn(
                                          "w-full text-left p-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between",
                                          state.arenaConfig.battle?.modelB === m.id ? "bg-blue-500/20 text-blue-400" : "text-white/40 hover:bg-white/5 hover:text-white"
                                        )}
                                      >
                                         <span className="truncate">{m.name}</span>
                                         <span className="text-[8px] opacity-30 italic">{m.backend}</span>
                                      </button>
                                   ))}
                                </div>
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
              </div>

              <div className="px-4 py-4 space-y-4">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] italic">Download Models</span>
                    <DownloadCloud size={14} className="text-white/20 hover:text-white cursor-pointer transition-colors" />
                 </div>
              </div>

              {/* MEMORY VAULT */}
              <div className="px-4 py-4 space-y-6 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="text-[9px] font-black text-[var(--p)] uppercase tracking-[0.4em] italic flex items-center gap-2">
                       <Box size={10} />
                       Memory Vault
                    </div>
                    {state.gauntletHistory.length > 0 && (
                       <button 
                          onClick={() => updateState((s: AppState) => ({ ...s, gauntletHistory: [] }))}
                          className="text-[8px] font-black opacity-20 hover:opacity-100 transition-opacity uppercase"
                       >
                          Purge
                       </button>
                    )}
                 </div>

                 <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {state.gauntletHistory.length === 0 ? (
                       <div className="text-center py-8 space-y-2 opacity-20">
                          <Activity size={24} className="mx-auto" />
                          <div className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Vault Sealed.<br/>No historical traces.</div>
                       </div>
                    ) : (
                       [...state.gauntletHistory].reverse().map((entry: any, i: number) => (
                          <div 
                             key={`${entry.testId}-${entry.result.ts}-${i}`}
                             className="glass p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:border-[var(--p)]/20 transition-all group"
                          >
                             <div className="flex justify-between items-start mb-2">
                                <div className="text-[9px] font-black text-white/60 truncate max-w-[120px] uppercase italic">
                                   {state.models.find((m: any) => m.id === entry.modelId)?.name || 'Unknown'}
                                </div>
                                <div className={cn(
                                   "text-[8px] font-black px-1.5 py-0.5 rounded-full border",
                                   entry.result.score >= 70 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-red-400 border-red-500/20 bg-red-500/5"
                                )}>
                                   {entry.result.score}%
                                </div>
                             </div>
                             <div className="text-[8px] font-bold text-white/30 truncate uppercase mb-2">
                                {entry.testId} • {new Date(entry.result.ts).toLocaleTimeString()}
                             </div>
                             <div className="text-[7px] font-medium text-white/20 italic line-clamp-1 group-hover:line-clamp-none transition-all">
                                {entry.result.reason}
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           </div>
        )}
      </nav>

      {/* FOOTER STATUS */}
      <div className="p-6 border-t border-white/5 bg-black/20">
          {!collapsed ? (
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_var(--emerald-500)]" />
               <div className="overflow-hidden">
                  <div className="text-[10px] font-black text-white uppercase italic tracking-widest">Offline</div>
                  <div className="text-[8px] font-bold text-white/30 uppercase tracking-[0.1em]">Zero Telemetry</div>
               </div>
            </div>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mx-auto shadow-[0_0_8px_var(--emerald-500)]" />
          )}
      </div>

      {/* COLLAPSE BUTTON OVERRIDE */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[50%] -translate-y-1/2 w-6 h-6 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/40 shadow-xl hover:text-white transition-colors z-50 overflow-visible"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <style>{`
         :root {
            --p-rgb: 139, 92, 246;
         }
      `}</style>
    </aside>
  );
}
