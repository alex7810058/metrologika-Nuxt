<template>
  <div class="app-layout-topbar">
    <div class="app-layout-topbar-logo-container">
      <Button icon="pi pi-bars" aria-label="Меню" severity="secondary" rounded variant="text" size="large" @click="onClickMenuButton"/>
      <img class="logo" src="~/assets/images/logo_light.png" alt=""/>
    </div>
    <div class="app-layout-topbar-actions">

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app.store'
import { storeToRefs } from 'pinia'

const appStore = useAppStore()
const { sidebarCompact } = storeToRefs(appStore)
const { setSidebarCompact } = appStore

const onClickMenuButton = () => {
  console.log(sidebarCompact.value) // true/false
  setSidebarCompact(!sidebarCompact.value)
}
</script>
