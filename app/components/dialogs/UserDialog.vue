<template>
  <Dialog
    v-model:visible="appStore.userDialog.show"
    modal
    :draggable="false"
    :style="{ width: '30rem' }"
  >
    <template #header>
      <div class="title">
        <span class="text-small">Пользователь</span>
        {{ appStore.userDialog.method === 'create' ? 'Новый пользователь' : appStore.userDialog.dataOriginal?.name}}
      </div>
    </template>
    <div class="form-info" v-if="appStore.userDialog.method === 'update'">
      <div class="form-info-item">
        ID: {{ appStore.userDialog.data.id }}
      </div>
      <div class="form-info-item">
        Дата создания: {{ new Date(appStore.userDialog.data.created_at).toLocaleDateString('ru-RU') }}
      </div>
      <div class="form-info-item" v-if="appStore.userDialog.data.updated_at">
        Дата изменения: {{ new Date(appStore.userDialog.data.updated_at).toLocaleDateString('ru-RU') }}
      </div>
    </div>
    <form ref="userForm" @submit.prevent="submit" autocomplete="off" style="margin-top: 7px">
      <div class="form-item">
        <FloatLabel variant="on">
          <InputText id="email" v-model="appStore.userDialog.data.email" autocomplete="off" />
          <label for="email">Email</label>
        </FloatLabel>
      </div>
      <div class="form-item">
        <FloatLabel variant="on">
          <InputText id="password" v-model="appStore.userDialog.data.name" autocomplete="off" />
          <label for="password">Имя</label>
        </FloatLabel>
      </div>
      <div class="form-item">
        <FloatLabel variant="on">
          <Select
            v-model="appStore.userDialog.data.role_id"
            inputId="role"
            :options="cacheStore.roles"
            optionLabel="ru_name"
            optionValue="id"
            checkmark
            :highlightOnSelect="false"
          />
          <label for="role">Роль</label>
        </FloatLabel>
      </div>
    </form>
    <template #footer>
      <Button label="Отмена" text severity="secondary" @click="appStore.closeUserDialog()" />
      <Button label="Сохранить" autofocus type="button" @click="userForm!.requestSubmit()" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const cacheStore = useCacheStore()
const userForm = ref<HTMLFormElement | null>(null)

const submit = () => {
  console.log(1111)
}
</script>
