<template>
  <Card>
    <template #content>
      <h1>Пользователи</h1>
      <div v-if="loading" class="flex justify-center py-8">
        <ProgressSpinner/>
      </div>

      <Message v-else-if="error" severity="error">{{ error }}</Message>

      <DataTable
        v-else
        :value="users"
        stripedRows
        tableStyle="min-width: 50rem"
      >
        <Column field="id" header="ID" style="width: 80px"></Column>
        <Column field="name" header="Имя"></Column>
        <Column field="email" header="Email"></Column>
        <Column field="created_at" header="Дата создания">
          <template #body="{ data }">
            {{ new Date(data.created_at).toLocaleDateString('ru-RU') }}
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
// Авто-редирект если не залогинен (middleware)
definePageMeta({middleware: 'auth'})

import type { User } from '~/types'

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadUsers() {
  loading.value = true
  error.value = null
  try {
    users.value = await $fetch('/api/users')
  }
  catch (e) {
    console.error(e)
    error.value = 'Не удалось загрузить пользователей'
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>
