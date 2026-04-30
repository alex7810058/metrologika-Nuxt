<template>

  <Card>
    <template #content>
      <div class="page-header">
        <div class="page-header__title">
          <h1>Пользователи</h1>
        </div>
        <div class="page-header__buttons">
          <Button icon="pi pi-plus" variant="outlined" severity="secondary" label="Добавить" @click="showUserDialog('create', {})"/>
        </div>
      </div>
      <DataTable
        :value="users"
        stripedRows
        tableStyle="min-width: 50rem"
      >
        <Column field="id" header="ID" class="width-1" />
        <Column field="name" header="Имя" />
        <Column header="Роль">
          <template #body="{ data }">
            {{ cacheStore.rolesById[data.role_id]?.ru_name }}
          </template>
        </Column>
        <Column field="email" header="Email" />
        <Column field="created_at" header="Дата создания">
          <template #body="{ data }">
            {{ new Date(data.created_at).toLocaleDateString('ru-RU') }}
          </template>
        </Column>
        <Column class="width-1">
          <template #body="{ data }">
            <div class="buttons">
              <Button icon="pi pi-pen-to-square" class="mr-2" severity="secondary" rounded text @click="showUserDialog('update', data)"/>
              <Button icon="pi pi-times" severity="secondary" rounded text />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <UserDialog/>

</template>

<script setup lang="ts">
// Авто-редирект если не залогинен (middleware)
definePageMeta({middleware: 'auth'})

const appStore = useAppStore()
const cacheStore = useCacheStore()

import UserDialog from '~/components/dialogs/UserDialog.vue'

// Получаем пользователей из кэша
const users = computed(() => cacheStore.users)

const showUserDialog = (method: string, data: any) => {
  appStore.setUserDialog({
    show: true,
    method,
    data: {...data},
    dataOriginal: {...data}
  })
}
</script>
