import type { User, Role } from '~/types'

/**
 * Композабл для загрузки всех необходимых данных после авторизации
 * Используется как при логине, так и при обновлении страницы (восстановлении сессии)
 */
export function useAuthData() {
  const cacheStore = useCacheStore()

  /**
   * Загружает все необходимые данные для авторизованного пользователя
   */
  async function loadAuthData() {
    try {
      await Promise.all([
        // @ts-ignore
        $fetch('/api/users/get', { method: 'POST' }).then((data: User[]) => cacheStore.setUsers(data)),
        // @ts-ignore
        $fetch('/api/roles/get', { method: 'POST' }).then((data: Role[]) => cacheStore.setRoles(data)),
      ])
    }
    catch (error) {
      console.error('Failed to load auth data:', error)
      throw error
    }
  }

  return {
    loadAuthData
  }
}
