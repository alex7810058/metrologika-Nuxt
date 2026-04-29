<script setup lang="ts">
// Авто-редирект если не залогинен (middleware)
definePageMeta({ middleware: 'auth' });
</script>

<template>
  <Card>
    <template #content>
      users
    </template>
  </Card>
</template>
