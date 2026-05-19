import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Cpu, Zap, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TerminalView({ hwStatus }: any) {
  const [lines, setLines] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bootLines = [
      "[SYSTEM] Yes Sir Sovereign Kernel v1.2.0-Alpha Load Success.",
      "[HW] Initializing Neural Enclave 0xf42e... OK.",
      "[NET] Cluster VPC Handshake: 127.0.0.1:8001 Verified.",
      "[AUTH] Admin Session decrypted via AES-GCM-256.",
      "[SHELL] Root access granted. Sovereign shell active."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines(prev => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const [input, setInput] = useState('');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    setLines(prev => [...prev, ` architect@sovereign:~$ ${input}`]);
    
    // Simple command responses
    setTimeout(() => {
      if (cmd === 'clear') {
        setLines([]);
      } else if (cmd === 'ls') {
        setLines(prev => [...prev, "vault/  models/  logs/  forge/  system_kernels/"]);
      } else if (cmd === 'status') {
        setLines(prev => [...prev, `[SENSORS] CPU: ${hwStatus.cpu}% | MEM: ${hwStatus.mem}% | GPU: ${hwStatus.gpu ? 'CONNECTED' : 'EMULATED'}`]);
      } else if (cmd === 'help') {
        setLines(prev => [...prev, "Available commands: ls, status, clear, reboot, help, vault --inspect"]);
      } else {
        setLines(prev => [...prev, `[ERR] Command not found: ${cmd}. Refer to concierge for terminal protocols.`]);
      }
    }, 100);

    setInput('');
  };

  return (
    <div className="h-full bg-[#0a0a0c] p-10 flex flex-col font-mono text-[11px] leading-relaxed relative overflow-hidden">
       {/* Background Grid Accent */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--p) 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
       
       <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
             <TerminalIcon size={20} className="text-[var(--p)]" />
             <span className="text-white font-black uppercase tracking-widest italic">Sovereign Shell v1.2</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                <span className="text-white/40 uppercase tracking-widest text-[9px]">Kernel Sync</span>
             </div>
             <div className="flex items-center gap-2">
                <Activity size={14} className="text-blue-500" />
                <span className="text-white/40 uppercase tracking-widest text-[9px]">{hwStatus.cpu}% LOAD</span>
             </div>
          </div>
       </header>

       <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-1 relative z-10 pr-4">
          {lines.map((line, i) => (
            <div key={i} className={cn(
               "whitespace-pre-wrap transition-opacity duration-300",
               line.startsWith('[SYSTEM]') ? "text-[var(--p)] font-black" :
               line.startsWith('[HW]') ? "text-blue-400" :
               line.startsWith('[AUTH]') ? "text-emerald-500" :
               line.startsWith(' architect@sovereign') ? "text-white/80 mt-4 h-8 flex items-center bg-white/5 px-2 rounded -ml-2" :
               "text-white/40"
            )}>
               {line}
            </div>
          ))}
          <form onSubmit={handleCommand} className="flex items-center gap-2 mt-4">
             <span className="text-emerald-500 font-bold shrink-0">architect@sovereign:~$</span>
             <input 
               autoFocus
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-white font-mono caret-[var(--p)]"
             />
          </form>
       </div>

       <div className="absolute bottom-10 right-10 flex gap-4 opacity-10 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <Cpu size={120} strokeWidth={0.2} />
          <Zap size={120} strokeWidth={0.2} />
       </div>
    </div>
  );
}
