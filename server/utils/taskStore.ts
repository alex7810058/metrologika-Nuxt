import EventEmitter from 'node:events';

export interface TaskResult {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  data?: any;
  error?: string;
}

const tasks = new Map<string, TaskResult>();
export const taskEmitter = new EventEmitter();

export function setTaskResult(jobId: string, data?: any, error?: string) {
  const task: TaskResult = {
    jobId,
    status: error ? 'failed' : 'completed',
    data,
    error,
  };
  tasks.set(jobId, task);
  taskEmitter.emit(`task:${jobId}`, task);
}

export function getTaskResult(jobId: string): TaskResult | undefined {
  return tasks.get(jobId);
}
