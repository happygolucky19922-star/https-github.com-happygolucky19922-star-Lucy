import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Command, HardDrive, Cpu, ShieldCheck, Monitor } from 'lucide-react';
import { cn } from '../lib/utils';

export default function OnboardingView({ onComplete }: { onComplete: (path: string) => void }) {
  const [step, setStep] = useState(0);
  const [path, setPath] = useState('');

  const steps = [
    { 
      title: "Welcome to Sovereign Intelligence", 
      desc: "Yes Sir is your all-in-one local platform. No cloud, no tracking, just you and your models.",
      icon: Command
    },
    { 
      title: "Define Your Sanctum", 
      desc: "Where should Yes Sir store your models and memories? All data stays local.",
      input: true,
      icon: HardDrive
    },
    { 
      title: "Optimizing for Reality", 
      desc: "Detecting your hardware to recommend the perfect balance of speed and intelligence.",
      hardware: true,
      icon: Cpu
    },
    { 
      title: "Final Protocol", 
      desc: "Initializing system kernels and sovereign encryption. You are now the Architect.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg)] flex items-center justify-center p-6 text-[var(--txt)]">
       <div className="absolute inset-0 bg-[var(--p)]/5 blur-[120px] rounded-full" />
       
       <AnimatePresence mode="wait">
         <div 
           key={step}
           className="relative glass w-full max-w-2xl p-16 rounded-[80px] border-white/10 flex flex-col items-center text-center gap-12 overflow-hidden"
         >
           <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--p)] to-[var(--a)] flex items-center justify-center neon-glow">
             {(() => {
                const Icon = steps[step].icon;
                return <Icon size={40} className="text-white" />;
             })()}
           </div>

           <div className="space-y-4">
              <h1 className="text-4xl font-syne font-black tracking-tighter uppercase italic text-white">{steps[step].title}</h1>
              <p className="text-lg text-[var(--td)] font-medium max-w-md mx-auto">{steps[step].desc}</p>
           </div>

           {steps[step].input && (
             <div className="w-full max-w-md space-y-4">
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="E.g. /Users/Architect/AI_Sanctum"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[var(--p)] transition-all font-mono text-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-[var(--p)]">Path Mandatory</div>
               </div>
               <div className="flex gap-2 justify-center">
                  {['Documents/YesSir', 'Desktop/Sanctum', 'Downloads/Models'].map(p => (
                    <button key={p} onClick={() => setPath(p)} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold uppercase hover:bg-white/10 transition-all text-white/60 hover:text-white">{p}</button>
                  ))}
               </div>
             </div>
           )}

           {steps[step].hardware && (
             <div className="w-full max-w-md grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-2xl border-white/5 bg-white/[0.02] flex flex-col items-center gap-2">
                   <Cpu size={24} className="text-[var(--p)]" />
                   <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Neural Cores</div>
                   <div className="text-sm font-mono font-black text-white">12 Cores</div>
                </div>
                <div className="glass p-4 rounded-2xl border-white/5 bg-white/[0.02] flex flex-col items-center gap-2">
                   <Monitor size={24} className="text-[var(--a)]" />
                   <div className="text-[9px] font-black uppercase tracking-widest text-white/40">GPU Engine</div>
                   <div className="text-sm font-mono font-black text-white">Metal 3</div>
                </div>
             </div>
           )}

           <button 
             disabled={steps[step].input && !path}
             onClick={() => {
                if (step < steps.length - 1) setStep(step + 1);
                else onComplete(path);
             }}
             className="w-full max-w-sm py-5 rounded-[30px] bg-white text-black font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-20 disabled:scale-100"
           >
             {step < steps.length - 1 ? 'Execute Advance' : 'Begin Protocol'}
           </button>

           <div className="flex gap-2 h-1 w-24">
              {steps.map((_, i) => (
                <div key={i} className={cn("flex-1 rounded-full transition-all duration-500", i <= step ? "bg-[var(--p)]" : "bg-white/10")} />
              ))}
           </div>
         </div>
       </AnimatePresence>
    </div>
  );
}
