<script setup lang="ts">
import type { User } from '~/types';

// Авто-редирект если не залогинен (middleware)
definePageMeta({ middleware: 'auth' });

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadUsers() {
  loading.value = true;
  error.value = null;
  try {
    users.value = await $fetch('/api/users');
  } catch (e) {
    console.error(e);
    error.value = 'Не удалось загрузить пользователей';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <Card>
    <template #header>
      <h2 class="text-xl font-bold">Пользователи</h2>
    </template>
    <template #content>
      <div v-if="loading" class="flex justify-center py-8">
        <ProgressSpinner />
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
