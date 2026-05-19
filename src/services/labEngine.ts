import { AppState, TrainingJob, Dataset } from "../types";

export const LabEngine = {
  /**
   * Simulates a training job initialization
   */
  async initializeTraining(modelId: string, datasetId: string, method: TrainingJob['method']): Promise<TrainingJob> {
    const jobId = `job-${Math.random().toString(36).substring(7)}`;
    return {
      id: jobId,
      modelId,
      datasetId,
      method,
      progress: 0,
      status: 'pending',
      metrics: {
        loss: [0.8, 0.75, 0.72, 0.68],
        accuracy: 0.12,
        tokensPerSecond: 0
      },
      startTime: Date.now(),
      logs: [
        `[SYSTEM] Neural Job ${jobId} initialized.`,
        `[SYSTEM] Allocating VRAM resources on Node_01 (A100-80GB)...`,
        `[SYSTEM] Mapping dataset weights...`
      ]
    };
  },

  /**
   * Generates mock updates for an active job
   */
  getNextJobState(job: TrainingJob): TrainingJob {
    if (job.status !== 'running' && job.status !== 'pending') return job;

    const newProgress = Math.min(100, job.progress + Math.random() * 5);
    const newStatus = newProgress === 100 ? 'completed' : 'running';
    
    // Generate some "neural" logs
    const newLogs = [...job.logs];
    if (Math.random() > 0.7) {
      const logTypes = [
        "Computing loss gradient...",
        "Optimizing weight tensors...",
        "Evaluating checkpoint coherence...",
        "Synaptic pruning active...",
        "Cross-entropy optimization in progress..."
      ];
      newLogs.push(`[TRAIN] ${logTypes[Math.floor(Math.random() * logTypes.length)]}`);
    }

    // Update loss curve
    const lastLoss = job.metrics.loss[job.metrics.loss.length - 1];
    const newLoss = Math.max(0.01, lastLoss - Math.random() * 0.05);

    return {
      ...job,
      status: newStatus,
      progress: newProgress,
      logs: newLogs.slice(-50), // Keep logs manageable
      metrics: {
        ...job.metrics,
        loss: [...job.metrics.loss, newLoss].slice(-100),
        accuracy: job.metrics.accuracy + (Math.random() * 0.01),
        tokensPerSecond: 2400 + (Math.random() * 400)
      }
    };
  }
};
