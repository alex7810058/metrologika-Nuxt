<template>
  <div class="auth-layout">
    <img class="bg" src="~/assets/images/bg.jpg" alt="" />
    <form
      class="login-form"
      @submit.prevent="login"
      autocomplete="off"
    >
      <div class="login-form__header">
        <img src="~/assets/images/logo_light.png" alt=""/>
      </div>
      <div class="login-form__body">
        <div class="form-item">
          <FloatLabel variant="on">
            <InputText
              id="email"
              v-model="formData.email"
              autocomplete="off"
              :invalid="errors.email"
              @input="checkForm('email')"
              @blur="checkForm('email')"
            />
            <label for="email">Email</label>
          </FloatLabel>
        </div>
        <div class="form-item">
          <FloatLabel variant="on">
            <InputText
              id="password"
              v-model="formData.password"
              autocomplete="off"
              style="-webkit-text-security: disc"
              :invalid="errors.password"
              @input="checkForm('password')"
              @blur="checkForm('password')"
            />
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
const formData = ref({
  email: '',
  password: ''
})
const remember = ref(false)
const error = ref('')
const router = useRouter()

const errors = ref({
  email: false,
  password: false
})

// Получаем refreshSession из композабла
const {fetch: refreshSession} = useUserSession()

// Импортием композабл для загрузки данных авторизации
const { loadAuthData } = useAuthData()

const checkForm = (field: string) => {
  // @ts-ignore
  if (!formData.value[field]) {
    // @ts-ignore
    errors.value[field] = true
  }
  // @ts-ignore
  else errors.value[field] = false
}

async function login() {
  // Сбрасываем предыдущую ошибку
  error.value = ''

  try {
    // Отправляем запрос логина
    const result = await $fetch('/api/users/login', {
      method: 'POST',
      body: {
        email: formData.value.email,
        password: formData.value.password,
        remember: remember.value
      }
    })
    // @ts-ignore
    if (!result.success) return

    // Принудительно обновляем состояние сессии на клиенте
    await refreshSession()

    // Загружаем все необходимые данные через централизованный композабл
    await loadAuthData()

    // Перенаправляем на главную страницу
    await router.push('/')

  }
  catch (err: any) {
    // Обработка ошибки входа
    error.value = err.data?.message || 'Invalid login credentials'
  }
}
</script>
