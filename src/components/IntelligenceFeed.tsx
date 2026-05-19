import React, { useEffect, useState } from 'react';
import { OpenApiService, OpenFeed, RSS_FEEDS } from '../services/openApiService';
import { Globe, Cloud, Zap, Radio, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function IntelligenceFeed() {
  const [news, setNews] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [geo, setGeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // Geo
        const geoData = await OpenApiService.getGeoLocation();
        setGeo(geoData);
        
        if (geoData?.lat && geoData?.lon) {
           const weatherData = await OpenApiService.getLocalWeather(geoData.lat, geoData.lon);
           setWeather(weatherData);
        }

        // Tech News from Hacker News
        const hnFeed = RSS_FEEDS.find(f => f.id === 'hn');
        if (hnFeed) {
           const items = await OpenApiService.fetchRSS(hnFeed.url);
           setNews(items.slice(0, 3)); // show top 3
        }

        setLoading(false);
      } catch (err) {
        console.error("OSINT Feed error", err);
        setLoading(false);
      }
    };

    fetchAll();
    
    // Poll every 5 minutes
    const interval = setInterval(fetchAll, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-24 right-6 w-72 z-20 hidden 2xl:block">
      <div className="glass p-5 rounded-[2rem] border-white/5 bg-gradient-to-br from-black/60 to-black/90 backdrop-blur-xl transition-all flex flex-col shadow-2xl">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between w-full hover:opacity-80 transition-opacity outline-none"
        >
          <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
             <Radio size={12} className="animate-pulse text-cyan-400" />
             Global OSINT Feed
          </h4>
          <div className="flex items-center gap-2">
             <div className="flex gap-1 mr-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
             </div>
             {isCollapsed ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
          </div>
        </button>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              {loading ? (
                 <div className="space-y-3 animate-pulse">
                    <div className="h-16 bg-white/5 rounded-2xl" />
                    <div className="h-24 bg-white/5 rounded-2xl" />
                 </div>
              ) : (
                 <div className="space-y-3">
                    {geo && weather && weather.current_weather && (
                       <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
                          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                             <Cloud size={64} />
                          </div>
                          <p className="text-[9px] font-bold text-white/40 mb-1 uppercase tracking-widest flex items-center gap-1.5">
                             <Globe size={10} className="text-emerald-400" /> Location Context
                          </p>
                          <div className="flex items-end justify-between mt-2">
                             <div>
                                <div className="text-xs font-bold text-white mb-0.5">{geo.city}, {geo.countryCode}</div>
                                <div className="text-[10px] text-white/50">{geo.query} (IP)</div>
                             </div>
                             <div className="text-right">
                                <div className="text-lg font-black text-cyan-400">{weather.current_weather.temperature}°</div>
                                <div className="text-[9px] text-white/40 font-mono">Wind: {weather.current_weather.windspeed}</div>
                             </div>
                          </div>
                       </div>
                    )}

                    {news.length > 0 && (
                       <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <p className="text-[9px] font-bold text-white/40 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                             <Zap size={10} className="text-purple-400" /> Neural Signals (HN)
                          </p>
                          <div className="space-y-3">
                             {news.map((item, idx) => (
                                <a 
                                   key={idx} 
                                   href={item.link} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="block group"
                                >
                                   <div className="text-[10px] font-bold text-white/80 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">
                                      {item.title}
                                   </div>
                                </a>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
