import React from 'react';
import { HelpCircle, FileText, Send, MessageSquareText, Search } from 'lucide-react';

export default function ConciergeView() {
  return (
    <div className="h-full bg-black p-20 flex flex-col items-center justify-center overflow-hidden">
       <div className="max-w-4xl w-full flex flex-col items-center gap-16 text-center">
          <div className="space-y-6">
             <div className="w-24 h-24 rounded-[40px] bg-[var(--p)] text-white flex items-center justify-center mx-auto shadow-2xl shadow-[var(--p)]/20 animate-bounce transition-all duration-1000">
                <HelpCircle size={48} />
             </div>
             <div className="space-y-2">
                <h2 className="text-6xl font-syne font-black uppercase italic tracking-tighter text-white">Concierge</h2>
                <p className="text-xl font-medium text-white/30 uppercase tracking-[0.3em]">Operational Support & Protocol Documentation</p>
             </div>
          </div>

          <div className="w-full relative">
             <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none opacity-20">
                <Search size={24} className="text-white" />
             </div>
             <input type="text" placeholder="Search operational protocols, model parameters, or API reference..." className="w-full bg-white/5 border border-white/10 rounded-[40px] pl-16 pr-8 py-8 text-xl font-bold outline-none focus:border-[var(--p)] transition-all text-white placeholder:text-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
             <div className="glass p-10 rounded-[60px] border-white/5 space-y-6 hover:translate-y-[-8px] transition-all cursor-pointer group hover:bg-white/5">
                <FileText size={32} className="text-[var(--p)] mx-auto group-hover:scale-110 transition-transform" />
                <div>
                   <h4 className="text-lg font-black uppercase italic text-white tracking-tight">Manual</h4>
                   <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-2">Zero-Leak Philosophy</p>
                </div>
             </div>
             <div className="glass p-10 rounded-[60px] border-white/5 space-y-6 hover:translate-y-[-8px] transition-all cursor-pointer group hover:bg-white/5">
                <MessageSquareText size={32} className="text-[var(--a)] mx-auto group-hover:scale-110 transition-transform" />
                <div>
                   <h4 className="text-lg font-black uppercase italic text-white tracking-tight">Community</h4>
                   <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-2">Yes Sir Discord</p>
                </div>
             </div>
             <div className="glass p-10 rounded-[60px] border-white/5 space-y-6 hover:translate-y-[-8px] transition-all cursor-pointer group hover:bg-white/5">
                <Send size={32} className="text-white mx-auto group-hover:scale-110 transition-transform" />
                <div>
                   <h4 className="text-lg font-black uppercase italic text-white tracking-tight">Feedback</h4>
                   <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-2">Direct Channel</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
