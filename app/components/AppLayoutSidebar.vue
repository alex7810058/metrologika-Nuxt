<template>
  <div
    class="app-layout-sidebar"
  >
    <Card>
      <template #content>
        <Menu :model="items">
          <template #item="{ item, props }">
            <router-link v-slot="{ href, navigate }" :to="item.route" custom>
              <a :href="href" v-bind="props.action" @click="navigate">
                <span :class="item.icon"/>
                <span class="ml-2">{{ item.label }}</span>
              </a>
            </router-link>
          </template>
        </Menu>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from 'vue-router'

const router = useRouter()

const items = ref([
  {
    label: 'Главная',
    icon: 'pi pi-palette',
    route: '/'
  },
  {
    label: 'Пользователи',
    icon: 'pi pi-users',
    route: '/users'
  }
])
</script>
