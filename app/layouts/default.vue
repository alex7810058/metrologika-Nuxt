
<template>
  <div
    class="app-layout"
    :class="sidebarCompact ? 'app-layout--sidebar-compact' : ''"
  >
    <AppLayoutTopbar />
    <AppLayoutSidebar />
    <AppLayoutMainContainer>
      <slot />
    </AppLayoutMainContainer>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

const appStore = useAppStore()
const { sidebarCompact } = storeToRefs(appStore)

import AppLayoutTopbar from '~/components/AppLayoutTopbar.vue'
import AppLayoutSidebar from '~/components/AppLayoutSidebar.vue'
import AppLayoutMainContainer from '~/components/AppLayoutMainContainer.vue'
</script>
