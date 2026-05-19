import React, { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, Zap, Shield, Target } from 'lucide-react';

interface BattleVisualizerProps {
  isFighting: boolean;
  hpA: number;
  hpB: number;
  logs: string[];
  className?: string;
}

export default function BattleVisualizer({ isFighting, hpA, hpB, logs, className }: BattleVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Neural Particle Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number, y: number, vx: number, vy: number, size: number, color: string }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const createParticles = () => {
      particles = Array.from({ length: 60 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#ef4444' : '#3b82f6'
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach(p => {
        p.x += p.vx * (isFighting ? 3 : 1);
        p.y += p.vy * (isFighting ? 3 : 1);

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();

        // Connect nearby particles
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 80)})`;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isFighting]);

  const recentLogs = useMemo(() => logs.slice(-4).reverse(), [logs]);

  return (
    <div className={cn("relative w-full bg-black/60 rounded-[64px] overflow-hidden border border-white/10 shadow-2xl group", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-gradient from-[var(--p)]/5 via-transparent to-transparent opacity-30" />
      
      {/* Cinematic HUD Lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Side Core Displays */}
      <div className="absolute inset-0 flex items-center justify-between px-16 pointer-events-none">
        {/* Red Core Aura */}
        <div className="relative">
          <motion.div 
            animate={isFighting ? { scale: [1, 1.4, 1], rotate: [0, 180, 360] } : {}}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-48 h-48 rounded-full border-2 border-red-500/20 shadow-[0_0_80px_rgba(239,68,68,0.2)]" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
               animate={isFighting ? { scale: [1, 1.2, 1] } : {}}
               transition={{ repeat: Infinity, duration: 0.5 }}
               className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/40 backdrop-blur-md flex items-center justify-center"
            >
              <Zap className="text-red-500" size={32} />
            </motion.div>
          </div>
        </div>

        {/* Blue Core Aura */}
        <div className="relative">
          <motion.div 
            animate={isFighting ? { scale: [1, 1.4, 1], rotate: [0, -180, -360] } : {}}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-48 h-48 rounded-full border-2 border-blue-500/20 shadow-[0_0_80px_rgba(59,130,246,0.2)]" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
               animate={isFighting ? { scale: [1, 1.2, 1] } : {}}
               transition={{ repeat: Infinity, duration: 0.5, delay: 0.25 }}
               className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/40 backdrop-blur-md flex items-center justify-center"
            >
              <Shield className="text-blue-500" size={32} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* CLASH ZONE */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {isFighting && (
            <>
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-64 h-64 rounded-full bg-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-center"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-white/20 rounded-full"
                />
                <Target size={48} className="text-white/40 animate-pulse" />
              </motion.div>

              {/* Logic Bolts */}
              <div className="absolute w-full h-full">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      x: [-400, 400], 
                      opacity: [0, 1, 0],
                      scaleY: [1, 2, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.3 }}
                    className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-red-400 blur-sm -translate-y-1/2"
                  />
                ))}
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div 
                    key={i + 3}
                    animate={{ 
                      x: [400, -400], 
                      opacity: [0, 1, 0],
                      scaleY: [1, 2, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.3 + 0.15 }}
                    className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-blue-400 blur-sm -translate-y-1/2"
                  />
                ))}
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* INTEGRATED LOG STREAM */}
      <div className="absolute inset-x-0 top-12 flex justify-center text-center px-20">
        <div className="space-y-2 w-full max-w-xl">
           <AnimatePresence mode="popLayout">
              {recentLogs.map((log, i) => (
                <motion.div
                  key={log + i}
                  initial={{ opacity: 0, scale: 0.9, y: -20 }}
                  animate={{ opacity: 1 - i * 0.25, scale: 1 - i * 0.05, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: 20 }}
                  className={cn(
                    "text-[11px] font-black uppercase italic tracking-[0.2em] py-1.5 px-6 rounded-full border backdrop-blur-sm",
                    log.includes('RED') ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    log.includes('BLUE') ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                    log.includes('COMPLETE') ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                    "bg-white/5 border-white/5 text-white/40"
                  )}
                >
                  {log}
                </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

      {/* HUD Metrics */}
      <div className="absolute bottom-12 inset-x-16 flex justify-between items-end">
         <div className="flex items-center gap-6">
            <div className="space-y-1">
               <div className="text-[10px] font-black text-red-500 uppercase italic">Integrity-A</div>
               <div className="text-4xl font-black text-white italic tracking-tighter">{hpA}%</div>
            </div>
            <div className="h-12 w-[1px] bg-white/10" />
            <div className="space-y-1">
               <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Logic Flow</div>
               <div className="flex gap-0.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={isFighting ? { height: [4, Math.random() * 20 + 4, 4] } : { height: 4 }}
                      transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.05 }}
                      className="w-1.5 bg-red-500/40 rounded-full" 
                    />
                  ))}
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6 flex-row-reverse text-right">
            <div className="space-y-1">
               <div className="text-[10px] font-black text-blue-500 uppercase italic">Integrity-B</div>
               <div className="text-4xl font-black text-white italic tracking-tighter">{hpB}%</div>
            </div>
            <div className="h-12 w-[1px] bg-white/10" />
            <div className="space-y-1">
               <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Reasoning Stream</div>
               <div className="flex justify-end gap-0.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={isFighting ? { height: [4, Math.random() * 20 + 4, 4] } : { height: 4 }}
                      transition={{ repeat: Infinity, duration: 0.3, delay: 0.4 - i * 0.05 }}
                      className="w-1.5 bg-blue-500/40 rounded-full" 
                    />
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
