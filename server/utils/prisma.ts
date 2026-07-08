import { PrismaClient } from '@prisma/client'

// On utilise un proxy pour que PrismaClient ne soit instancié que lors du premier accès
// Cela permet de s'assurer que les variables d'environnement (process.env ou runtimeConfig)
// sont bien chargées avant l'initialisation.

let _instance: PrismaClient | null = null

const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (!_instance) {
      _instance = new PrismaClient({
        errorFormat: 'pretty'
      })
    }

    const value = Reflect.get(_instance, prop, receiver)
    return typeof value === 'function' ? value.bind(_instance) : value
  }
})

export default prisma
