import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {

  // Сайдбар
  const sidebarCompact = ref<boolean>(false)
  const setSidebarCompact = (_value: boolean) => sidebarCompact.value = _value

  // Диалоговое окно пользователя
  const userDialogDefaultValue = {
    show: false,
    method: '',
    data: <any>{},
    dataOriginal: <any>{}
  }
  const userDialog = ref(userDialogDefaultValue)
  const setUserDialog = (_value: any) => userDialog.value = _value
  const closeUserDialog = () => userDialog.value = userDialogDefaultValue

  return {
    sidebarCompact,
    setSidebarCompact,

    userDialog,
    setUserDialog,
    closeUserDialog
  }
})
