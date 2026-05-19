import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RSS_FEEDS, OpenApiService } from '../services/openApiService';
import { Globe, Radio, RefreshCcw, Activity, Shield, Rss, Search, Server } from 'lucide-react';
import { cn } from '../lib/utils';

export default function IntelDashboard() {
  const [activeCategory, setActiveCategory] = useState<string>('Tech');
  const [activeFeed, setActiveFeed] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [intelMode, setIntelMode] = useState<'RSS' | 'API'>('RSS');
  
  const categories = Array.from(new Set(RSS_FEEDS.map(f => f.category)));

  const API_NODES = [
    { id: 'wiki', name: 'Wikipedia Opensearch', desc: 'Search global encyclopedia' },
    { id: 'books', name: 'Open Library', desc: 'Query book metadata' },
    { id: 'user', name: 'Random Person', desc: 'Generate dummy user data' },
    { id: 'space', name: 'Space News', desc: 'Spaceflight intelligence' }
  ];
  const [activeApiNode, setActiveApiNode] = useState(API_NODES[0].id);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    if (intelMode === 'API') {
       fetchApiData();
    }
  }, [activeApiNode, intelMode]);

  const fetchApiData = async (query?: string) => {
     setLoading(true);
     setApiData(null);
     try {
       let data;
       if (activeApiNode === 'wiki') {
          data = await OpenApiService.searchWikipedia(query || 'Artificial Intelligence');
       } else if (activeApiNode === 'books') {
          data = await OpenApiService.searchBooks(query || 'Neuromancer');
       } else if (activeApiNode === 'user') {
          data = await OpenApiService.getRandomUser();
       } else if (activeApiNode === 'space') {
          data = await OpenApiService.getSpaceNews();
       }
       setApiData(data);
     } catch(err) {
       console.error("API error", err);
     } finally {
       setLoading(false);
     }
  };

  useEffect(() => {
    // Select first feed in category when category changes
    const categoryFeeds = RSS_FEEDS.filter(f => f.category === activeCategory);
    if (categoryFeeds.length > 0) {
      setActiveFeed(categoryFeeds[0].id);
    }
  }, [activeCategory]);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!activeFeed) return;
      setLoading(true);
      try {
        const feed = RSS_FEEDS.find(f => f.id === activeFeed);
        if (feed) {
           const items = await OpenApiService.fetchRSS(feed.url);
           setFeedItems(items);
        }
      } catch (err) {
        console.error("Feed fetch failed", err);
        setFeedItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeed();
  }, [activeFeed]);

  const categoryFeeds = RSS_FEEDS.filter(f => f.category === activeCategory);

  const filteredItems = feedItems.filter(item => 
      !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderApiData = () => {
    if (!apiData) return <div className="text-white/20 text-sm font-semibold uppercase tracking-widest text-center mt-20">Awaiting Signal Query...</div>;
    
    if (activeApiNode === 'wiki') {
       // Wikipedia Opensearch format: [query, [titles], [descriptions], [links]]
       if (!Array.isArray(apiData) || apiData.length < 4) return null;
       const titles = apiData[1];
       const descriptions = apiData[2];
       const links = apiData[3];
       return titles.map((title: string, i: number) => (
          <a key={i} href={links[i]} target="_blank" rel="noopener noreferrer" className="block p-5 bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 rounded-2xl transition-all mb-4 group">
             <h4 className="text-sm font-bold text-white/90 group-hover:text-cyan-400 transition-colors mb-2">{title}</h4>
             <p className="text-xs text-white/40 line-clamp-2">{descriptions[i]}</p>
          </a>
       ));
    }
    
    if (activeApiNode === 'books') {
       if (!apiData.docs) return null;
       return apiData.docs.map((book: any, i: number) => (
          <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl mb-4">
             <h4 className="text-sm font-bold text-white/90 mb-1">{book.title}</h4>
             <p className="text-xs text-white/40 mb-2">Author: {book.author_name?.join(', ') || 'Unknown'}</p>
             <div className="text-[10px] font-mono text-cyan-500/50">First Published: {book.first_publish_year}</div>
          </div>
       ));
    }
    
    if (activeApiNode === 'user') {
       if (!apiData.results) return null;
       const user = apiData.results[0];
       return (
          <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
             <img src={user.picture.large} alt="User" className="w-24 h-24 rounded-full border-2 border-cyan-500/30" />
             <div>
                <h4 className="text-xl font-bold text-white mb-1">{user.name.first} {user.name.last}</h4>
                <p className="text-sm text-cyan-400 mb-4">{user.email}</p>
                <div className="text-xs text-white/40 space-y-1 font-mono">
                   <div>Location: {user.location.city}, {user.location.country}</div>
                   <div>Phone: {user.phone}</div>
                   <div>DOB: {new Date(user.dob.date).toLocaleDateString()}</div>
                </div>
             </div>
          </div>
       );
    }
    
    if (activeApiNode === 'space') {
       if (!apiData.results) return null;
       return apiData.results.map((article: any, i: number) => (
          <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-5 bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 rounded-2xl mb-4 group flex gap-4">
             <img src={article.image_url} alt="Article" className="w-24 h-24 object-cover rounded-xl" />
             <div>
                <h4 className="text-sm font-bold text-white/90 group-hover:text-cyan-400 transition-colors mb-2">{article.title}</h4>
                <p className="text-xs text-white/40 line-clamp-2">{article.summary}</p>
                <div className="text-[10px] font-mono text-cyan-500/50 mt-2">{article.news_site}</div>
             </div>
          </a>
       ));
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col p-10 overflow-hidden font-sans">
       <header className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-4">
              <Globe className="text-cyan-400" size={32} /> Central Intelligence
            </h2>
            <div className="flex items-center gap-4 mt-2">
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic flex items-center gap-2">
                  <Radio size={12} className="animate-pulse text-emerald-500" /> Live OSINT Aggregator Network
               </p>
               <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
                  <button 
                     onClick={() => setIntelMode('RSS')}
                     className={cn("px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all", intelMode === 'RSS' ? "bg-cyan-500 text-black" : "text-white/40")}
                  >
                     RSS Streams
                  </button>
                  <button 
                     onClick={() => setIntelMode('API')}
                     className={cn("px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all", intelMode === 'API' ? "bg-purple-500 text-white" : "text-white/40")}
                  >
                     Open APIs
                  </button>
               </div>
            </div>
          </div>
          {intelMode === 'RSS' && (
            <div className="flex bg-black/40 border border-white/10 rounded-2xl overflow-hidden p-1 shadow-lg shadow-black/50">
               {categories.map(cat => (
                  <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeCategory === cat ? "bg-cyan-600 text-white" : "text-white/40 hover:text-white/80"
                     )}
                  >
                     {cat}
                  </button>
               ))}
            </div>
          )}
       </header>

       <div className="flex gap-8 flex-1 min-h-0">
          <div className="w-64 flex flex-col gap-4">
             <div className="flex-1 glass rounded-[2rem] border-white/5 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 mb-2">Available Nodes</h3>
                {intelMode === 'RSS' ? (
                   categoryFeeds.map(feed => (
                      <button
                         key={feed.id}
                         onClick={() => setActiveFeed(feed.id)}
                         className={cn(
                            "p-4 rounded-2xl text-left transition-all border group",
                            activeFeed === feed.id 
                               ? "bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10 text-cyan-400" 
                               : "bg-white/[0.02] border-white/5 text-white/60 hover:border-white/20"
                         )}
                      >
                         <div className="flex items-center gap-3">
                            <Rss size={14} className={cn(activeFeed === feed.id ? "text-cyan-400" : "text-white/20")} />
                            <span className="text-sm font-bold tracking-tight">{feed.name}</span>
                         </div>
                      </button>
                   ))
                ) : (
                   API_NODES.map(node => (
                      <button
                         key={node.id}
                         onClick={() => setActiveApiNode(node.id)}
                         className={cn(
                            "p-4 rounded-2xl text-left transition-all border group",
                            activeApiNode === node.id 
                               ? "bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10 text-purple-400" 
                               : "bg-white/[0.02] border-white/5 text-white/60 hover:border-white/20"
                         )}
                      >
                         <div className="flex items-center gap-3">
                            <Server size={14} className={cn(activeApiNode === node.id ? "text-purple-400" : "text-white/20")} />
                            <div>
                               <span className="text-sm font-bold tracking-tight block">{node.name}</span>
                               <span className="text-[9px] text-white/40 mt-1">{node.desc}</span>
                            </div>
                         </div>
                      </button>
                   ))
                )}
             </div>
             <div className="glass rounded-3xl border-white/5 p-6 space-y-4">
                <Shield className="text-emerald-500 mx-auto" size={24} />
                <p className="text-[9px] text-center font-bold text-emerald-500/70 uppercase tracking-widest leading-relaxed">
                   Data fetched dynamically without trial limitations or dependencies via server proxy.
                </p>
             </div>
          </div>

          <div className="flex-1 flex flex-col bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4 text-white/40">
                   <Activity size={24} className={loading ? "animate-pulse text-cyan-400" : "text-white/20"} />
                   <h3 className="text-lg font-bold">Signal Intercepts</h3>
                </div>
                <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl px-4 py-2">
                   <Search size={14} className="text-white/40" />
                   <input 
                      type="text" 
                      placeholder={intelMode === 'API' ? "Search API..." : "Filter signals..."}
                      className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/20 w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                         if (e.key === 'Enter' && intelMode === 'API') {
                            fetchApiData(searchQuery);
                         }
                      }}
                   />
                </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
                {loading ? (
                   <div className="flex items-center justify-center h-full">
                      <RefreshCcw size={32} className="text-cyan-400 animate-spin" />
                   </div>
                ) : intelMode === 'RSS' ? (
                   filteredItems.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-white/20 text-sm font-semibold uppercase tracking-widest">
                         No signals detected
                      </div>
                   ) : (
                      filteredItems.map((item, idx) => (
                         <motion.a 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-5 bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 rounded-2xl transition-all group"
                         >
                            <h4 className="text-sm font-bold text-white/90 group-hover:text-cyan-400 transition-colors mb-2 leading-snug">
                               {item.title}
                            </h4>
                            {item.description && (
                                <p className="text-xs text-white/40 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description.replace(/<[^>]+>/g, '') }} />
                            )}
                            {item.pubDate && (
                               <div className="mt-4 text-[9px] font-mono text-cyan-500/50 uppercase tracking-widest flex items-center gap-2">
                                  <Clock size={10} /> {new Date(item.pubDate).toLocaleString()}
                               </div>
                            )}
                         </motion.a>
                      ))
                   )
                ) : (
                   renderApiData()
                )}
             </div>
          </div>
       </div>
    </div>
  );
}

import { Clock } from 'lucide-react';
