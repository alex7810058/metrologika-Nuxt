import { setTaskResult } from '../utils/taskStore'

function generateRandomData() {
  const records = []
  for (let i = 0; i < 1000; i++) {
    records.push({
      id: i + 1,
      value: Math.random() * 100,
      text: `Record ${i + 1}`,
      timestamp: new Date().toISOString(),
    })
  }
  return records
}

export default defineEventHandler(async (event) => {
  // Защита: только для авторизованных
  const session = await requireUserSession(event)

  const body = await readBody(event)
  const { jobId } = body
  if (!jobId) throw createError({ statusCode: 400, message: 'jobId required' })

  // Запускаем фоновую задачу
  setTimeout(async () => {
    await new Promise(resolve => setTimeout(resolve, 5000))
    const result = generateRandomData()
    setTaskResult(jobId, result)
  }, 0)

  return { status: 'accepted', jobId, message: 'Task accepted' }
})
