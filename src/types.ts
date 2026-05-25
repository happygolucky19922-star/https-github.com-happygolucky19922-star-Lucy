/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Model {
  id: string;
  name: string;
  backend: 'LM Studio' | 'Ollama' | 'Custom' | 'Gemini' | 'llama.cpp' | 'vLLM' | 'vLLM / Transformers' | 'Local' | 'Transformers' | 'OpenRouter' | 'Groq';
  size?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  score: number;
  notes?: string;
  isLoaded?: boolean;
  format?: string;
  source?: string;
  quantization?: string;
  path?: string;
  loadTarget?: string;
  last_modified?: number;
  patentQuant?: boolean;
  patentDistill?: boolean;
  metrics?: {
    accuracy: number;
    latency: number;
    throughput: number;
  };
  // Growth & Mastery
  xp: number;
  level: number;
  powerRating: number; // 60-98
  // Pre-Tuning Config
  config?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    maxTokens?: number;
    stopSequences?: string[];
  };
}

export interface MatrixChallenge {
  id: string;
  x: number; // 1-10
  y: number; // 1-10
  status: 'locked' | 'unlocked' | 'passed' | 'failed';
  title: string;
  type: 'General' | 'Coding' | 'Law' | 'Healthcare' | 'Politics' | 'Philosophy' | 'Finance' | 'Moral' | 'Security' | 'Logic';
  difficulty: number; // 1-10
}

export interface TestResult {
  score: number;
  reason: string;
  response: string;
  rawRequest?: string;
  rawResponse?: string;
  ts: number;
}

export interface BattleRecord {
  id: string;
  ts: number;
  modelA: string;
  modelB: string;
  type: string;
  prompt: string;
  task: string;
  scoreA: number;
  scoreB: number;
  winner: string;
  reason: string;
}

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  xp: number;
  cond: (state: any) => boolean;
  prog: (state: any) => [number, number];
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  ts: number;
  messages: Message[];
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ForgedApp {
  id: string;
  name: string;
  baseModel: string;
  tools: string[];
  status: 'draft' | 'baking' | 'deployed';
  progress: number;
}

export interface EvolutionLog {
  id: string;
  testId: string;
  modelId: string;
  status: 'failure' | 'synthesizing' | 'fine-tuning' | 'optimized';
  ts: number;
}

export interface DownloadItem {
  id: string;
  name: string;
  url: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  size: string;
  speed: string;
  error?: string;
  ts: number;
}

export interface Dataset {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'ready' | 'processing' | 'error';
  source: string;
  ts: number;
}

export interface TrainingJob {
  id: string;
  modelId: string;
  datasetId: string;
  method: 'LoRA' | 'QLoRA' | 'DPO' | 'SFT' | 'Full';
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metrics: {
    loss: number[];
    accuracy: number;
    tokensPerSecond: number;
  };
  startTime: number;
  endTime?: number;
  logs: string[];
}

export interface Benchmark {
  id: string;
  name: string;
  category: 'Reasoning' | 'Coding' | 'Math' | 'Planning' | 'Hallucination' | 'Speed';
  results: { modelId: string; score: number; ts: number; details: string }[];
}

export interface Checkpoint {
  id: string;
  jobId: string;
  name: string;
  path: string;
  performanceDelta: number;
  ts: number;
}

export interface MergeResult {
  id: string;
  baseId: string;
  adapterId: string;
  method: string;
  quantization: string;
  format: string;
  ts: number;
  status: 'completed' | 'failed' | 'processing';
}

export interface DataForgeDataset {
  id: string;
  name: string;
  status: 'import' | 'clean' | 'review' | 'package' | 'share';
  healthScore: number;
  qualityMetrics: {
    duplicates: number;
    brokenRows: number;
    sensitiveRisk: number;
    aiGeneratedProb: number;
    missingValues: number;
  };
  passport: {
    qualityScore: number;
    humanReviewedPct: number;
    duplicateRemovalStatus: string;
    aiContaminationRisk: string;
    provenanceTracking: string;
    lastUpdated: number;
  };
  provenance: {
    ts: number;
    action: string;
    description: string;
  }[];
  config: {
    purpose: string;
    price?: number;
    license: string;
    isSaleReady: boolean;
  };
}

export interface DataForgeState {
  datasets: DataForgeDataset[];
  activeDatasetId: string | null;
}

export interface ModelLabState {
  datasets: Dataset[];
  jobs: TrainingJob[];
  benchmarks: Benchmark[];
  checkpoints: Checkpoint[];
  merges: MergeResult[];
  selectedModelId: string | null;
  activeJobId: string | null;
}

export interface DreamModeState {
  isDreaming: boolean;
  activeCycleId: string | null;
  dreamCycles: {
    id: string;
    ts: number;
    summary: string;
    unresolvedProblems: string[];
    insights: string[];
    contextCompressed: boolean;
  }[];
  trajectories: {
    id: string;
    ts: number;
    description: string;
    steps: { type: 'thought' | 'action' | 'observation' | 'reflection'; content: string; ts: number }[];
    comparisons?: string[];
  }[];
  memories: {
    id: string;
    content: string;
    type: 'persistent' | 'summary' | 'core';
    ts: number;
    decay: number;
  }[];
  modelHub: {
    routers: {
      id: string;
      name: string;
      type: 'Ollama' | 'LM Studio' | 'OpenRouter' | 'Custom' | 'GGUF' | 'HuggingFace';
      endpoint: string;
      status: 'active' | 'offline';
      models: string[];
    }[];
    fallbackChain: string[];
    parallelReasoningEnabled: boolean;
  };
}

export interface OversightAlert {
  id: string;
  ts: number;
  type: 'illegal' | 'suspicious' | 'bill_update' | 'donation_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  nextSteps: string[];
  drafts: { title: string; content: string }[];
}

export interface Bill {
  id: string;
  number: string;
  title: string;
  status: string;
  lastAction: string;
  lastUpdated: number;
  summary: string;
  sponsor: string;
}

export interface Donation {
  id: string;
  donor: string;
  recipient: string;
  amount: number;
  ts: number;
  description: string;
}

export interface Patent {
  id: string;
  number: string;
  title: string;
  filingDate: string;
  status: string;
  abstract: string;
}

export interface HouseOversightState {
  isMonitoring: boolean;
  alerts: OversightAlert[];
  trackedBills: Bill[];
  trackedDonations: Donation[];
  patents: Patent[];
  dailyCheckConfig: {
    durationHours: number;
    startTime: string; // "HH:MM"
    active: boolean;
  };
}

export interface AppState {
  metadata: {
    name: string;
    description: string;
  };
  activeView: 'AppBuilder' | 'ModelLab' | 'DataForge';
  onboardingComplete: boolean;
  userPath: string;
  xp: number;
  level: number;
  testsRun: number;
  perfectScores: number;
  legendaryModels: number;
  comparisons: number;
  maxStreak: number;
  catsRun: string[];
  msgsSent: number;
  curStreak: number;
  testResults: Record<string, TestResult>;
  achUnlocked: string[];
  models: Model[];
  conversations: Conversation[];
  forgedApps: ForgedApp[];
  evolutionLogs: EvolutionLog[];
  downloads: DownloadItem[];
  curConvId: string | null;
  chatModel: string | null;
  isLucyDeployed?: boolean;
  arenaModel: string | null;
  gauntletJudge: string | null;
  gauntletHistory: { testId: string; modelId: string; result: TestResult }[];
  battleHistory: BattleRecord[];
  fineTuningModelId: string | null;
  activeAgent: 'General' | 'Code' | 'Research' | 'Creative' | 'Data';
  connectors: {
    github: boolean;
    web: boolean;
    postgres: boolean;
    cloud: boolean;
    screenShare: boolean;
  };
  onlineModelSearch: boolean;
  isScreenSharing: boolean;
  plugins: string[];
  memories: any[];
  mastery: {
    nonlinearQuant: boolean;
    vpuSimulation: boolean;
    totalIsolation: boolean;
  };
  matrix: MatrixChallenge[];
  infra: {
    clusterStatus: 'offline' | 'connecting' | 'active';
    gpuNodes: number;
    activeFrameworks: string[]; // 'tensorflow', 'pytorch', 'kubernetes', 'datasets'
    endpoints?: Record<string, string>;
  };
  appBuilder: {
    prompt: string;
    mode: 'Plan' | 'Execute';
    plan: {
      ui: string[];
      backend: string[];
      data: string[];
      steps: string[];
    } | null;
    pipeline: {
      planning: 'idle' | 'running' | 'complete' | 'error';
      generating: 'idle' | 'running' | 'complete' | 'error';
      wiring: 'idle' | 'running' | 'complete' | 'error';
      validating: 'idle' | 'running' | 'complete' | 'error';
      finalizing: 'idle' | 'running' | 'complete' | 'error';
    };
    code: string;
    errors: string[];
    outputStream: { ts: number; msg: string; type: 'info' | 'system' | 'success' | 'error' }[];
    isBuilding: boolean;
    activeTab: 'Dashboard' | 'Code' | 'Preview' | 'Logs' | 'Design' | 'Market' | 'Memory' | 'Collaboration' | 'History' | 'Tasks' | 'Tests' | 'Project' | 'Agents' | 'Models' | 'Vault' | 'Revenue' | 'Graph';
    selectedModel: string | null;
    selectedQuantization: 'Q4_K_M' | 'Q8_0' | 'FP16' | 'FP32' | string | null;
    activeMode: 'Build' | 'Debug' | 'Research' | 'Deploy' | 'Analyze' | 'Automation' | 'Growth' | 'Business';
    deployStatus: 'idle' | 'deploying' | 'complete' | 'error';
    lastSaved: number;
    testPrompts: { id: string; text: string; category: string }[];
    gamification: {
      completionPercentage: number;
      buildStreak: number;
      milestones: { id: string; title: string; unlocked: boolean; ts?: number }[];
      scores: {
        optimization: number;
        revenue: number;
        confidence: number;
        system: number;
        independence: number;
        sovereign: number;
      };
    };
    projectContext: {
      businessGoals: string[];
      architectureDecisions: string[];
      preferredStyle: string;
      competitors: string[];
      roadmap: { id: string; title: string; status: 'pending' | 'active' | 'completed' }[];
    };
    agents: {
      id: string;
      name: string;
      role: 'Architect' | 'Developer' | 'Analyst' | 'Growth' | 'Business' | 'Research' | 'QA' | 'Security' | 'Orchestrator' | 'SuperAgent';
      status: 'idle' | 'working' | 'thinking' | 'offline';
      task?: string;
      efficiency: number;
      isSuperAgent?: boolean;
      capabilities?: string[];
      bio?: string;
      avatar?: string;
    }[];
    vault: {
      id: string;
      title: string;
      content: string;
      type: 'doc' | 'strategy' | 'logic' | 'research';
      ts: number;
    }[];
    revenue: {
      projections: { month: string; amount: number }[];
      readinessScore: number;
      potentialChannels: string[];
    };
    systemHealth: {
      vram: number;
      ram: number;
      cpu: number;
      storage: number;
      localServerStatus: 'active' | 'offline';
      latency: number;
    };
    collaboration: {
      activeSession: boolean;
      sessionId: string | null;
      collaborators: {
        id: string;
        name: string;
        color: string;
        cursor?: { line: number; ch: number };
        activeFile?: string;
      }[];
    };
    versionControl: {
      currentBranch: string;
      branches: {
        name: string;
        headId: string;
      }[];
      history: {
        id: string;
        branch: string;
        message: string;
        code: string;
        author: string;
        ts: number;
      }[];
    };
    taskGraph: {
      tasks: {
        id: string;
        name: string;
        type: 'build' | 'test' | 'deploy' | 'sync' | 'analyze';
        dependencies: string[];
        status: 'idle' | 'running' | 'completed' | 'failed';
        duration?: number;
      }[];
    };
    projects: {
      id: string;
      name: string;
      version: string;
      files: { name: string; content: string; type: 'code' | 'ui' | 'doc' }[];
    }[];
    coBuilder: {
      active: boolean;
      agenticDashboardOpen: boolean;
      mode: 'Suggest' | 'Assist' | 'Agent';
      executionLevel: 'Fast' | 'Planning';
      engineStatus: 'idle' | 'thinking' | 'executing' | 'fixing' | 'observing';
      actionLog: { ts: number; action: string; status: 'pending' | 'success' | 'fail'; type: 'code' | 'shell' | 'system' | 'android' }[];
      autoFixEnabled: boolean;
      pendingCommand: { cmd: string; description: string } | null;
      observation: {
        lastScan: number;
        detectedContext: string;
        isScanning: boolean;
        telemetry: { id: string; msg: string; type: 'event' | 'focus' | 'system' }[];
      };
      androidBridge: {
         connected: boolean;
         deviceInfo: string | null;
         lastDeployment: number | null;
      };
      permissions: {
         mouseControl: boolean;
         terminalControl: boolean;
         filesystemControl: boolean;
      };
    };
  };
  dataForge: DataForgeState;
  modelLab: ModelLabState;
  dreamMode: DreamModeState;
  houseOversight: HouseOversightState;
  arenaConfig: {
    isAutoRunning: boolean;
    activeScenario: string | null;
    battle?: {
      modelA: string | null;
      modelB: string | null;
      battleType: string | null;
      prompt: string | null;
      hpA: number;
      hpB: number;
      logs: string[];
      isFighting: boolean;
    };
  };
  settings: {
    theme: 'dark' | 'light';
    streaming: boolean;
    autoscroll: boolean;
    judge: boolean;
    lmsUrl: string;
    ollUrl: string;
    cusUrl: string;
    openRouterKey?: string;
    hfKey?: string;
    groqKey?: string;
    language: string;
    accentColor: string;
    glassOpacity: number;
    performancePreset: 'saver' | 'balanced' | 'max';
  };
}
