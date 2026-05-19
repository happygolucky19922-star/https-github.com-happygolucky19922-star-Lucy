import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Connection, 
  Edge, 
  Node, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AppState } from '../types';
import { motion } from 'motion/react';
import { Layout, Cpu, Database, ListChecks, Zap } from 'lucide-react';

const CustomNode = ({ data }: any) => {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="px-4 py-3 rounded-xl bg-black/80 border border-white/10 shadow-2xl backdrop-blur-xl min-w-[150px] relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="flex items-center gap-3 relative z-10">
        <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${data.color || 'text-white/40'}`}>
          {data.icon || <ListChecks size={14} />}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{data.label}</span>
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{data.type || 'TASK'}</span>
        </div>
      </div>
      
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-white/20 border-none !hidden group-hover:!block" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-white/20 border-none !hidden group-hover:!block" />
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

interface Props {
  state: AppState;
}

export default function TaskGraphView({ state }: Props) {
  const initialNodes: Node[] = useMemo(() => {
    const plan = state.appBuilder.plan;
    if (!plan || !plan.steps) return [
      { id: '1', position: { x: 250, y: 50 }, data: { label: 'SYNTHESIS_START', type: 'INIT', color: 'text-emerald-400', icon: <Zap size={14} /> }, type: 'custom' },
      { id: '2', position: { x: 250, y: 150 }, data: { label: 'LOGIC_CORE', type: 'PROCESSING', color: 'text-blue-400', icon: <Cpu size={14} /> }, type: 'custom' },
      { id: '3', position: { x: 250, y: 250 }, data: { label: 'UI_READY', type: 'RESULT', color: 'text-purple-400', icon: <Layout size={14} /> }, type: 'custom' },
    ];

    return plan.steps.map((step: any, i: number) => ({
      id: `step-${i}`,
      position: { x: 250, y: i * 100 + 50 },
      data: { 
        label: typeof step === 'string' ? step : (step.name || step.title || `STEP_${i}`),
        type: 'PIPELINE_NODE',
        color: i === 0 ? 'text-emerald-400' : 'text-white/40',
        icon: <ListChecks size={14} />
      },
      type: 'custom'
    }));
  }, [state.appBuilder.plan]);

  const initialEdges: Edge[] = useMemo(() => {
    const plan = state.appBuilder.plan;
    if (!plan || !plan.steps || plan.steps.length < 2) return [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
      { id: 'e2-3', source: '2', target: '3', animated: false, style: { stroke: 'rgba(255,255,255,0.1)' } },
    ];

    const edges: Edge[] = [];
    for (let i = 0; i < plan.steps.length - 1; i++) {
      edges.push({
        id: `e-${i}-${i+1}`,
        source: `step-${i}`,
        target: `step-${i+1}`,
        animated: i === 0,
        style: { stroke: 'rgba(255,255,255,0.1)' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'rgba(255,255,255,0.2)',
        },
      });
    }
    return edges;
  }, [state.appBuilder.plan]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="w-full h-full bg-[#050505] relative">
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1">
         <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] flex items-center gap-2">
            <Database size={12} className="text-[var(--p)]" />
            Graph_Topology_Engine
         </h3>
         <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest italic">Visualizing Neural Pathing & Dependencies</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        style={{ background: '#050505' }}
      >
        <Background 
            color="rgba(255,255,255,0.03)" 
            gap={20} 
            size={1} 
            variant={"dots" as any} 
        />
        <Controls 
          className="bg-black/60 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl" 
          showInteractive={false}
        />
      </ReactFlow>

      {/* OVERLAY GLOW */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
      <div className="absolute bottom-8 right-8 z-20 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
         <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Live_Graph_Edit_Active</span>
      </div>
    </div>
  );
}
