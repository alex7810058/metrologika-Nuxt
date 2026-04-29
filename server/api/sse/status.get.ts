import { getTaskResult, taskEmitter } from '../../utils/taskStore';

export default defineEventHandler(async (event) => {
  // Защита: только авторизованные
  const session = await requireUserSession(event);

  const query = getQuery(event);
  const jobId = query.jobId as string;
  if (!jobId) throw createError({ statusCode: 400, message: 'jobId required' });

  const res = event.node.res;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const send = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Уже готовый результат?
  const existing = getTaskResult(jobId);
  if (existing) {
    send(existing);
    res.end();
    return;
  }

  // Ожидаем события
  const handler = (taskResult: any) => {
    send(taskResult);
    res.end();
    taskEmitter.off(`task:${jobId}`, handler);
  };
  taskEmitter.on(`task:${jobId}`, handler);

  event.node.req.on('close', () => {
    taskEmitter.off(`task:${jobId}`, handler);
    if (!res.writableEnded) res.end();
  });

  // Предотвращаем автоматическое закрытие Nitro
  return new Promise(() => {});
});
