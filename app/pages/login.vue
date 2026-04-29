<template>
  <div class="auth-layout">
    <img class="bg" src="~/assets/images/bg.jpg" alt="" />
    <form class="login-form" @submit.prevent="login" autocomplete="off">
      <div class="login-form__header">
        <img src="~/assets/images/logo_light.png" alt=""/>
      </div>
      <div class="login-form__body">
        <div class="form-item">
          <FloatLabel variant="on">
            <InputText id="email" v-model="email" autocomplete="off"/>
            <label for="email">Email</label>
          </FloatLabel>
        </div>
        <div class="form-item">
          <FloatLabel variant="on">
            <InputText id="password" v-model="password" autocomplete="off" style="-webkit-text-security: disc"/>
            <label for="password">Пароль</label>
          </FloatLabel>
        </div>
      </div>
      <div class="login-form__footer">
        <div class="more">
          <div class="more-item">
            <Checkbox inputId="remember" v-model="remember" :binary="true" />
            <label for="remember">Запомнить меня</label>
          </div>
          <div class="more-item">
            <a class="link">Забыли пароль?</a>
          </div>
        </div>
        <Button label="Войти" type="submit"/>
      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })
const email = ref('root')
const password = ref('root')
const remember = ref(false)
const error = ref('')
const router = useRouter() // Импортируем роутер, если его нет

// Получаем refreshSession из композабла
const {fetch: refreshSession} = useUserSession()

async function login() {
  // Сбрасываем предыдущую ошибку
  error.value = ''

  try {
    // 1. Отправляем запрос на сервер для установки сессии
    await $fetch('/api/login', {
      method: 'POST',
      body: {email: email.value, password: password.value, remember: remember.value}
    })

    // 2. КЛЮЧЕВОЙ МОМЕНТ: принудительно обновляем состояние сессии на клиенте
    await refreshSession()

    // 3. Перенаправляем на главную страницу
    await router.push('/') // или используйте navigateTo('/')

  }
  catch (err: any) {
    // Обработка ошибки входа
    error.value = err.data?.message || 'Invalid login credentials'
  }
}
</script>
