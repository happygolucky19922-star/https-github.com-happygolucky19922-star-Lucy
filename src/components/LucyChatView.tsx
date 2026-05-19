import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { PatentEngine } from '../lib/patents';
import { 
  ShieldCheck, Send, Mic, Video, Image as ImageIcon, Sparkles, 
  Settings, Bot, Aperture, Plus, Zap, Heart, Camera, Plug, CheckCircle2,
  Phone, Video as VideoCall, Database, MessageSquare, Github, Lock, Fingerprint
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function LucyChatView({ state, updateState, notify }: any) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: 'Connection established. Base persona loaded. How can I assist you today?' }
  ]);
  const [activeConnectors, setActiveConnectors] = useState<string[]>(['Memory Vault']);
  const [showConnectors, setShowConnectors] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [channelModal, setChannelModal] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{url: string, mimeType: string, isVideo: boolean} | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [patentMode, setPatentMode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedMedia) return;
    const userMsg = input.trim();
    setInput('');
    const mediaToSent = selectedMedia;
    setSelectedMedia(null);
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg, media: mediaToSent }]);
    setIsTyping(true);
    
    const sendWithRetry = async (retryCount = 0): Promise<void> => {
      try {
        
        const parts: any[] = [];
        if (userMsg) parts.push({ text: userMsg });
        if (mediaToSent) {
            const match = mediaToSent.url.match(/^data:(.*);base64,(.*)$/);
            if (match) {
               parts.push({
                   inlineData: {
                       mimeType: match[1],
                       data: match[2]
                   }
               });
            }
        }

        const historyContents = messages.slice(1).map(m => {
            const partList: any[] = [];
            if (m.content) partList.push({text: m.content});
            if (m.media) {
               const mm = m.media.url.match(/^data:(.*);base64,(.*)$/);
               if (mm) partList.push({inlineData: {mimeType: mm[1], data: mm[2]}});
            }
            return { role: m.role === 'user' ? 'user' : 'model', parts: partList };
        });
        historyContents.push({ role: 'user', parts });
        
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gemini-3-flash-preview',
            history: historyContents
          })
        });
        const data = await res.json();
        const fullResponse = data.text || "No response";
        setMessages(prev => {
           const nw = [...prev];
           nw[nw.length - 1] = { ...nw[nw.length - 1], content: fullResponse };
           return nw;
        });

        // Apply Patent Synthesis if active
        if (patentMode) {
          setIsSynthesizing(true);
          await new Promise(r => setTimeout(r, 1000));
          const hardenedResponse = patentMode === 'quant' 
            ? PatentEngine.applyNonLinearQuant(fullResponse, 0.8)
            : PatentEngine.distillKnowledge(fullResponse, "Technical Synthesis Engine");
          
          setMessages(prev => {
            const nw = [...prev];
            nw[nw.length - 1] = { 
              ...nw[nw.length - 1], 
              content: hardenedResponse + `\n\n[SYNERGY_OPTIMIZED: ${patentMode === 'quant' ? 'US 12,100,185 B2' : 'US 11,651,211'}]` 
            };
            return nw;
          });
          setIsSynthesizing(false);
        }

      } catch (e: any) {
        if (retryCount < 2) {
          notify(`Retrying neural connection... (Attempt ${retryCount + 1})`);
          await new Promise(r => setTimeout(r, 2000));
          return sendWithRetry(retryCount + 1);
        }
        console.error(e);
        notify('Error from model provider: ' + (e.message || 'Unknown error'));
        setMessages(prev => {
           const nw = [...prev];
           if(!nw[nw.length - 1].content) {
              nw[nw.length - 1] = { ...nw[nw.length - 1], content: 'Fatal Error: Neural connection timed out. Please verify your API key in settings.' };
           }
           return nw;
        });
      }
    };

    await sendWithRetry();
    setIsTyping(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        if(ev.target) {
            setSelectedMedia({
                url: ev.target.result as string,
                mimeType: file.type,
                isVideo: file.type.startsWith('video/')
            });
        }
    };
    reader.readAsDataURL(file);
  };

  const toggleConnector = (c: string) => {
    if (['Telegram', 'WhatsApp', 'Discord'].includes(c) && !activeConnectors.includes(c)) {
       setChannelModal(c);
       return;
    }
    
    if (activeConnectors.includes(c)) {
      setActiveConnectors(prev => prev.filter(x => x !== c));
      notify(`${c} detached.`);
    } else {
      setActiveConnectors(prev => [...prev, c]);
      notify(`${c} initialized and attached.`, 'success');
    }
  };

  return (
    <div className="h-full flex bg-[#050505] overflow-hidden text-white font-sans w-full relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full border-r border-white/5">
        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between glass z-10 sticky top-0">
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--p)]/20 border border-[var(--p)]/50 flex items-center justify-center animate-pulse overflow-hidden">
                {state.isLucyDeployed ? (
                   <img src="https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=150&h=150" alt="Lucy Avatar" className="w-full h-full object-cover" />
                ) : (
                   <ShieldCheck size={24} className="text-[var(--p)]" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-syne font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                Lucy Live <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[var(--p)]/10 text-[var(--p)] text-[9px] uppercase tracking-widest border border-[var(--p)]/20">Uncensored Core</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40 hidden md:block">Model Base: {state.modelLab?.selectedModelId || 'Default_Llama_3'}</div>
                <div className="w-1 h-1 rounded-full bg-white/20 hidden md:block" />
                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--p)]">Active Synapses: 1.2B</div>
                <div className="w-1 h-1 rounded-full bg-white/20 hidden md:block" />
                <div className="flex items-center gap-1">
                   <button 
                    onClick={() => setPatentMode(patentMode === 'quant' ? null : 'quant')}
                    className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all flex items-center gap-1", 
                      patentMode === 'quant' ? "bg-red-500 text-white" : "bg-white/5 text-white/40 hover:text-white"
                    )}
                   >
                     <Lock size={8} /> US 12,100,185
                   </button>
                   <button 
                    onClick={() => setPatentMode(patentMode === 'distill' ? null : 'distill')}
                    className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all flex items-center gap-1", 
                      patentMode === 'distill' ? "bg-green-500 text-white" : "bg-white/5 text-white/40 hover:text-white"
                    )}
                   >
                     <Fingerprint size={8} /> US 11,651,211
                   </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-3 flex-1 ml-4 py-2">
             {/* Linked Connected Avatar Overlaps */}
             <div className="hidden 2xl:flex -space-x-2 mr-2">
                {activeConnectors.filter(c => ['Telegram', 'WhatsApp', 'Discord'].includes(c)).map(c => (
                   <div key={c} className="w-8 h-8 rounded-full bg-[var(--p)]/20 border-2 border-[#050505] text-[var(--p)] flex items-center justify-center relative group">
                      {c === 'Telegram' && <Send size={12} />}
                      {c === 'WhatsApp' && <Phone size={12} />}
                      {c === 'Discord' && <MessageSquare size={12} />}
                      <span className="absolute -bottom-8 bg-white text-black text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        {c} Linked
                      </span>
                   </div>
                ))}
             </div>

             {/* Visible Channel Bridge Buttons - Hidden on very small screens */}
             <div className="hidden xl:flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                {['Telegram', 'WhatsApp', 'Discord'].map(c => {
                   const isActive = activeConnectors.includes(c);
                   return (
                     <button
                        key={c}
                        onClick={() => toggleConnector(c)}
                        className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap",
                          isActive ? "bg-[var(--p)] text-white shadow-lg shadow-[var(--p)]/20" : "text-white/40 hover:text-white bg-white/5 hover:bg-white/10"
                        )}
                     >
                        {c === 'Telegram' && <Send size={12} />}
                        {c === 'WhatsApp' && <Phone size={12} />}
                        {c === 'Discord' && <MessageSquare size={12} />}
                        {c}
                     </button>
                   );
                })}
             </div>

             {/* Models & Tuning Toolset */}
             <div className="flex items-center gap-1.5 xl:border-r border-white/10 xl:pr-2 xl:mr-1">
                 <div className="hidden md:flex bg-white/5 border border-white/10 rounded-lg p-0.5 overflow-hidden">
                     <select onChange={(e) => notify('Model source selected: ' + e.target.value)} className="bg-transparent border-none text-[9px] font-black uppercase tracking-widest text-white/80 outline-none w-[90px] cursor-pointer appearance-none px-2 py-1.5">
                         <option value="llama3" className="bg-[#050505]">Model: Local</option>
                         <option value="hf" className="bg-[#050505]">Import HF...</option>
                         <option value="usb" className="bg-[#050505]">USB / Disk...</option>
                         <option value="github" className="bg-[#050505]">Clone Git...</option>
                     </select>
                     <div className="w-[1px] bg-white/10 h-full mx-0.5" />
                     <select onChange={(e) => notify('Dataset selected: ' + e.target.value)} className="bg-transparent border-none text-[9px] font-black uppercase tracking-widest text-white/80 outline-none w-[80px] cursor-pointer appearance-none px-2 py-1.5">
                         <option value="lucy_v4" className="bg-[#050505]">Data: v4</option>
                         <option value="hf_data" className="bg-[#050505]">HF Data</option>
                         <option value="usb_data" className="bg-[#050505]">USB Data</option>
                     </select>
                 </div>
                 <button onClick={() => notify('Executing Pre-Tune Analysis...')} className="hidden sm:flex px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-white items-center gap-1.5 whitespace-nowrap">
                     <Settings size={12} /> Pre
                 </button>
                 <button onClick={() => notify('Initiating Fine-Tune...')} className="px-3 py-1.5 bg-[var(--p)] text-white hover:bg-[var(--p)]/90 border border-[var(--p)]/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-[0_0_15px_var(--p)] whitespace-nowrap">
                     <Zap size={12} /> Tune
                 </button>
             </div>
             
             {/* Nav Toggles */}
             <div className="flex items-center gap-1.5 ml-auto shrink-0">
                 <button 
                    onClick={() => setIsInCall(!isInCall)}
                    className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all border shrink-0", isInCall ? "bg-red-500 text-white border-red-500" : "bg-white/5 text-white border-white/5 hover:bg-white/10")}
                 >
                    {isInCall ? <Phone size={14} className="fill-current" /> : <VideoCall size={14} />}
                 </button>
                 <button onClick={() => setShowConnectors(!showConnectors)} className="px-3 py-1.5 h-8 sm:h-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full lg:rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-white/60 hover:text-white whitespace-nowrap flex items-center gap-1.5">
                    <Plug size={14} className="lg:hidden" />
                    <span className="hidden lg:inline">Bridges ({activeConnectors.length})</span>
                 </button>
             </div>
          </div>
        </header>

        {/* Channel Modal Overlay */}
        <AnimatePresence>
           {channelModal && (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="absolute inset-0 z-30 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-8"
              >
                 <div className="max-w-md w-full glass bg-[#0b0d12] border border-white/10 rounded-[32px] p-8 space-y-6 relative">
                    <button onClick={() => setChannelModal(null)} className="absolute top-6 right-6 text-white/40 hover:text-white">x</button>
                    
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-[var(--p)]/20 flex items-center justify-center border border-[var(--p)]/30 text-[var(--p)]">
                          {channelModal === 'Telegram' && <Send size={32} />}
                          {channelModal === 'WhatsApp' && <Phone size={32} />}
                          {channelModal === 'Discord' && <MessageSquare size={32} />}
                       </div>
                       <div>
                          <h3 className="text-2xl font-syne font-black uppercase italic tracking-tighter text-white">{channelModal} Bridge</h3>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">External Comms Sync</p>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-xs text-white/60 leading-relaxed">
                          To connect Lucy to your active {channelModal} account, paste your API token or webhook URL below. Lucy will process incoming messages and reply autonomously.
                       </p>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">API Token / Webhook</label>
                          <input type="password" placeholder="Enter secure token or webhook url..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-[var(--p)]/50" />
                       </div>
                    </div>
                    
                    <button 
                       onClick={() => {
                          setActiveConnectors(prev => [...prev, channelModal]);
                          notify(`${channelModal} securely connected. Listening for events.`, "success");
                          setChannelModal(null);
                       }}
                       className="w-full bg-[var(--p)] hover:bg-[var(--p)]/80 text-white font-black uppercase italic tracking-widest py-4 rounded-xl shadow-[0_0_20px_var(--p)] shadow-opacity-20 transition-all flex justify-center items-center gap-2"
                    >
                       <Plug size={16} /> Establish Connection
                    </button>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>

        {/* Call Overlay */}
        <AnimatePresence>
           {isInCall && (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="absolute inset-0 z-20 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-4"
              >
                 <div className="w-48 h-48 rounded-full border-4 border-[var(--p)]/50 shadow-[0_0_100px_var(--p)] flex items-center justify-center relative mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--p)] border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                    <Aperture size={64} className="text-[var(--p)]" />
                 </div>
                 <h3 className="text-2xl font-syne font-black uppercase italic tracking-tighter text-white text-center">Live Neural Synthesis</h3>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2 mb-12 text-center">Transmitting Voice & Video data</p>
                 
                 <div className="flex gap-6">
                    <button className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"><Mic size={24} /></button>
                    <button className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"><ImageIcon size={24} /></button>
                    <button onClick={() => setIsInCall(false)} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 transition-all text-white shadow-lg shadow-red-500/20"><Phone size={24} className="fill-current" /></button>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>

        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
          {messages.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={cn("flex gap-4 max-w-3xl", m.role === 'user' ? "ml-auto flex-row-reverse" : "")}
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", m.role === 'user' ? "bg-white/10 text-white" : "bg-[var(--p)]/20 text-[var(--p)] border border-[var(--p)]/30")}>
                {m.role === 'user' ? <Sparkles size={14} /> : <ShieldCheck size={14} />}
              </div>
              <div className={cn("p-4 rounded-2xl text-[13px] leading-relaxed break-words", m.role === 'user' ? "bg-[var(--p)]/20 border border-[var(--p)]/30 text-white" : "bg-white/5 border border-white/5 text-white/80")}>
                {m.media && (
                  <div className="mb-2">
                    {m.media.isVideo ? (
                      <video src={m.media.url} controls className="max-w-[200px] rounded-lg border border-white/10" />
                    ) : (
                      <img src={m.media.url} alt="upload" className="max-w-[200px] rounded-lg border border-white/10" />
                    )}
                  </div>
                )}
                {m.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-[var(--p)]/20 text-[var(--p)] border border-[var(--p)]/30 flex items-center justify-center shrink-0">
                <Aperture size={14} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white/50 text-[13px] flex gap-2 items-center">
                <span className="w-1.5 h-1.5 bg-[var(--p)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--p)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--p)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-10 pointer-events-none">
          <div className="max-w-4xl mx-auto relative group pointer-events-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--p)]/20 to-[var(--p)]/20 rounded-[28px] blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative glass bg-[#0b0d12]/80 border border-white/10 rounded-[24px] p-2 flex items-end gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
              {selectedMedia ? (
                 <div className="p-2 relative flex items-end shrink-0">
                    {selectedMedia.isVideo ? (
                      <video src={selectedMedia.url} className="w-10 h-10 rounded object-cover border border-white/20" />
                    ) : (
                      <img src={selectedMedia.url} className="w-10 h-10 rounded object-cover border border-white/20" />
                    )}
                    <button onClick={() => setSelectedMedia(null)} className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] text-white">x</button>
                 </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="p-4 text-white/40 hover:text-white transition-colors shrink-0">
                  <Plus size={20} />
                </button>
              )}
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Speak with Lucy..."
                className="w-full bg-transparent border-none text-white outline-none resize-none py-4 text-[13px] placeholder:text-white/20 custom-scrollbar"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '160px' }}
              />
              <div className="flex items-center gap-1 p-2 shrink-0">
                <button className="p-3 text-white/40 hover:text-white transition-colors bg-white/5 rounded-xl hover:bg-white/10 hidden sm:block">
                  <Mic size={18} />
                </button>
                <button onClick={handleSend} className="p-3 bg-[var(--p)] hover:bg-[var(--p)]/90 text-white transition-all rounded-xl shadow-lg shadow-[var(--p)]/20">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connectors Sidebar */}
      <AnimatePresence>
        {showConnectors && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/5 glass bg-[#0b0d12]/50 flex flex-col shrink-0 absolute right-0 top-0 h-full z-40 lg:relative lg:h-auto"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-syne font-black uppercase italic tracking-tighter text-white">Connectors</h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Tools & Context</p>
               </div>
               <button onClick={() => setShowConnectors(false)} className="lg:hidden text-white/40 hover:text-white">x</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-10 xl:pb-4">
               {[
                  { name: 'Stable Diffusion Core', desc: 'Real-time image synthesis via Prompt-to-Image pipeline', icon: ImageIcon, id: 'Image Synth' },
                  { name: 'OmniAudio Engine', desc: 'Text-to-Speech & Speech-to-Text streaming', icon: Mic, id: 'Audio Engine' },
                  { name: 'Video Renderer Gen-3', desc: 'Generate 4k video clips from temporal latent models', icon: Video, id: 'Video Core' },
                  { name: 'Memory Vault Db', desc: 'Long-term semantic vector database retention', icon: Database, id: 'Memory Vault' },
                  { name: 'Web API Sockets', desc: 'Live external HTTP/WebSocket access', icon: Zap, id: 'Web Sockets' },
                  { name: 'Telegram Bridge', desc: 'Real-time sync to Telegram bot channel', icon: Send, id: 'Telegram' },
                  { name: 'WhatsApp Link', desc: 'Enterprise WhatsApp business API connection', icon: Phone, id: 'WhatsApp' },
                  { name: 'Discord Relay', desc: 'Automated Discord webhook and bot integration', icon: MessageSquare, id: 'Discord' },
               ].map(c => {
                  const active = activeConnectors.includes(c.id);
                  return (
                     <div key={c.id} className={cn("p-4 flex flex-col rounded-2xl border transition-all cursor-pointer group", active ? "bg-[var(--p)]/10 border-[var(--p)]/30" : "bg-white/5 border-white/5 hover:bg-white/10")} onClick={() => toggleConnector(c.id)}>
                        <div className="flex items-center justify-between mb-3">
                           <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", active ? "bg-[var(--p)]/20 text-[var(--p)]" : "bg-white/10 text-white/40 group-hover:text-white")}>
                              <c.icon size={14} />
                           </div>
                           <div className={cn("px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest", active ? "bg-[var(--p)] border-[var(--p)] text-white" : "bg-black border-white/10 text-white/30")}>
                              {active ? 'ACTIVE' : 'IDLE'}
                           </div>
                        </div>
                        <h4 className={cn("text-[11px] font-black uppercase tracking-wider mb-1", active ? "text-white" : "text-white/60")}>{c.name}</h4>
                        <p className="text-[10px] font-medium text-white/40 leading-relaxed">{c.desc}</p>
                     </div>
                  );
               })}

               <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Add New Connector
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

