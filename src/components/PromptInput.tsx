import { 
  Send, 
  Zap, 
  Terminal, 
  Activity, 
  Mic, 
  Paperclip, 
  Image as ImageIcon, 
  Globe, 
  Code,
  Search,
  Box,
  Rocket,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  onExecute: () => void | Promise<void>;
  prompt: string;
  setPrompt: (v: string) => void;
  isBuilding: boolean;
  activeMode: AppState['appBuilder']['activeMode'];
}

export default function PromptInput({ state, updateState, onExecute, prompt, setPrompt, isBuilding, activeMode }: Props) {
   const MAX_CHARS = 2000;
   const charCount = state.appBuilder.prompt.length;
   const isOverLimit = charCount > MAX_CHARS;

   const modes = [
      { id: 'Build', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
      { id: 'Debug', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' },
      { id: 'Research', icon: Search, color: 'text-blue-400', bg: 'bg-blue-400/10' },
      { id: 'Deploy', icon: Rocket, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
      { id: 'Analyze', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-400/10' },
      { id: 'Automation', icon: Terminal, color: 'text-orange-400', bg: 'bg-orange-400/10' },
      { id: 'Growth', icon: TrendingUp, color: 'text-lime-400', bg: 'bg-lime-400/10' },
      { id: 'Business', icon: Briefcase, color: 'text-pink-400', bg: 'bg-pink-400/10' },
   ] as const;

   return (
    <div className="w-full">
      <div className="relative group p-[1px] rounded-[33px] transition-all duration-500 overflow-hidden">
         {/* DYNAMIC NEON GLOW BACKDROP */}
         <div className={cn(
           "absolute inset-0 transition-opacity duration-1000 opacity-0 group-focus-within:opacity-100",
           "bg-gradient-to-r from-blue-500/20 via-[var(--p)]/20 to-emerald-500/20 blur-xl"
         )} />

         <div className={cn(
            "relative glass bg-[var(--surface-low)] border rounded-[32px] p-3 flex flex-col gap-3 transition-all duration-500",
            isOverLimit ? "border-red-500/50" : "border-white/5 group-focus-within:border-white/10 group-focus-within:bg-[var(--surface)]"
         )}>
            {/* INTEGRATED MODE SELECTORS */}
            <div className="flex items-center gap-2 px-2 overflow-x-auto no-scrollbar">
               {[
                 { id: 'Build', icon: Zap },
                 { id: 'Debug', icon: ShieldAlert },
                 { id: 'Research', icon: Search },
                 { id: 'Deploy', icon: Rocket },
                 { id: 'Analyze', icon: BarChart3 },
               ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => updateState(s => ({ ...s, appBuilder: { ...s.appBuilder, activeMode: mode.id as any } }))}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                      state.appBuilder.activeMode === mode.id ? "bg-[var(--txt-high)] text-[var(--bg)] shadow-lg" : "text-[var(--txt-low)] hover:text-[var(--txt-mid)]"
                    )}
                  >
                    <mode.icon size={10} />
                    {mode.id}
                  </button>
               ))}
               <div className="w-[1px] h-3 bg-white/10 mx-2" />
               <button
                  onClick={() => updateState(s => ({ ...s, appBuilder: { ...s.appBuilder, mode: s.appBuilder.mode === 'Plan' ? 'Execute' : 'Plan' } }))}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border",
                    state.appBuilder.mode === 'Plan' 
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30" 
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  )}
               >
                 {state.appBuilder.mode === 'Plan' ? 'Draft Mode' : 'Auto Execute'}
               </button>
               <div className="flex-1" />
               <div className="hidden lg:flex items-center gap-2 text-[8px] font-black text-[var(--txt-low)] opacity-20 uppercase tracking-[0.4em] px-2 italic">
                  Autonomous_Level_4
               </div>
            </div>

            <div className="flex-1 w-full relative group">
                <textarea 
                   value={state.appBuilder.prompt}
                   onChange={(e) => updateState(s => ({ ...s, appBuilder: { ...s.appBuilder, prompt: e.target.value } }))}
                   onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey && !isOverLimit && !isBuilding) { e.preventDefault(); onExecute(); } }}
                   placeholder={`Describe your ${state.appBuilder.activeMode} requirements...`}
                  className="w-full bg-transparent border-none outline-none resize-none px-4 pt-1 pb-1 text-[13px] font-medium text-[var(--txt-high)] placeholder:text-[var(--txt-low)] custom-scrollbar leading-relaxed min-h-[80px] max-h-[300px]"
                  rows={2}
               />
               
               <div className={cn(
                  "absolute bottom-0 right-4 text-[8px] font-black tracking-[0.2em] transition-opacity",
                  charCount > MAX_CHARS * 0.8 ? "opacity-100" : "opacity-0 group-hover:opacity-20",
                  isOverLimit ? "text-red-500" : "text-[var(--txt-low)]"
               )}>
                  {charCount}/{MAX_CHARS}
               </div>
            </div>

            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-1">
                  {[
                    { icon: Paperclip, label: 'File' },
                    { icon: ImageIcon, label: 'Image' },
                    { icon: Mic, label: 'Voice' },
                    { icon: Globe, label: 'URL' },
                    { icon: Code, label: 'Paste' },
                  ].map(tool => (
                    <button key={tool.label} className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--txt-low)] hover:text-[var(--txt-high)] transition-all group relative">
                       <tool.icon size={14} />
                       <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--txt-high)] text-[var(--bg)] text-[7px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {tool.label}
                       </span>
                    </button>
                  ))}
               </div>

               <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end mr-2">
                     <span className="text-[7px] font-black text-[var(--txt-low)] uppercase tracking-widest">Autonomous Level</span>
                     <span className="text-[9px] font-black text-emerald-500 italic">PHASE 4</span>
                  </div>

                  <button 
                     onClick={onExecute}
                     disabled={!state.appBuilder.prompt.trim() || state.appBuilder.isBuilding || isOverLimit}
                     className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-xl disabled:opacity-20 shrink-0",
                        state.appBuilder.isBuilding ? "bg-emerald-500 text-white animate-pulse" : 
                        isOverLimit ? "bg-red-500/20 text-red-500 cursor-not-allowed" :
                        "bg-[var(--txt-high)] text-[var(--bg)] hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_var(--p)]/20"
                     )}
                  >
                     {state.appBuilder.isBuilding ? <Activity size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
               </div>
            </div>
         </div>
      </div>
      
      <div className="flex items-center justify-between px-6">
         <div className="flex items-center gap-4 text-[8px] font-bold uppercase tracking-[0.3em] opacity-10">
            <span>LLM: {state.appBuilder.selectedModel}</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span>Encrypted Tunnel: ACTIVE</span>
         </div>
         <div className="text-[8px] font-black text-[var(--p)] uppercase tracking-[0.2em] italic opacity-40">
            Project: {state.appBuilder.projects[0]?.name || 'NEXUS_CORE'}
         </div>
      </div>
    </div>
  );
}

