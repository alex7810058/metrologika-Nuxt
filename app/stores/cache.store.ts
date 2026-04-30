import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, Role } from '~/types'

export const useCacheStore = defineStore('cache', () => {

  // Пользователи
  const users = ref<User[]>([])
  const usersById = ref<Record<any, User>>({})
  const usersLoaded = ref(false)

  // Установка пользователей
  const setUsers = (data: User[]) => {
    users.value = data
    const byId: Record<string, User> = {}
    data.forEach((item: User) => byId[String(item.id)] = item)
    usersById.value = byId
    usersLoaded.value = true
  }

  // Роли
  const roles = ref<Role[]>([])
  const rolesById = ref<Record<any, Role>>({})
  const rolesLoaded = ref(false)

  // Установка ролей
  const setRoles = (data: Role[]) => {
    roles.value = data
    const byId: Record<string, Role> = {}
    data.forEach((item: Role) => byId[String(item.id)] = item)
    rolesById.value = byId
    rolesLoaded.value = true
  }

  // Очистка кэша (при логауте)
  const clearCache = () => {
    users.value = []
    usersLoaded.value = false
    roles.value = []
    rolesLoaded.value = false
  }

  return {
    users,
    usersById,
    usersLoaded,
    setUsers,
    roles,
    rolesById,
    rolesLoaded,
    setRoles,
    clearCache
  }
})
