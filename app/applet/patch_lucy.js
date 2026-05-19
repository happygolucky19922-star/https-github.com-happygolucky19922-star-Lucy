const fs = require('fs');
let c = fs.readFileSync('src/components/LucyChatView.tsx', 'utf8');

c = c.replace(
  "import { \n  ShieldCheck, Send, Mic, Video, Image as ImageIcon, Sparkles, ",
  "import { GoogleGenAI } from '@google/genai';\nimport { \n  ShieldCheck, Send, Mic, Video, Image as ImageIcon, Sparkles, "
);

c = c.replace(
  "const [isInCall, setIsInCall] = useState(false);",
  "const [isInCall, setIsInCall] = useState(false);\n  const [selectedMedia, setSelectedMedia] = useState<{url: string, mimeType: string, isVideo: boolean} | null>(null);\n  const fileInputRef = useRef<HTMLInputElement>(null);"
);

c = c.replace(
`  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsTyping(true);
    
    // Simulate generation
    await new Promise(r => setTimeout(r, 1500));
    
    let reply = "I understand. Processing within behavioral constraints...";
    if (userMsg.toLowerCase().includes('video')) reply = "[Generating video stream interface...] Initializing neural video rendering for you now. Target: Gen-3 Connector active.";
    else if (userMsg.toLowerCase().includes('pic') || userMsg.toLowerCase().includes('image')) reply = "[Generating image payload...] Drawing from my visual datasets to create that for you.";
    
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setIsTyping(false);
  };`,
`  const handleSend = async () => {
    if (!input.trim() && !selectedMedia) return;
    const userMsg = input.trim();
    setInput('');
    const mediaToSent = selectedMedia;
    setSelectedMedia(null);
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg, media: mediaToSent }]);
    setIsTyping(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
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

      const stream = await ai.models.generateContentStream({
          model: 'gemini-3-flash-preview',
          contents: historyContents,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
          const text = (chunk as any).text || '';
          fullResponse += text;
          setMessages(prev => {
             const nw = [...prev];
             nw[nw.length - 1] = { ...nw[nw.length - 1], content: fullResponse };
             return nw;
          });
      }
    } catch (e: any) {
      console.error(e);
      notify('Error communicating with Lucy: ' + (e.message || 'Unknown error'));
      setMessages(prev => {
         const nw = [...prev];
         if(!nw[nw.length - 1].content) {
            nw[nw.length - 1] = { ...nw[nw.length - 1], content: 'Error communicating with Lucy.' };
         }
         return nw;
      });
    }
    
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
  };`
);

c = c.replace(
  "{m.content}",
  `{m.media && (
                  <div className="mb-2">
                    {m.media.isVideo ? (
                      <video src={m.media.url} controls className="max-w-[200px] rounded-lg" />
                    ) : (
                      <img src={m.media.url} alt="upload" className="max-w-[200px] rounded-lg" />
                    )}
                  </div>
                )}
                {m.content}`
);

c = c.replace(
`<button className="p-4 text-white/40 hover:text-white transition-colors">
                <Plus size={20} />
              </button>`,
`<input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
              {selectedMedia ? (
                 <div className="p-2 relative flex items-end">
                    {selectedMedia.isVideo ? (
                      <video src={selectedMedia.url} className="w-10 h-10 rounded object-cover border border-white/20" />
                    ) : (
                      <img src={selectedMedia.url} className="w-10 h-10 rounded object-cover border border-white/20" />
                    )}
                    <button onClick={() => setSelectedMedia(null)} className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] text-white">x</button>
                 </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="p-4 text-white/40 hover:text-white transition-colors">
                  <Plus size={20} />
                </button>
              )}`
);

fs.writeFileSync('src/components/LucyChatView.tsx', c);
