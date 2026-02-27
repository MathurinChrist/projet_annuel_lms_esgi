export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'fr', file: 'fr.json', name: 'Français' }
    ],

    lazy: true,

    // ✅ CORRECTION ICI
    langDir: 'locales',

    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
  },

  app: {
    head: {
      title: 'EduPulse LMS',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    }
  },

  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  },

  future: {
    compatibilityVersion: 4,
  }
})