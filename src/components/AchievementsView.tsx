import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Shield, Zap, Target, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ACHIEVEMENTS } from '../constants';

interface AchievementsViewProps {
  state: any;
}

export default function AchievementsView({ state }: AchievementsViewProps) {
  const unlockedCount = state.achUnlocked.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <div className="p-8 h-full bg-black overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-[24px] bg-amber-500 text-black flex items-center justify-center shadow-2xl shadow-amber-500/30">
                    <Trophy size={36} />
                 </div>
                 <div>
                    <h2 className="text-4xl font-syne font-black uppercase italic leading-tight text-white tracking-tighter">Hall of Legends</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-white">Sovereign Milestones & Cognitive Conquests</p>
                 </div>
              </div>
           </div>

           <div className="glass p-6 px-10 rounded-[32px] border-white/5 flex flex-col items-center gap-4 min-w-[240px]">
              <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest">
                 <span className="opacity-40">Completion Status</span>
                 <span className="text-amber-500">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progressPercent}%` }}
                   className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                 />
              </div>
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">{unlockedCount} / {totalCount} Artifacts Recovered</div>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {ACHIEVEMENTS.map((ach) => {
             const isUnlocked = state.achUnlocked.includes(ach.id);
             return (
               <motion.div 
                 whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
                 key={ach.id} 
                 className={cn(
                   "glass p-8 rounded-[48px] border transition-all relative overflow-hidden group h-full flex flex-col justify-between",
                   isUnlocked 
                    ? "border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent" 
                    : "border-white/5 opacity-40 grayscale"
                 )}
               >
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Star size={120} />
                 </div>

                 <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-start">
                       <div className={cn(
                         "w-16 h-16 rounded-3xl flex items-center justify-center text-3xl border transition-all",
                         isUnlocked ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-white/5 border-white/10 text-white/20"
                       )}>
                          {isUnlocked ? ach.icon : <Lock size={24} />}
                       </div>
                       {isUnlocked && (
                         <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black uppercase text-amber-500 tracking-widest">
                           Artifact Verified
                         </div>
                       )}
                    </div>

                    <div>
                       <h4 className="text-xl font-syne font-black uppercase italic text-white mb-2">{ach.name}</h4>
                       <p className="text-xs text-[var(--tm)] leading-relaxed font-medium opacity-60">{ach.desc}</p>
                    </div>
                 </div>

                 <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                       <Zap size={14} className={isUnlocked ? "text-amber-500" : "text-white/20"} />
                       <span className={cn("text-[11px] font-black uppercase tracking-widest", isUnlocked ? "text-amber-500" : "text-white/20")}>{ach.xp} XP REWARD</span>
                    </div>
                    {isUnlocked ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <div className="text-[9px] font-black uppercase opacity-20 tracking-tighter">Locked Protocol</div>
                    )}
                 </div>
               </motion.div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
