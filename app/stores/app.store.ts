import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCompact = ref<boolean>(true)

  const setSidebarCompact = (_value: boolean) => sidebarCompact.value = _value

  return {
    sidebarCompact,

    setSidebarCompact
  }
})
