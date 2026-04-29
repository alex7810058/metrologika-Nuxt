<script setup lang="ts">
// При инициализации приложения проверяем сессию и загружаем данные если авторизированы
const { loggedIn } = useUserSession()
const cacheStore = useCacheStore()

// Если уже авторизованы (например, после перезагрузки страницы), загружаем пользователей
if (loggedIn.value && !cacheStore.usersLoaded) {
  await $fetch<User[]>('/api/users').then(users => cacheStore.setUsers(users))
}
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
