<script setup lang="ts">
// При инициализации приложения проверяем сессию и загружаем данные если авторизированы
import type { User } from '~/types'
import { useAuthData } from '~/composables/useAuthData'

const { loggedIn } = useUserSession()

// Если уже авторизованы (например, после перезагрузки страницы), загружаем все необходимые данные
if (loggedIn.value) {
  const { loadAuthData } = useAuthData()
  await loadAuthData()
}
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
