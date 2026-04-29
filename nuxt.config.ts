import { Theme } from './primevue.theme'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@primevue/nuxt-module',
    'nuxt-auth-utils',
    '@pinia/nuxt'
  ],
  ssr: false,
  css: ['~/styles/app.scss'],
  primevue: {
    options: {
      theme: {
        preset: Theme, // Используем наш пресет
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    }
  },
})
