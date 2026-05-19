import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  Zap, 
  Lock, 
  Cpu, 
  BarChart3, 
  Globe, 
  MessageSquare,
  AlertCircle,
  ArrowUpRight,
  Terminal,
  Crosshair,
  Compass,
  LayoutGrid,
  DownloadCloud,
  UploadCloud,
  FileCode,
  Dna,
  X,
  ShieldAlert,
  Globe2,
  TrendingDown,
  Layers,
  MapPin,
  Radar,
  Workflow,
  Coins,
  History,
  Target,
  Settings2,
  Play,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar
} from 'recharts';

const STRATEGY_STATS = [
  { subject: 'Alpha', A: 120, fullMark: 150 },
  { subject: 'Sharpe', A: 98, fullMark: 150 },
  { subject: 'Sortino', A: 86, fullMark: 150 },
  { subject: 'Liquidity', A: 99, fullMark: 150 },
  { subject: 'Stability', A: 85, fullMark: 150 },
  { subject: 'Entropy', A: 65, fullMark: 150 },
];

const CAP_ALLOCATION = [
  { name: 'Layer 1', value: 400, color: '#60a5fa' },
  { name: 'Stable Yield', value: 300, color: '#34d399' },
  { name: 'Emerging', value: 200, color: '#fbbf24' },
  { name: 'Hedge Pool', value: 100, color: '#f87171' },
];
import { cn } from '../lib/utils';

const VAR_DATA = [
  { time: '00:00', value: 2.1, limit: 4.0 },
  { time: '04:00', value: 2.4, limit: 4.0 },
  { time: '08:00', value: 3.8, limit: 4.0 },
  { time: '12:00', value: 3.2, limit: 4.0 },
  { time: '16:00', value: 2.9, limit: 4.0 },
  { time: '20:00', value: 3.1, limit: 4.0 },
  { time: '23:59', value: 2.8, limit: 4.0 },
];

const EXPOSURE_DATA = [
  { name: 'Node_Alpha', exposure: 42, color: '#60a5fa' },
  { name: 'Node_Delta', exposure: 28, color: '#34d399' },
  { name: 'Sovereign_X', exposure: 15, color: '#fbbf24' },
  { name: 'Shadow_Pool', exposure: 12, color: '#f87171' },
  { name: 'Nexus_H', exposure: 8, color: '#a78bfa' },
];

const GEO_RISK = [
  { region: 'N. America', score: 12, status: 'STABLE', color: 'bg-emerald-500/20 text-emerald-400' },
  { region: 'W. Europe', score: 18, status: 'STABLE', color: 'bg-emerald-500/20 text-emerald-400' },
  { region: 'E. Asia', score: 45, status: 'VOLATILE', color: 'bg-amber-500/20 text-amber-500' },
  { region: 'Middle East', score: 68, status: 'CRITICAL', color: 'bg-red-500/20 text-red-500' },
  { region: 'S. America', score: 32, status: 'GUARDED', color: 'bg-blue-500/20 text-blue-400' },
  { region: 'Africa', score: 25, status: 'STABLE', color: 'bg-emerald-500/20 text-emerald-400' },
];

export default function MarketWarRoomView({ state, updateState, notify }: any) {
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [mentorMessages, setMentorMessages] = useState([
    { role: 'assistant', content: "Status: OBSERVING. I've detected a significant liquidity divergence in the EU Nexus corridor. Neural patterns suggest a 82% probability of a volatility spike within next 6 hours." }
  ]);
  const [mentorInput, setMentorInput] = useState('');
  const [strategyParams, setStrategyParams] = useState({
    riskTolerance: 45,
    backtestPeriod: 90,
    signalSensitivity: 72
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveVar, setLiveVar] = useState(2.84);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveVar(prev => {
        const change = (Math.random() - 0.5) * 0.15;
        const newVal = prev + change;
        return Math.max(1.8, Math.min(3.9, newVal));
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);
  
  const [marketData, setMarketData] = useState([
    { id: 'btc', symbol: 'BTC/USD', price: 64281.40, change: 2.4, history: [62000, 63500, 62800, 64100, 63900, 64281] },
    { id: 'eth', symbol: 'ETH/USD', price: 3402.12, change: -1.1, history: [3500, 3450, 3550, 3420, 3480, 3402] },
    { id: 'sol', symbol: 'SOL/USD', price: 145.67, change: 5.8, history: [130, 135, 132, 140, 142, 145] },
    { id: 'link', symbol: 'LINK/USD', price: 18.23, change: 0.5, history: [17.5, 18.1, 17.9, 18.4, 18.0, 18.2] },
    { id: 'dot', symbol: 'DOT/USD', price: 7.45, change: -2.3, history: [7.8, 7.6, 7.7, 7.3, 7.5, 7.4] },
    { id: 'matic', symbol: 'MATIC/USD', price: 0.89, change: 1.2, history: [0.85, 0.87, 0.86, 0.90, 0.88, 0.89] },
    { id: 'arb', symbol: 'ARB/USD', price: 1.12, change: -4.5, history: [1.20, 1.18, 1.15, 1.16, 1.10, 1.12] },
    { id: 'op', symbol: 'OP/USD', price: 2.34, change: 3.1, history: [2.20, 2.25, 2.22, 2.30, 2.32, 2.34] },
  ]);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    notify('Syncing Market Data', 'Establishing neural link with global exchange nodes...');
    
    setTimeout(() => {
      setMarketData(prev => prev.map(item => {
        const change = (Math.random() - 0.5) * 5;
        const newPrice = item.price * (1 + change / 100);
        const newHistory = [...item.history.slice(1), newPrice];
        return {
          ...item,
          price: newPrice,
          change: change,
          history: newHistory
        };
      }));
      setIsRefreshing(false);
      notify('Intelligence Updated', 'Market matrix synchronized successfully.');
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorInput.trim()) return;

    const userMessage = { role: 'user', content: mentorInput };
    setMentorMessages(prev => [...prev, userMessage]);
    setMentorInput('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Analysis complete. The drawdown risk is currently mitigated by the Shadow Pool liquidity lock.",
        "Neural nodes suggest increasing weighting on Node_Delta to capture the mounting arbitrage delta.",
        "Strategic assessment: The current risk tolerance of 45% is optimal for the predicted volatility window.",
        "Warning: Geopolitical factors in E. Asia are trending towards a critical disruption threshold. Maintain defensive posture."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMentorMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
    }, 1000);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    notify('Simulation Initiated', `Running neural backtest with ${strategyParams.riskTolerance}% risk tolerance over ${strategyParams.backtestPeriod} days.`);
    setTimeout(() => {
      setIsSimulating(false);
      notify('Simulation Complete', 'Backtest successfully converged with 14.2% projected Alpha.');
    }, 3000);
  };

  const dynamicStats = React.useMemo(() => {
    const { riskTolerance, backtestPeriod, signalSensitivity } = strategyParams;
    
    // Impact logic
    const alphaBase = 80 + (riskTolerance * 0.7) + (signalSensitivity * 0.3);
    const sharpeBase = 120 - (riskTolerance * 0.4) + (backtestPeriod / 10);
    const sortinoBase = 110 - (riskTolerance * 0.3) + (backtestPeriod / 15);
    const liquidityBase = 140 - (riskTolerance * 0.8);
    const stabilityBase = 130 - (riskTolerance * 0.5) - (signalSensitivity * 0.4);
    const entropyBase = 30 + (signalSensitivity * 1.2);

    return [
      { subject: 'Alpha', A: Math.min(150, alphaBase), fullMark: 150 },
      { subject: 'Sharpe', A: Math.min(150, sharpeBase), fullMark: 150 },
      { subject: 'Sortino', A: Math.min(150, sortinoBase), fullMark: 150 },
      { subject: 'Liquidity', A: Math.min(150, liquidityBase), fullMark: 150 },
      { subject: 'Stability', A: Math.min(150, stabilityBase), fullMark: 150 },
      { subject: 'Entropy', A: Math.min(150, entropyBase), fullMark: 150 },
    ];
  }, [strategyParams]);

  const performanceMetrics = React.useMemo(() => {
    const { riskTolerance, signalSensitivity } = strategyParams;
    
    const sharpe = (3.5 - (riskTolerance * 0.015) + (signalSensitivity * 0.005)).toFixed(2);
    const alpha = (100 + (riskTolerance * 1.2) + (signalSensitivity * 0.5)).toFixed(0);
    const drawdown = (2.1 + (riskTolerance * 0.12) - (signalSensitivity * 0.03)).toFixed(1);
    const sortino = (4.2 - (riskTolerance * 0.01) + (signalSensitivity * 0.008)).toFixed(2);

    return [
      { label: 'Sharpe Ratio', value: sharpe, color: 'text-emerald-400' },
      { label: 'Alpha Score', value: `+${alpha}bp`, color: 'text-purple-400' },
      { label: 'Max Drawdown', value: `-${drawdown}%`, color: 'text-blue-400' },
      { label: 'Sortino', value: sortino, color: 'text-orange-400' },
    ];
  }, [strategyParams]);

  const SIGNALS = [
    { id: 1, type: 'SIGNAL', label: 'BTC/USD', value: '$64,281.40', trend: '+2.4%', status: 'BULLISH' },
    { id: 2, type: 'EVENT', label: 'LIQUIDITY', value: 'HK Corridor', trend: 'PIVOT', status: 'NEUTRAL' },
    { id: 3, type: 'ALERT', label: 'VOLATILITY', value: 'EU Nexus', trend: 'SPIKE', status: 'DANGER' },
    { id: 4, type: 'SIGNAL', label: 'ETH/USD', value: '$3,402.12', trend: '-1.1%', status: 'BEARISH' },
    { id: 5, type: 'NODE', label: 'CALIBRATION', value: 'Alpha-7', trend: 'READY', status: 'SUCCESS' },
    { id: 6, type: 'FLOW', label: 'YIELD', value: '12.4%', trend: '+0.8%', status: 'BULLISH' },
  ];

  const sections = [
    {
      id: 'strategy',
      title: 'Strategy Engine',
      icon: Cpu,
      color: 'text-blue-400',
      desc: 'High-frequency algorithmic strategy generation and backtesting against historical chaos.',
      badge: 'ACTIVE',
      data: [
        { label: 'Active Strategies', value: '1,402', trend: '+12' },
        { label: 'Efficiency Rating', value: 'Alpha-7', trend: 'MAX' }
      ]
    },
    {
      id: 'risk',
      title: 'Risk Command',
      icon: Shield,
      color: 'text-orange-400',
      desc: 'Advanced hedging and Liquidity-at-Risk (LaR) monitoring across all sovereign nodes.',
      badge: 'GUARDED',
      data: [
        { label: 'Exposure Delta', value: '-0.04', trend: 'LOCKED' },
        { label: 'Risk Ceiling', value: '4.2%', trend: 'NOMINAL' }
      ]
    },
    {
      id: 'capital',
      title: 'Capital Engine',
      icon: Zap,
      color: 'text-amber-400',
      desc: 'Dynamic asset allocation and cross-chain capital deployments for maximum yield alpha.',
      badge: 'OPTIMIZED',
      data: [
        { label: 'Capital Utility', value: '94%', trend: '+2%' },
        { label: 'Yield Velocity', value: '12x', trend: '+1.5x' }
      ]
    },
    {
      id: 'evolution',
      title: 'Evolution Engine',
      icon: Dna,
      color: 'text-purple-400',
      desc: 'Self-adjusting model weights based on PnL performance and market state transitions.',
      badge: 'REFINING',
      data: [
        { label: 'Gen Mutation', value: 'v4.2.1', trend: 'AUTO' },
        { label: 'Adaptability', value: 'High', trend: '+0.4' }
      ]
    },
    {
      id: 'battle',
      title: 'Battle Mode',
      icon: Crosshair,
      color: 'text-red-400',
      desc: 'Live adversarial testing of strategy robustness under simulated extreme liquidity dry-outs.',
      badge: 'BATTLE_READY',
      data: [
        { label: 'Stress Index', value: '84/100', trend: 'VOLATILE' },
        { label: 'Survival Rate', value: '99.2%', trend: '+0.1%' }
      ]
    }
  ];

  const handleExportModel = () => {
    notify('Model Export Initiated', 'Compiling weights into encrypted tactical manifest...');
  };

  const handleImportModel = () => {
    notify('Awaiting Artifact', 'Please select a signed model manifest for ingestion.');
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-black/40 backdrop-blur-3xl">
      {/* HEADER */}
      <div className="h-20 border-b border-white/5 flex items-center px-8 justify-between bg-gradient-to-r from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
            <LayoutGrid size={24} className="text-blue-400 relative z-10" />
          </div>
          <div>
            <h1 className="font-syne font-black text-xl uppercase tracking-[0.2em] italic text-white flex items-center gap-3">
              Market War Room
              <div className="px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded text-[9px] tracking-widest text-blue-400 not-italic">ELITE_TIER</div>
            </h1>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] mt-0.5">Sovereign Strategic Intelligence & Execution Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end px-4 py-1 border-r border-white/5">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Global Sentiment</span>
              <span className="text-xs font-syne font-black text-emerald-400 italic tracking-widest">BULLISH_STREAK</span>
           </div>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--p)] rounded-xl font-syne font-black text-[9px] uppercase tracking-widest text-white shadow-lg shadow-[var(--p)]/20 hover:scale-105 transition-all">
             <Zap size={12} className="fill-current" />
             Initiate Alpha Search
           </button>
        </div>
      </div>

      {/* LIVE INTELLIGENCE FEED SECTION */}
      <div className="h-40 border-b border-white/5 bg-black/60 relative overflow-hidden flex flex-col shrink-0">
        <div className="flex items-center justify-between px-10 py-2 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Intelligence Feed</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Neural Link Active</span>
            </div>
          </div>
          
          <button 
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all group",
              isRefreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            <History size={10} className={cn("text-white/40 group-hover:text-white/80 transition-all", isRefreshing && "animate-spin")} />
            <span className="text-[8px] font-bold text-white/40 group-hover:text-white/80 uppercase tracking-widest">Manual Sync</span>
          </button>
        </div>

        <div className="flex-1 flex items-center overflow-x-auto custom-scrollbar px-10 gap-3 py-2 scroll-smooth">
          {marketData.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="min-w-[180px] h-full bg-white/[0.02] border border-white/5 rounded-xl flex flex-col p-2.5 hover:bg-white/[0.04] hover:border-white/10 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between mb-1 relative z-10">
                <span className="text-[9px] font-black text-white italic tracking-wider">{item.symbol}</span>
                <span className={cn(
                  "text-[8px] font-bold px-1.5 py-0.5 rounded",
                  item.change >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
                )}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              </div>

              <div className="text-base font-syne font-black text-white mb-1 tracking-tight relative z-10">
                ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="flex-1 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.history.map((val, i) => ({ value: val, i }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={item.change >= 0 ? '#34d399' : '#f87171'} 
                      strokeWidth={1.5} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ))}

          {/* ADD OFFSET FOR SCROLLING */}
          <div className="min-w-[40px] h-full shrink-0" />
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* MAIN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 cursor-pointer overflow-hidden"
                onClick={() => {
                  if (['risk', 'strategy', 'capital', 'evolution', 'battle'].includes(section.id)) setActiveDetail(section.id);
                  else notify(`Accessing ${section.title} matrix...`);
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("p-3 rounded-xl bg-white/5 border border-white/10", section.color)}>
                    <section.icon size={18} />
                  </div>
                  <div className="text-[8px] font-black tracking-[0.2em] opacity-40 uppercase italic border border-white/10 px-1.5 py-0.5 rounded">
                    {section.badge}
                  </div>
                </div>

                <h3 className="text-base font-syne font-black uppercase tracking-wider text-white mb-2 italic">
                  {section.title}
                </h3>
                <p className="text-[10px] text-white/40 font-medium leading-relaxed mb-4 min-h-[40px]">
                  {section.desc}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                  {section.data.map((d, i) => (
                    <div key={i}>
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{d.label}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white/90 tracking-tight">{d.value}</span>
                        <span className={cn("text-[9px] font-black", d.trend.includes('+') ? 'text-emerald-400' : d.trend.includes('-') ? 'text-red-400' : 'text-blue-400')}>
                          {d.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                  <ArrowUpRight size={18} className="text-white/20" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI MENTOR COMMAND CENTER */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--p)]/10 to-transparent pointer-events-none" />
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-1">
                   <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center relative shadow-2xl shadow-[var(--p)]/20">
                      <MessageSquare size={24} className="text-[var(--p)]" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                   </div>
                </div>
                
                <div className="lg:col-span-11 flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-lg font-syne font-black uppercase italic tracking-widest text-white mb-0.5">Alpha AI Command</h3>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em]">Strategic Insight & Risk Assessment Interface</p>
                     </div>
                     <div className="flex gap-2.5">
                        <button 
                         onClick={() => setMentorMessages([{ role: 'assistant', content: "Memory buffer purged. I am ready to process new strategic queries." }])}
                         className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-white/80 transition-colors"
                        >
                           <History size={12} />
                        </button>
                        <div className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Steady</span>
                        </div>
                     </div>
                   </div>

                   <div className="bg-black/40 border border-white/5 rounded-2xl p-4 h-[180px] overflow-y-auto custom-scrollbar space-y-3 flex flex-col-reverse relative">
                      <div className="space-y-3">
                        {mentorMessages.map((m, i) => (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             className={cn(
                                "flex gap-2.5 max-w-[90%]",
                                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                             )}
                           >
                              <div className={cn(
                                 "w-6 h-6 rounded flex items-center justify-center shrink-0 border",
                                 m.role === 'user' ? "bg-white/5 border-white/10" : "bg-[var(--p)]/20 border-[var(--p)]/40"
                              )}>
                                 {m.role === 'user' ? <Users size={10} className="text-white/40" /> : <Cpu size={10} className="text-[var(--p)]" />}
                              </div>
                              <div className={cn(
                                 "p-2.5 rounded-xl text-[10px] leading-relaxed",
                                 m.role === 'user' ? "bg-white/10 text-white/80 rounded-tr-none" : "bg-white/[0.02] border border-white/5 text-white/60 rounded-tl-none italic"
                              )}>
                                 {m.content}
                              </div>
                           </motion.div>
                        ))}
                      </div>
                      
                      {/* PROMPT SUGGESTIONS */}
                      <div className="sticky bottom-0 left-0 right-0 py-2 bg-gradient-to-t from-black/80 to-transparent flex gap-2 overflow-x-auto no-scrollbar">
                         {[
                           { label: "Analyze Alpha", icon: Target },
                           { label: "Detect Anomaly", icon: AlertCircle },
                           { label: "Predict Pivot", icon: Compass },
                           { label: "Risk Audit", icon: Shield }
                         ].map((chip) => (
                           <button
                             key={chip.label}
                             onClick={() => setMentorInput(prev => prev ? `${prev} ${chip.label}` : chip.label)}
                             className="prompt-chip bg-white/5 border border-white/10 rounded-full py-1.5 px-3 flex items-center gap-1.5 hover:bg-white/10 transition-all shrink-0 group"
                           >
                             <chip.icon size={10} className="text-white/40 group-hover:text-[var(--p)] transition-colors" />
                             <span className="text-[9px] font-black uppercase text-white/40 group-hover:text-white transition-colors">{chip.label}</span>
                           </button>
                         ))}
                      </div>
                   </div>

                   <form onSubmit={handleSendMessage} className="relative">
                      <input 
                        id="market-ai-input"
                        type="text"
                        value={mentorInput}
                        onChange={(e) => setMentorInput(e.target.value)}
                        placeholder="Query strategic alpha or risk assessment..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-6 text-[10px] font-medium text-white placeholder:text-white/20 outline-none focus:border-[var(--p)]/40 focus:bg-white/10 transition-all pr-16"
                      />
                      <button 
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--p)] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[var(--p)]/20 hover:scale-105 active:scale-95 transition-all"
                      >
                         <ArrowUpRight size={16} />
                      </button>
                   </form>
                </div>
             </div>

             <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-6">
                {[
                   { label: 'Market Sentiment', value: 'BULL_BIAS', color: 'text-emerald-400' },
                   { label: 'Liquidity Pressure', value: 'MEDIUM', color: 'text-amber-400' },
                   { label: 'Alpha Opportunity', value: 'HIGH_CONVICTION', color: 'text-red-400' },
                ].map((stat, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{stat.label}:</span>
                      <span className={cn("text-[10px] font-bold tracking-widest italic", stat.color)}>{stat.value}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* MODEL ORCHESTRATION / IMPORT EXPORT */}
             <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-[2.5rem] p-10 overflow-hidden relative">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                           <FileCode size={24} className="text-blue-400" />
                        </div>
                        <div>
                           <h4 className="font-syne font-black uppercase tracking-widest text-white italic">Model Orchestration</h4>
                           <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Local Intelligence Import/Export</span>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <button 
                          onClick={handleImportModel}
                          className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-syne font-black text-[10px] uppercase tracking-widest text-white transition-all"
                        >
                          <UploadCloud size={16} />
                          Import Model
                        </button>
                        <button 
                          onClick={handleExportModel}
                          className="flex items-center gap-3 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-xl font-syne font-black text-[10px] uppercase tracking-widest text-blue-400 transition-all"
                        >
                          <DownloadCloud size={16} />
                          Export Weights
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Current Artifact</h5>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">Sovereign_Alpha_v9.bin</span>
                              <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">LOADED</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full w-3/4 bg-blue-500 rounded-full" />
                           </div>
                           <div className="flex justify-between text-[10px] font-bold text-white/20">
                              <span>3.2 GB</span>
                              <span>Optimized for Parallel Execution</span>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Neural Symmetry</h5>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">Weight Integrity</span>
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
                           </div>
                           <div className="grid grid-cols-3 gap-2">
                              {[0.98, 0.95, 0.88].map((v, i) => (
                                 <div key={i} className="h-8 bg-white/5 rounded border border-white/5 flex items-center justify-center">
                                    <div className="text-[10px] font-mono text-emerald-400/60">{v}</div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 flex items-center gap-6 p-6 border-t border-white/5 bg-white/[0.01]">
                     <div className="flex items-center gap-3">
                        <Terminal size={16} className="text-white/20" />
                        <span className="text-[9px] font-mono text-white/40">Model signature: sha256:8f2e...4a12</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <Activity size={16} className="text-white/20" />
                        <span className="text-[9px] font-mono text-white/40">Last calibration: 12 minutes ago</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL VIEW OVERLAY */}
      <AnimatePresence>
        {activeDetail === 'evolution' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[100] glass backdrop-blur-3xl bg-black flex flex-col p-10 overflow-y-auto custom-scrollbar"
          >
            <header className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveDetail(null)}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <X size={20} className="text-white/60" />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <Dna size={28} className="text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-syne font-black uppercase tracking-[0.2em] italic text-white">Evolutionary Neural Lab</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Genetic Algorithm Splicing & Pattern Mutation</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 flex items-center justify-center border border-white/5 bg-white/[0.02] rounded-[3rem] p-20 flex-col gap-6">
               <Dna size={64} className="text-pink-500 animate-bounce" />
               <p className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">Neural Gene Splicing in Progress...</p>
               <button onClick={() => updateState((s: any) => ({ ...s, activeTab: 'evolution' }))} className="px-8 py-3 bg-pink-500 text-white rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all">Go to Evolution Lab</button>
            </div>
          </motion.div>
        )}

        {activeDetail === 'battle' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[100] glass backdrop-blur-3xl bg-black flex flex-col p-10 overflow-y-auto custom-scrollbar"
          >
            <header className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveDetail(null)}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <X size={20} className="text-white/60" />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Crosshair size={28} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-syne font-black uppercase tracking-[0.2em] italic text-white">Quantum Battle Nexus</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Stochastic Combat Simulation & Adversarial Testing</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 flex items-center justify-center border border-white/5 bg-white/[0.02] rounded-[3rem] p-20 flex-col gap-6">
               <Crosshair size={64} className="text-red-500 animate-pulse" />
               <p className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">Combat Simulation Warming Up...</p>
               <button onClick={() => updateState((s: any) => ({ ...s, activeTab: 'battle' }))} className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all">Go to Battle Arena</button>
            </div>
          </motion.div>
        )}

        {activeDetail === 'capital' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[100] glass backdrop-blur-3xl bg-black flex flex-col p-10 overflow-y-auto custom-scrollbar"
          >
            <header className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveDetail(null)}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <X size={20} className="text-white/60" />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Coins size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-syne font-black uppercase tracking-[0.2em] italic text-white">Sovereign Capital Engine</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Liquidity Allocation & Yield Velocity Control</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-end px-6 py-2 border-r border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Total Vault Value</span>
                  <span className="text-sm font-syne font-black text-emerald-400 italic tracking-widest">$42,841,200.00</span>
                </div>
                <button 
                  onClick={() => notify("Rebalancing portfolio...")}
                  className="px-8 py-3 bg-emerald-500 font-syne font-black text-[10px] uppercase tracking-widest text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                >
                  Rebalance Assets
                </button>
              </div>
            </header>

            <div className="max-w-[1700px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
               {/* ALLOCATION PIE */}
               <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-10 w-full flex items-center gap-3">
                     <LayoutGrid size={14} className="text-emerald-400" />
                     Asset Partitioning
                  </h3>
                  
                  <div className="h-[350px] w-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={CAP_ALLOCATION}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {CAP_ALLOCATION.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Efficiency</span>
                        <span className="text-2xl font-syne font-black text-white italic">94.8%</span>
                     </div>
                  </div>

                  <div className="mt-10 w-full space-y-4">
                     {CAP_ALLOCATION.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{item.name}</span>
                           </div>
                           <span className="text-xs font-mono font-bold text-white">{(item.value / 10).toFixed(1)}%</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* YIELD PERFORMANCE */}
               <div className="lg:col-span-8 flex flex-col gap-8">
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                     <div className="flex items-center justify-between mb-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                           <TrendingUp size={14} className="text-emerald-400" />
                           Yield Velocity (7D Overlay)
                        </h3>
                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AVG APY: 14.2%</span>
                        </div>
                     </div>

                     <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={VAR_DATA}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#fff0" />
                              <XAxis dataKey="time" hide />
                              <YAxis hide />
                              <Tooltip 
                                 contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              />
                              <Line 
                                 type="monotone" 
                                 dataKey="value" 
                                 stroke="#34d399" 
                                 strokeWidth={4} 
                                 dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }} 
                                 activeDot={{ r: 8, strokeWidth: 0 }}
                              />
                           </LineChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-3">
                           <History size={14} />
                           Recent Capital Deployment
                        </h4>
                        <div className="space-y-4">
                           {[
                              { label: 'EVM Nexus Swap', value: '-$420k', time: '12m ago', status: 'SUCCESS' },
                              { label: 'Yield Harvest (Node_A)', value: '+$84k', time: '45m ago', status: 'SUCCESS' },
                              { label: 'Liquidity Injection', value: '-$1.2M', time: '2h ago', status: 'PENDING' },
                           ].map((tx, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white/80">{tx.label}</span>
                                    <span className="text-[8px] font-black text-white/20 uppercase">{tx.time}</span>
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <span className={cn("text-xs font-mono font-bold", tx.value.startsWith('+') ? 'text-emerald-400' : 'text-red-400')}>{tx.value}</span>
                                    <span className="text-[8px] font-black text-[var(--p)] uppercase">{tx.status}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-[var(--p)]/5 border border-[var(--p)]/10 rounded-[2rem] p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                           <Zap size={48} className="text-[var(--p)]/20 animate-pulse" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--p)] mb-4">Capital Optimization Tip</h4>
                        <p className="text-xs font-medium text-white/60 leading-relaxed mb-6 italic">
                           "The sovereign node Alpha-7 is showing a 2.4% yield delta compared to baseline pools. 
                           Recommend increasing weighting by 12% to capture the arbitrage window opening in T-minus 44 mins."
                        </p>
                        <button className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5">
                           Auto-Approve Optimization
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* Existing Detail Views */}
        {activeDetail === 'strategy' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[100] glass backdrop-blur-3xl bg-black flex flex-col p-10 overflow-y-auto custom-scrollbar"
          >
            <header className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveDetail(null)}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <X size={20} className="text-white/60" />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Cpu size={28} className="text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-syne font-black uppercase tracking-[0.2em] italic text-white">Strategy Engine</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Autonomous Alpha Synthesis & Execution Matrix</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-end px-6 py-2 border-r border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Active Alphas</span>
                  <span className="text-sm font-syne font-black text-purple-400 italic tracking-widest">12_ACTIVE_KERNELS</span>
                </div>
                <button 
                  onClick={() => notify("Initiating Neural Retraining...")}
                  className="px-8 py-3 bg-[var(--p)] font-syne font-black text-[10px] uppercase tracking-widest text-white rounded-xl shadow-lg shadow-[var(--p)]/20 hover:scale-105 transition-all"
                >
                  Retrain All Models
                </button>
              </div>
            </header>

            <div className="max-w-[1700px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
               {/* STRATEGY CONTROLS & BACKTEST CONFIG */}
               <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-8">
                  <header>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-3">
                        <Settings2 size={14} className="text-purple-400" />
                        Backtest_Config
                     </h3>
                     <p className="text-[11px] font-medium text-white/20 italic">Calibrate historical simulation parameters.</p>
                  </header>

                  <div className="space-y-8 flex-1">
                     <div className="space-y-5 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex justify-between items-center">
                           <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Risk Tolerance</label>
                           <span className="text-xs font-mono font-black text-purple-400 italic">{strategyParams.riskTolerance}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={strategyParams.riskTolerance}
                          onChange={(e) => setStrategyParams(p => ({ ...p, riskTolerance: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                        />
                        <div className="flex justify-between text-[7px] font-black text-white/20 uppercase tracking-widest">
                           <span>Conservative</span>
                           <span>High_Lev</span>
                        </div>
                     </div>

                     <div className="space-y-5 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex justify-between items-center">
                           <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Backtest Period</label>
                           <span className="text-xs font-mono font-black text-blue-400 italic">{strategyParams.backtestPeriod} Days</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           {[30, 90, 365].map(days => (
                              <button 
                                key={days}
                                onClick={() => setStrategyParams(p => ({ ...p, backtestPeriod: days }))}
                                className={cn(
                                   "py-3 rounded-lg text-[9px] font-black border transition-all uppercase tracking-widest",
                                   strategyParams.backtestPeriod === days 
                                     ? "bg-blue-500/20 border-blue-500/40 text-blue-400" 
                                     : "bg-white/5 border-white/5 text-white/20 hover:text-white/40"
                                )}
                              >
                                {days === 365 ? '1Y' : `${days}D`}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-5 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex justify-between items-center">
                           <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Signal Sensitivity</label>
                           <span className="text-xs font-mono font-black text-amber-400 italic">{strategyParams.signalSensitivity}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={strategyParams.signalSensitivity}
                          onChange={(e) => setStrategyParams(p => ({ ...p, signalSensitivity: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                        />
                     </div>
                  </div>

                  <button 
                    disabled={isSimulating}
                    onClick={handleRunSimulation}
                    className={cn(
                       "w-full py-5 rounded-2xl font-syne font-black text-[11px] uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 transition-all relative overflow-hidden",
                       isSimulating 
                         ? "bg-white/5 text-white/20 cursor-wait" 
                         : "bg-white text-black hover:scale-105 shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95"
                    )}
                  >
                     {isSimulating && (
                       <motion.div 
                         initial={{ x: '-100%' }}
                         animate={{ x: '100%' }}
                         transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                         className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--p)]/20 to-transparent pointer-events-none"
                       />
                     )}
                     <Play size={16} className={cn(isSimulating && "animate-pulse")} fill={isSimulating ? "none" : "currentColor"} />
                     {isSimulating ? 'SIMULATING...' : 'Run Strategic Backtest'}
                  </button>
               </div>

               {/* PERFORMANCE ANALYSIS */}
               <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-10 flex items-center gap-3">
                     <Radar size={14} className="text-purple-400" />
                     Strategy Fingerprint
                  </h3>
                  
                  <div className="flex-1 min-h-[400px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dynamicStats}>
                           <PolarGrid stroke="#ffffff10" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                           <RechartsRadar
                              name="Base Strategy"
                              dataKey="A"
                              stroke="#a855f7"
                              strokeWidth={3}
                              fill="#a855f7"
                              fillOpacity={0.3}
                           />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-4">
                     {performanceMetrics.map((s, i) => (
                        <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col">
                           <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{s.label}</span>
                           <span className={cn("text-lg font-syne font-black italic tracking-widest", s.color)}>{s.value}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* SIMULATED PERFORMANCE CURVE */}
               <div className="lg:col-span-5 flex flex-col gap-8">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col min-h-[450px]">
                     <div className="flex items-center justify-between mb-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                           <TrendingUp size={14} className="text-blue-400" />
                           Simulated Performance Curve
                        </h3>
                        <div className="flex gap-2">
                           <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">LIVE_PROJECTION</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={Array.from({ length: 20 }).map((_, i) => {
                              const { riskTolerance, signalSensitivity } = strategyParams;
                              const vol = riskTolerance / 100;
                              const freq = signalSensitivity / 100;
                              const base = 100 + i * 2;
                              const noise = (Math.random() - 0.5) * 10 * vol * (1 + freq);
                              return { name: i, value: base + noise };
                           })}>
                              <defs>
                                 <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="name" hide />
                              <YAxis hide domain={['auto', 'auto']} />
                              <Tooltip 
                                 contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                 labelStyle={{ display: 'none' }}
                              />
                              <Area type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorStrategy)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>

                     <div className="mt-8 p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                           <Activity size={12} className="text-blue-400" />
                           <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Projection Analysis</span>
                        </div>
                        <p className="text-[10px] font-medium text-white/30 leading-relaxed italic">
                           Based on current {strategyParams.riskTolerance}% risk tolerance and {strategyParams.signalSensitivity}% sensitivity, 
                           the engine projects a {performanceMetrics[1].value} alpha capture with {performanceMetrics[2].value} draw-down potential.
                        </p>
                     </div>
                  </div>

                   <div className="grid grid-cols-1 gap-6">
                     {[
                        { title: 'Momentum_v8', status: 'TRADING', alpha: '+12.4%', icon: TrendingUp, color: 'text-emerald-400' },
                        { title: 'Vol_Arb_Nexus', status: 'HEDGING', alpha: '+8.1%', icon: Target, color: 'text-purple-400' },
                        { title: 'Liquid_Alpha', status: 'IDLE', alpha: '0.0%', icon: Zap, color: 'text-white/20' }
                     ].map((s, i) => (
                        <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col gap-6 group hover:bg-white/[0.08] transition-all">
                           <div className="flex items-center justify-between">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10", s.color)}>
                                 <s.icon size={22} />
                              </div>
                              <span className={cn(
                                 "text-[8px] font-black px-2 py-1 rounded uppercase tracking-[0.2em]",
                                 s.status === 'TRADING' ? 'bg-emerald-500/10 text-emerald-400' :
                                 s.status === 'HEDGING' ? 'bg-purple-500/10 text-purple-400' :
                                 'bg-white/5 text-white/30'
                              )}>{s.status}</span>
                           </div>
                           <div>
                              <h5 className="text-sm font-black text-white italic uppercase tracking-tighter mb-1">{s.title}</h5>
                              <div className="flex items-center gap-2">
                                 <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Est. Alpha:</span>
                                 <span className={cn("text-[10px] font-mono font-black", s.color)}>{s.alpha}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeDetail === 'risk' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[100] glass backdrop-blur-3xl bg-black flex flex-col p-10 overflow-y-auto custom-scrollbar"
          >
            <header className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveDetail(null)}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <X size={20} className="text-white/60" />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <ShieldAlert size={28} className="text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-syne font-black uppercase tracking-[0.2em] italic text-white">Risk Command Neural Hub</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Sovereign Guard & Exposure Mitigation Matrix</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-end px-6 py-2 border-r border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Global Risk Bias</span>
                  <span className="text-sm font-syne font-black text-amber-400 italic tracking-widest">GUARDED_POSTURE</span>
                </div>
                <button className="px-8 py-3 bg-red-500 font-syne font-black text-[10px] uppercase tracking-widest text-white rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 transition-all">
                  Emergency Liquidation (Kill Switch)
                </button>
              </div>
            </header>

            <div className="max-w-[1700px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
              {/* PRIMARY VISUALIZATION: VaR TRACKER */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-10">
                      <div>
                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/80 mb-1">Neural VaR Calculation</h3>
                         <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Real-time Value-at-Risk against 4.0% limit</p>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Current VaR</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Safety Limit</span>
                         </div>
                      </div>
                   </div>

                   <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={VAR_DATA}>
                            <defs>
                               <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis 
                              dataKey="time" 
                              stroke="#ffffff20" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              tick={{ fontWeight: 900, letterSpacing: '0.1em' }}
                            />
                            <YAxis 
                              stroke="#ffffff20" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              domain={[0, 5]}
                              tick={{ fontWeight: 900 }}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                              itemStyle={{ color: '#fff', fontWeight: 900, textTransform: 'uppercase' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            <Line type="monotone" dataKey="limit" stroke="#ffffff10" strokeDasharray="10 10" dot={false} strokeWidth={2} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="mt-8 grid grid-cols-4 gap-6">
                      {[
                        { label: 'Volatility Index', value: '18.4', trend: '+1.2%', color: 'text-amber-400' },
                        { label: 'Delta Neutrality', value: '0.992', trend: 'STABLE', color: 'text-emerald-400' },
                        { label: 'Gamma Exposure', value: 'Low', trend: 'NOMINAL', color: 'text-blue-400' },
                        { label: 'Theta Decay', value: 'Active', trend: 'STEADY', color: 'text-white/60' }
                      ].map((m, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                           <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{m.label}</div>
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-white italic">{m.value}</span>
                              <span className={cn("text-[8px] font-black uppercase", m.color)}>{m.trend}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                           <Globe2 size={14} className="text-blue-400" />
                           Geopolitical Risk Heatmap
                        </h4>
                        <div className="px-2 py-1 bg-blue-500/10 rounded-lg text-[8px] font-black text-blue-400 uppercase tracking-widest">Live Scanner</div>
                      </div>
                      
                      <div className="space-y-4">
                         {GEO_RISK.map((r, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/[0.05] transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <MapPin size={14} className="text-white/20" />
                                 </div>
                                 <span className="text-xs font-bold text-white/80">{r.region}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-1000", r.color.split(' ')[0])} style={{ width: `${r.score}%` }} />
                                 </div>
                                 <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest", r.color)}>
                                    {r.status}
                                 </span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                           <Layers size={14} className="text-emerald-400" />
                           Liquidity Concentration
                        </h4>
                        <div className="px-2 py-1 bg-emerald-500/10 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest">Active Channels</div>
                      </div>
                      
                      <div className="h-[240px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={EXPOSURE_DATA} layout="vertical">
                               <XAxis type="number" hide />
                               <YAxis 
                                 dataKey="name" 
                                 type="category" 
                                 stroke="#ffffff20" 
                                 fontSize={10} 
                                 tick={{ fontWeight: 900, letterSpacing: '0.1em' }}
                                 tickLine={false}
                                 axisLine={false}
                                 width={100}
                               />
                               <Tooltip 
                                 cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                 contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                               />
                               <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                                  {EXPOSURE_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                         <p className="text-[9px] font-medium text-emerald-400/60 leading-relaxed italic">
                           Analysis: Liquidity is currently congregating in Node_Alpha. 
                           Suggests potential high-velocity exit patterns forming in 14.2h.
                         </p>
                      </div>
                   </div>
                </div>
              </div>

              {/* SECONDARY TIERS: COUNTERPARTY & LOGS */}
              <div className="lg:col-span-4 space-y-8">
                {/* LIVE VaR CALCULATION ENGINE */}
                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[2rem] p-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                      <ShieldAlert size={48} className="text-orange-500" />
                   </div>
                   
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-6 flex items-center gap-3">
                      <Activity size={14} className="animate-pulse" />
                      Live VaR Engine
                   </h4>

                   <div className="flex flex-col gap-6 relative z-10">
                      <div className="flex items-end gap-3">
                         <span className="text-4xl font-syne font-black text-white italic tracking-tighter">
                            {liveVar.toFixed(4)}%
                         </span>
                         <span className={cn(
                            "text-[10px] font-black px-2 py-1 rounded mb-1.5 uppercase tracking-widest",
                            liveVar > 3.5 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                         )}>
                            {liveVar > 3.5 ? 'CRITICAL' : 'NOMINAL'}
                         </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Confidence</span>
                            <span className="text-xs font-mono font-bold text-white/80">99.0%</span>
                         </div>
                         <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Horizon</span>
                            <span className="text-xs font-mono font-bold text-white/80">24H</span>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Post-Alpha Delta</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">-{((liveVar * 0.1)).toFixed(3)}%</span>
                         </div>
                         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-orange-500"
                              initial={{ width: '0%' }}
                              animate={{ width: `${(liveVar / 4) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8 border-b border-white/5 pb-4">Counterparty Exposure</h4>
                   <div className="space-y-6">
                      {[
                        { name: 'Goldman_Nexus', exposure: '$14.2M', rating: 'AAA', status: 'STABLE' },
                        { name: 'Binance_Global', exposure: '$8.4M', rating: 'B+', status: 'GUARDED' },
                        { name: 'SovereignPool_C', exposure: '$4.1M', rating: 'A-', status: 'STABLE' },
                        { name: 'DarkLiquidity_0x', exposure: '$2.2M', rating: 'UNRATED', status: 'VOLATILE' },
                      ].map((cp, i) => (
                        <div key={i} className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white tracking-tight">{cp.name}</span>
                              <span className="text-xs font-mono font-bold text-emerald-400 italic">{cp.exposure}</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <span className="text-[9px] font-black text-white/20 uppercase">Rating:</span>
                                 <span className="text-[9px] font-bold text-blue-400">{cp.rating}</span>
                              </div>
                              <span className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                cp.status === 'STABLE' ? 'bg-emerald-500/10 text-emerald-500' :
                                cp.status === 'GUARDED' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-red-500/10 text-red-500'
                              )}>
                                 {cp.status}
                              </span>
                           </div>
                        </div>
                      ))}
                   </div>

                   <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all">
                      View All 84 Counterparties
                   </button>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-10 flex flex-col h-[500px]">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-3">
                      <Terminal size={14} className="text-orange-500" />
                      Risk Mitigation Logs
                   </h4>
                   <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                      {[
                        { time: '16:42:01', msg: 'VaR violation threshold tightened from 4.5% to 4.0%', type: 'SYSTEM' },
                        { time: '16:38:12', msg: 'Detected anomaly in HK corridor liquidity bridge', type: 'ALERT' },
                        { time: '16:35:45', msg: 'Rebalancing hedge delta in Node_Alpha (+$0.4M)', type: 'EXEC' },
                        { time: '16:30:22', msg: 'Geopolitical score for E. Asia updated (38 -> 45)', type: 'INTEL' },
                        { time: '16:25:10', msg: 'Model calibration sync complete (sha256:8f2e)', type: 'MODL' },
                        { time: '16:18:59', msg: 'Emergency liquidity reserve verified: $42.0M', type: 'SEC' },
                        { time: '16:12:30', msg: 'Neural pathways for risk detection recalibrated', type: 'AUTO' },
                      ].map((log, i) => (
                        <div key={i} className="flex gap-4 font-mono">
                           <span className="text-[9px] text-white/20 shrink-0">{log.time}</span>
                           <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded h-fit shrink-0",
                              log.type === 'ALERT' ? 'bg-red-500/20 text-red-400' :
                              log.type === 'EXEC' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-white/5 text-white/40'
                           )}>{log.type}</span>
                           <span className="text-[9px] text-white/60 leading-relaxed">{log.msg}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
