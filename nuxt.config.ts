export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      Lexend: [300, 400, 500, 600, 700, 800, 900],
      'Playfair Display': [500, 600, 700],
      'Great Vibes': [400],
      'Cormorant Garamond': [500, 600, 700],
    },
    display: 'swap',
    download: process.env.NODE_ENV === 'production' && process.env.CI !== 'true',
  },

  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'fr', file: 'fr.json', name: 'Français' }
    ],
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
    jwtSecret: process.env.JWT_SECRET || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    livekitApiKey: process.env.LIVEKIT_API_KEY || 'devkey',
    livekitApiSecret: process.env.LIVEKIT_API_SECRET || 'devsecret',
    livekitHost: process.env.LIVEKIT_HOST || 'http://livekit:7880',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    public: {
      apiBase: '/api',
      livekitUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880',
    }
  },

  nitro: {
    externals: {
      inline: ['livekit-server-sdk'],
      external: ['pdfkit'],
    },
    experimental: {
      websocket: true,
    },
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
  },

  future: {
    compatibilityVersion: 4,
  }
})
