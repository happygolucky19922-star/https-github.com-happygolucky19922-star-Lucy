import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface Props {
  state: AppState;
}

export default function OutputStream({ state }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const logs = state.appBuilder.outputStream;
  const [displayedLogs, setDisplayedLogs] = React.useState<typeof logs>([]);
  const lastProcessedRef = useRef(0);

  useEffect(() => {
    if (logs.length > lastProcessedRef.current) {
      const newLogs = logs.slice(lastProcessedRef.current);
      lastProcessedRef.current = logs.length;
      
      let i = 0;
      const interval = setInterval(() => {
        if (i < newLogs.length) {
          setDisplayedLogs(prev => [...prev, newLogs[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 150); // Speed of streaming

      return () => clearInterval(interval);
    }
  }, [logs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  if (logs.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 px-1">
        <Terminal size={14} className="text-[var(--p)]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Engagement Stream</span>
      </div>

      <div className="bg-black/30 rounded-2xl border border-white/5 overflow-hidden flex flex-col max-h-[300px]">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 font-mono text-[9px] leading-relaxed space-y-3 custom-scrollbar"
          >
            {displayedLogs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3 group"
              >
                <span className="opacity-10 shrink-0 select-none text-[8px] mt-0.5">{new Date(log.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {log.type === 'system' ? <Cpu size={10} className="text-blue-500/40" /> :
                     log.type === 'success' ? <CheckCircle size={10} className="text-emerald-500/40" /> :
                     log.type === 'error' ? <AlertTriangle size={10} className="text-red-500/40" /> :
                     <Info size={10} className="text-white/10" />}
                  </div>
                  <span className={cn(
                    "font-medium",
                    log.type === 'system' ? "text-blue-400/80" :
                    log.type === 'success' ? "text-emerald-400/80" :
                    log.type === 'error' ? "text-red-400 font-bold" :
                    "text-white/40"
                  )}>{log.msg}</span>
                </div>
              </motion.div>
            ))}
            {state.appBuilder.isBuilding && (
              <div className="flex gap-3 pt-2">
                <div className="w-1 h-1 rounded-full bg-[var(--p)] animate-pulse mt-1.5" />
                <span className="text-[8px] text-[var(--p)]/60 font-black uppercase italic tracking-widest animate-pulse">Flux Active...</span>
              </div>
            )}
          </div>
      </div>
    </motion.div>
  );
}
