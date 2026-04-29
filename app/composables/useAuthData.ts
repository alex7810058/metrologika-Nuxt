import type { User } from '~/types'

/**
 * Композабл для загрузки всех необходимых данных после авторизации
 * Используется как при логине, так и при обновлении страницы (восстановлении сессии)
 */
export function useAuthData() {
  const cacheStore = useCacheStore()

  /**
   * Загружает все необходимые данные для авторизованного пользователя
   * @param options Опции загрузки
   * @param options.users - загрузить список пользователей (по умолчанию true)
   */
  async function loadAuthData(options: { users?: boolean } = {}) {
    const { users = true } = options

    try {
      await Promise.all([
        users ? $fetch<User[]>('/api/users').then(users => cacheStore.setUsers(users)) : Promise.resolve()
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
