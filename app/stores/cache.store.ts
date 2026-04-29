import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '~/types'

export const useCacheStore = defineStore('cache', () => {
  // Данные пользователей
  const users = ref<User[]>([])
  const usersLoaded = ref(false)

  // Установка пользователей
  const setUsers = (_users: User[]) => {
    users.value = _users
    usersLoaded.value = true
  }

  // Очистка кэша (при логауте)
  const clearCache = () => {
    users.value = []
    usersLoaded.value = false
  }

  return {
    users,
    usersLoaded,
    setUsers,
    clearCache
  }
})
