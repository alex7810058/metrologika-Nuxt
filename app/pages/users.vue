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

// Используем cache store вместо локального fetch
const cacheStore = useCacheStore()

// Получаем пользователей из кэша
const users = computed(() => cacheStore.users)
const loading = computed(() => !cacheStore.usersLoaded)
const error = ref<string | null>(null)
</script>
