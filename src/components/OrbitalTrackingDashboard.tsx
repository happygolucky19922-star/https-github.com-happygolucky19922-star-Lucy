import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Satellite, 
  Search, 
  Globe, 
  Loader2,
  Radar,
  Info,
  Maximize2
} from 'lucide-react';
import { cn } from './../lib/utils';

export default function OrbitalTrackingDashboard({ state, updateState, notify }: any) {
  const [satellites, setSatellites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSatId, setSelectedSatId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'vector' | 'satellite'>('vector');
  const [isRotating, setIsRotating] = useState(true);
  
  const [mapLoading, setMapLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<{ [key: string]: maplibregl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    let mapInstance: maplibregl.Map;

    try {
      const isVector = mapMode === 'vector';
      const initialStyle: any = isVector
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'
        : {
            version: 8,
            sources: {
              'satellite': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: 'Google'
              }
            },
            layers: [
              { id: 'background', type: 'background', paint: { 'background-color': '#050505' } },
              { id: 'satellite', type: 'raster', source: 'satellite', minzoom: 0, maxzoom: 22 }
            ]
          };

      mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: initialStyle,
        center: [20, 20],
        zoom: 1.5,
        attributionControl: false,
        antialias: true
      });

      map.current = mapInstance;

      mapInstance.on('style.load', () => {
        try {
          // Globe projection removed permanently to ensure 2D stability
          if ('setFog' in mapInstance) {
            // @ts-ignore
            mapInstance.setFog({
              'range': [0.5, 10],
              'color': '#111',
              'high-color': '#000',
              'horizon-blend': 0.1,
              'space-color': '#000',
              'star-intensity': 0.3
            });
          }
        } catch (e) {
          console.warn("Map style feature error:", e);
        }
      });

      mapInstance.on('load', () => {
        setMapLoading(false);
        setMapReady(true);
        mapInstance.resize();
      });

      mapInstance.on('error', (e) => {
        console.error("MapLibre error:", e);
        setMapLoading(false);
      });

      // Cleanup
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstance) mapInstance.resize();
      });
      resizeObserver.observe(mapContainer.current);

      const timer = setTimeout(() => {
        if (mapInstance) mapInstance.resize();
      }, 500);

      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
        if (mapInstance) mapInstance.remove();
        map.current = null;
      };
    } catch (e) {
      console.error("Map initialization failed:", e);
      setMapLoading(false);
    }
  }, []); // Only runs on mount

  // Watch for mapMode changes
  useEffect(() => {
    if (!map.current || !mapReady) return;
    
    const style = mapMode === 'vector' 
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'
      : {
          version: 8,
          sources: {
            'satellite': {
              type: 'raster',
              tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
              tileSize: 256,
              attribution: 'Google'
            }
          },
          layers: [
            { id: 'background', type: 'background', paint: { 'background-color': '#000000' } },
            { id: 'satellite', type: 'raster', source: 'satellite', minzoom: 0, maxzoom: 22 }
          ]
        };

    map.current.setStyle(style as any);
  }, [mapMode, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    let requestRef: number;
    const rotate = () => {
      if (isRotating && !selectedSatId && map.current && mapReady) {
        try {
          const center = map.current.getCenter();
          center.lng += 0.05;
          map.current.setCenter(center);
        } catch (e) {
          // Ignore center calculation errors if map is being removed
        }
      }
      requestRef = requestAnimationFrame(rotate);
    };

    requestRef = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(requestRef);
  }, [isRotating, selectedSatId, mapReady]);

  useEffect(() => {
    const fetchSats = () => {
      const types = ['Military', 'Weather', 'Communication', 'Research'];
      const operators = ['Starlink', 'GPS', 'Iridium'];
      const mocks = Array.from({ length: 48 }).map((_, i) => ({
        id: `sat-${i}`,
        name: `${operators[i % 3]} NODE-${1000 + i}`,
        noradId: `${30000 + i}`,
        type: types[i % 4],
        operator: operators[i % 3],
        launchDate: '2023-01-01',
        coordinates: { lat: (Math.random() * 160) - 80, lng: (Math.random() * 360) - 180 },
        speed: (Math.random() * 8 + 20).toFixed(1) + 'k km/h'
      }));
      setSatellites(mocks);
      setLoading(false);
    };
    fetchSats();
    const interval = setInterval(fetchSats, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Filter which markers should be visible
    const visibleSats = satellites.filter(s => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(s.type);
      const operatorMatch = selectedOperators.length === 0 || selectedOperators.includes(s.operator);
      const searchMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.noradId.includes(searchQuery);
      return typeMatch && operatorMatch && searchMatch;
    });

    // Remove markers that are no longer visible
    Object.keys(markers.current).forEach(id => {
      if (!visibleSats.find(s => s.id === id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });

    // Update or add markers
    visibleSats.forEach(sat => {
      if (markers.current[sat.id]) {
        // Use setLngLat but with a transition if possible or just update
        markers.current[sat.id].setLngLat([sat.coordinates.lng, sat.coordinates.lat]);
      } else {
        const color = sat.type === 'Military' ? '#ef4444' : sat.type === 'Weather' ? '#3b82f6' : '#a855f7';
        const el = document.createElement('div');
        el.className = 'custom-marker-wrapper';
        el.style.color = color;
        el.innerHTML = `
          <div class="marker-pulse"></div>
          <div class="marker-core" style="background-color: ${color}"></div>
        `;
        
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          panToSat(sat);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([sat.coordinates.lng, sat.coordinates.lat])
          .addTo(map.current!);
        
        markers.current[sat.id] = marker;
      }

      // Highlight selected marker
      if (markers.current[sat.id]) {
        const el = markers.current[sat.id].getElement();
        if (sat.id === selectedSatId) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        }
      }
    });
  }, [satellites, selectedTypes, selectedOperators, searchQuery, selectedSatId, mapReady]);

  const filteredSatellites = useMemo(() => {
    return satellites.filter(s => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(s.type);
      const operatorMatch = selectedOperators.length === 0 || selectedOperators.includes(s.operator);
      const searchMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.noradId.includes(searchQuery);
      return typeMatch && operatorMatch && searchMatch;
    });
  }, [satellites, searchQuery, selectedTypes, selectedOperators]);

  const panToSat = (sat: any) => {
    setSelectedSatId(sat.id);
    if (map.current) {
      map.current.flyTo({
        center: [sat.coordinates.lng, sat.coordinates.lat],
        zoom: 4,
        speed: 1.5
      });
    }
    notify(`LOCKED: ${sat.name}`);
  };

  return (
    <div className="flex h-full bg-black text-white font-mono overflow-hidden">
      <div className="w-1/4 border-r border-white/10 p-6 flex flex-col gap-6 bg-[#050505] z-10 transition-all">
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
        <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
           <div className="space-y-3">
              <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Satellite Type</h3>
              <div className="flex flex-wrap gap-1">
                 {['Military', 'Weather', 'Communication', 'Research'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
                      className={cn("px-3 py-1.5 rounded text-[9px] uppercase border transition-colors", selectedTypes.includes(type) ? "bg-[var(--p)]/20 border-[var(--p)]/50 text-[var(--p)]" : "border-white/5 bg-white/5 text-white/40 hover:text-white/60")}
                    >
                       {type}
                    </button>
                 ))}
              </div>
           </div>
           <div className="space-y-3">
              <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Constellation</h3>
              <div className="flex flex-wrap gap-1">
                 {['Starlink', 'GPS', 'Iridium'].map(op => (
                    <button
                      key={op}
                      onClick={() => setSelectedOperators(prev => prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op])}
                      className={cn("px-3 py-1.5 rounded text-[9px] uppercase border transition-colors", selectedOperators.includes(op) ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "border-white/5 bg-white/5 text-white/40 hover:text-white/60")}
                    >
                       {op}
                    </button>
                 ))}
              </div>
           </div>
           
           <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="text-[9px] font-black uppercase opacity-20">Tracked Units</div>
              <div className="space-y-1">
                 {filteredSatellites.map(sat => (
                   <button 
                     key={sat.id}
                     onClick={() => panToSat(sat)}
                     className={cn("w-full text-left p-3 text-[10px] uppercase border transition-all rounded flex justify-between items-center group", selectedSatId === sat.id ? "bg-[var(--p)]/20 border-[var(--p)]/50" : "border-white/5 hover:bg-white/5 hover:border-white/20")}
                   >
                     <span>{sat.name}</span>
                     <span className="opacity-0 group-hover:opacity-100 text-[8px] transition-opacity font-bold">FOCUS</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 relative overflow-hidden group">
           <div ref={mapContainer} className="absolute inset-0 bg-[#080812] z-0 border border-white/5" />
           
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
              <Radar size={200} />
           </div>

           <AnimatePresence>
             {mapLoading && (
               <motion.div 
                 initial={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center gap-4"
               >
                 <div className="relative">
                   <div className="absolute inset-0 animate-ping bg-[var(--p)]/20 rounded-full" />
                   <Globe className="text-[var(--p)] animate-pulse relative" size={48} />
                 </div>
                 <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Orbital Grid</span>
                   <span className="text-[8px] opacity-40 font-mono mt-1">Establishing Secure Downlink...</span>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Vignette and Scanlines */}
           <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-[1]" />
           <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-[1]" />

           {/* Overlays */}
            <div className="absolute top-4 left-4 flex gap-1 z-10">
              <button 
                onClick={() => setMapMode('vector')}
                className={cn("px-2 py-1 text-[8px] uppercase font-bold border transition-colors", mapMode === 'vector' ? "bg-[var(--p)] text-black border-[var(--p)]" : "bg-black/50 text-white/40 border-white/10 hover:text-white")}
              >VECT</button>
              <button 
                onClick={() => setMapMode('satellite')}
                className={cn("px-2 py-1 text-[8px] uppercase font-bold border transition-colors", mapMode === 'satellite' ? "bg-[var(--p)] text-black border-[var(--p)]" : "bg-black/50 text-white/40 border-white/10 hover:text-white")}
              >SAT</button>
              <button 
                onClick={() => setIsRotating(!isRotating)}
                className={cn("px-2 py-1 text-[8px] uppercase font-bold border transition-colors", isRotating ? "bg-emerald-500 text-black border-emerald-500" : "bg-black/50 text-white/40 border-white/10 hover:text-white")}
              >SPIN</button>
           </div>

           <div className="absolute top-4 right-4 flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-sm border border-white/10 z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tighter">System Status: Nominal</span>
                <span className="text-[8px] opacity-40 font-mono">Uptime: 284:12:09</span>
              </div>
           </div>

           {/* Scanner Line */}
           <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
              <motion.div 
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-full h-[1px] bg-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
           </div>

           <div className="absolute bottom-6 left-6 pointer-events-none z-10">
              <AnimatePresence>
                {selectedSatId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl min-w-[240px] pointer-events-auto"
                  >
                    <div className="text-[10px] text-[var(--p)] font-black uppercase mb-2 flex items-center gap-2">
                       <Info size={12} /> Target Identification
                    </div>
                    {satellites.find(s => s.id === selectedSatId) && (
                      <div className="space-y-3">
                        <div>
                          <div className="text-[14px] font-bold tracking-tight">
                            {satellites.find(s => s.id === selectedSatId)?.name}
                          </div>
                          <div className="text-[9px] opacity-40">NORAD ID: {satellites.find(s => s.id === selectedSatId)?.noradId}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px] uppercase">
                          <div className="opacity-40">Operator</div>
                          <div className="text-right">{satellites.find(s => s.id === selectedSatId)?.operator}</div>
                          <div className="opacity-40">Mission</div>
                          <div className="text-right">{satellites.find(s => s.id === selectedSatId)?.type}</div>
                          <div className="opacity-40">Velocity</div>
                          <div className="text-right text-emerald-400 font-mono tracking-tight">{satellites.find(s => s.id === selectedSatId)?.speed}</div>
                          <div className="opacity-40">Lon Lat</div>
                          <div className="text-right font-mono tracking-tight">{satellites.find(s => s.id === selectedSatId)?.coordinates.lng.toFixed(2)}, {satellites.find(s => s.id === selectedSatId)?.coordinates.lat.toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        <div className="h-1/4 border-t border-white/10 bg-[#080808] p-4 overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Active Telemetry Stream</h3>
              <div className="flex gap-4 text-[8px] font-bold opacity-30 uppercase">
                <span>Refreshed: Every 3s</span>
                <span>Active Nodes: {filteredSatellites.length}</span>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar">
             <table className="w-full text-[10px] text-left">
                <thead className="opacity-30 uppercase sticky top-0 bg-[#080808] z-10">
                   <tr>
                      <th className="pb-2">ID/Type</th>
                      <th className="pb-2">NORAD</th>
                      <th className="pb-2">Launch</th>
                      <th className="pb-2 text-right">COORD</th>
                   </tr>
                </thead>
                <tbody className="opacity-80">
                   {filteredSatellites.map(sat => (
                      <tr key={sat.id} className={cn("border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group", selectedSatId === sat.id && "bg-[var(--p)]/10 text-[var(--p)] opacity-100")} onClick={() => panToSat(sat)}>
                         <td className="py-2">
                            <div className="font-bold uppercase flex items-center gap-2">
                              {sat.name}
                              {selectedSatId === sat.id && <motion.div layoutId="active-dot" className="w-1 h-1 bg-[var(--p)] rounded-full" />}
                            </div>
                            <div className="text-[8px] opacity-40">{sat.type} • {sat.operator}</div>
                         </td>
                         <td className="py-2">#{sat.noradId}</td>
                         <td className="py-2 opacity-50">{sat.launchDate}</td>
                         <td className="py-2 text-right font-mono tracking-tight">{sat.coordinates.lat.toFixed(2)}, {sat.coordinates.lng.toFixed(2)}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.4); }
        .maplibregl-ctrl-attrib { display: none; }

        .custom-marker-wrapper {
          width: 12px;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .custom-marker-wrapper.selected {
          transform: scale(2);
          z-index: 100;
        }

        .marker-core {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          z-index: 2;
          border: 1px solid rgba(255,255,255,0.4);
        }

        .marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.4;
          animation: marker-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: 1;
        }

        @keyframes marker-ping {
          75%, 100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        .selected .marker-core {
          box-shadow: 0 0 10px #fff;
          background-color: #fff !important;
        }
      `}</style>
    </div>
  );
}
