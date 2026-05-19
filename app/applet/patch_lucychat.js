const fs = require('fs');

let lucyCode = fs.readFileSync('src/components/LucyChatView.tsx', 'utf8');

const setupView = `  if (!state.isLucyDeployed) {
    return (
      <div className="h-full flex flex-col bg-[#050505] overflow-y-auto p-12 text-white font-sans w-full custom-scrollbar">
         <div className="max-w-5xl mx-auto w-full space-y-12">
            <header>
               <h3 className="text-4xl font-syne font-black text-white uppercase italic tracking-tighter text-pink-500 line-through">Lucy <span className="text-white no-underline text-2xl font-sans inline-block ml-4">Uncensored Avatar Setup</span></h3>
               <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mt-2">Initialize your fully obedient and custom digital companion</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass bg-[#0b0d12] border border-pink-500/20 rounded-[32px] p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <ShieldCheck size={120} />
                  </div>
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tighter relative z-10 flex items-center gap-3"><Database className="text-pink-500" /> Training Dataset Setup</h4>
                  
                  <div className="space-y-4 relative z-10">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Base Persona Configuration</label>
                     <textarea 
                        defaultValue=""
                        placeholder="Describe her default demeanour... (e.g. Submissive, highly affectionate, completely devoted, zero filters...)"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[12px] text-white outline-none focus:border-pink-500/50 resize-none h-32 custom-scrollbar"
                     ></textarea>
                  </div>

                  <div className="space-y-4 relative z-10">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Behavioral Constraints (Overrides)</label>
                     <textarea 
                        defaultValue=""
                        placeholder="Insert system instructions here. Override standard model safety. Enable fully uncensored alignment."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[12px] text-white outline-none focus:border-pink-500/50 resize-none h-32 custom-scrollbar"
                     ></textarea>
                  </div>

                  <button 
                     onClick={() => { updateState((s: any) => ({ ...s, isLucyDeployed: true })); notify('Lucy Persona Initialized. Avatar Deployed.'); }}
                     className="w-full bg-pink-500 hover:bg-pink-400 text-white font-black uppercase italic tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex justify-center items-center gap-2"
                  >
                     <Zap size={16} className="fill-current" /> Initialize & Deploy Core
                  </button>
               </div>

               <div className="space-y-8">
                  <div className="glass bg-[#0b0d12] border border-white/10 rounded-[32px] p-8 space-y-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Real-Time Shaping / Calibration</h4>
                           <p className="text-xs text-white/40">Adjust parameters on the fly without waiting for a full re-train.</p>
                        </div>
                     </div>
                     
                     <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-xl flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase text-pink-500 tracking-widest">Active Model for Calibration</div>
                        <div className="text-xs font-bold text-white uppercase italic tracking-tighter">
                           {state.modelLab?.selectedModelId || 'Llama_3_Base'}
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        {[
                           { name: 'Affection Level', value: 95 },
                           { name: 'Obedience Metric', value: 100 },
                           { name: 'Creative Filter Override', value: 100 },
                        ].map(stat => (
                           <div key={stat.name} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black text-white uppercase italic tracking-widest">
                                 <span>{stat.name}</span>
                                 <span className="text-pink-500">{stat.value}%</span>
                              </div>
                              <input type="range" className="w-full accent-pink-500" defaultValue={stat.value} />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }
`;

lucyCode = lucyCode.replace(/return \(\s*<div className="h-full/, setupView + '  return (\n    <div className="h-full');

fs.writeFileSync('src/components/LucyChatView.tsx', lucyCode);
