<script setup lang="ts">
// Авто-редирект если не залогинен (middleware)
definePageMeta({ middleware: 'auth' })

const { user, loggedIn, clear } = useUserSession()
const cacheStore = useCacheStore()
const jobId = ref('')
const taskStatus = ref<'idle' | 'pending' | 'completed' | 'failed'>('idle')
const resultData = ref<any>(null)
let eventSource: EventSource | null = null

async function logout() {
  await $fetch('/api/logout', { method: 'POST' })
  await clear()
  // Очищаем кэш при логауте
  cacheStore.clearCache()
  await navigateTo('/login')
}

async function startLongTask() {
  const newJobId = crypto.randomUUID()
  jobId.value = newJobId
  taskStatus.value = 'pending'

  // Открываем SSE
  eventSource = new EventSource(`/api/sse/status?jobId=${newJobId}`)
  eventSource.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.status === 'completed') {
      resultData.value = data.data
      taskStatus.value = 'completed'
      eventSource?.close()
    } else if (data.status === 'failed') {
      taskStatus.value = 'failed'
      eventSource?.close()
    }
  }
  eventSource.onerror = () => {
    taskStatus.value = 'failed'
    eventSource?.close()
  }

  try {
    await $fetch('/api/long-task', { method: 'POST', body: { jobId: newJobId } })
  } catch (err) {
    taskStatus.value = 'failed'
    eventSource?.close()
  }
}
</script>

<template>
  <Card>
    <template #content>
      <h1>Dashboard</h1>
      <p>Logged in as {{ user?.email }}</p>
      <Button label="Logout" @click="logout"/>
      <hr />
      <button @click="startLongTask" :disabled="taskStatus === 'pending'">
        {{ taskStatus === 'pending' ? 'Processing...' : 'Start Long Task (5 sec)' }}
      </button>
      <div v-if="taskStatus === 'completed'">
        <h3>Result (1000 records):</h3>
        <pre>{{ JSON.stringify(resultData, null, 2) }}</pre>
      </div>
      <p v-else-if="taskStatus === 'failed'">Task failed</p>
    </template>
  </Card>
</template>
