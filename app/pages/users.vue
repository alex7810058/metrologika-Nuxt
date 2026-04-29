<template>
  <Card>
    <template #content>
      <h1>Пользователи</h1>
      <DataTable :value="users" scrollable scrollHeight="400px" tableStyle="min-width: 50rem">
        <Column field="name" header="Имя"></Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
// Авто-редирект если не залогинен (middleware)
definePageMeta({ middleware: 'auth' });
</script>
