import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Satellite, 
  Search, 
  Globe, 
  Loader2,
  Radar
} from 'lucide-react';
import { cn } from './../lib/utils';

export default function OrbitalTrackingDashboard({ state, updateState, notify }: any) {
  const [satellites, setSatellites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSatId, setSelectedSatId] = useState<string | null>(null);
  const [mapViewport, setMapViewport] = useState({ lat: 0, lng: 0, zoom: 1 });

  useEffect(() => {
    const fetchSats = () => {
      const mocks = Array.from({ length: 12 }).map((_, i) => ({
        id: `sat-${i}`,
        name: `SCAN-NODE-${1000 + i}`,
        noradId: `${30000 + i}`,
        coordinates: { lat: (Math.random() * 180) - 90, lng: (Math.random() * 360) - 180 }
      }));
      setSatellites(mocks);
      setLoading(false);
    };
    fetchSats();
    const interval = setInterval(fetchSats, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredSatellites = useMemo(() => {
    return satellites.filter(s => s.name.includes(searchQuery) || s.noradId.includes(searchQuery));
  }, [satellites, searchQuery]);

  const panToSat = (sat: any) => {
    setSelectedSatId(sat.id);
    setMapViewport({ lat: sat.coordinates.lat, lng: sat.coordinates.lng, zoom: 2 });
    notify(`LOCKED: ${sat.name}`);
  };

  return (
    <div className="flex h-full bg-black text-white font-mono overflow-hidden">
      <div className="w-1/4 border-r border-white/10 p-6 flex flex-col gap-6 bg-[#050505]">
        <div className="flex items-center gap-3">
          <Satellite className="text-[var(--p)]" />
          <h2 className="text-sm font-black uppercase tracking-widest">Orbital C2</h2>
        </div>
        <input 
          type="text"
          placeholder="SEARCH ID..."
          className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-xs outline-none focus:border-[var(--p)]"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto space-y-1">
           {filteredSatellites.map(sat => (
             <button 
               key={sat.id}
               onClick={() => panToSat(sat)}
               className={cn("w-full text-left p-3 text-[10px] uppercase border border-white/5 rounded", selectedSatId === sat.id ? "bg-[var(--p)]/20 border-[var(--p)]/50" : "hover:bg-white/5")}
             >
               {sat.name} [#{sat.noradId}]
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
           <motion.div 
             animate={{ scale: mapViewport.zoom, x: -mapViewport.lng * 2, y: mapViewport.lat * 2 }}
             className="w-[800px] h-[400px] border border-white/10 rounded-full flex items-center justify-center opacity-20"
           >
              <Globe size={300} />
           </motion.div>
           <div className="absolute inset-0">
              {filteredSatellites.map(sat => (
                <motion.div
                  key={sat.id}
                  className="absolute w-2 h-2 rounded-full bg-[var(--p)]"
                  style={{
                    left: `${((sat.coordinates.lng + 180) / 360) * 100}%`,
                    top: `${((90 - sat.coordinates.lat) / 180) * 100}%`,
                  }}
                  animate={{ scale: selectedSatId === sat.id ? 2 : 1, boxShadow: selectedSatId === sat.id ? '0 0 10px #fff' : 'none' }}
                />
              ))}
           </div>
           <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10">
              <Radar size={12} className="animate-spin text-[var(--p)]" />
              <span className="text-[10px] font-black uppercase">Scanning...</span>
           </div>
        </div>

        <div className="h-1/3 border-t border-white/10 bg-[#080808] p-4 overflow-y-auto">
           <table className="w-full text-[10px] text-left">
              <thead className="opacity-30 uppercase">
                 <tr>
                    <th className="pb-2">ID</th>
                    <th className="pb-2">NORAD</th>
                    <th className="pb-2 text-right">COORD</th>
                 </tr>
              </thead>
              <tbody className="opacity-80">
                 {filteredSatellites.map(sat => (
                    <tr key={sat.id} className="border-b border-white/5">
                       <td className="py-2">{sat.name}</td>
                       <td className="py-2">#{sat.noradId}</td>
                       <td className="py-2 text-right">{sat.coordinates.lat.toFixed(2)}, {sat.coordinates.lng.toFixed(2)}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
