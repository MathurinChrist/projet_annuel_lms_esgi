import { H3Event } from 'h3'
import { Role } from '@prisma/client'

export const AUTHORIZED_ROLES = {
    ADMIN: [Role.ADMINISTRATEUR],
    TRAINER: [Role.ADMINISTRATEUR, Role.FORMATEUR],
    LEARNER: [Role.ADMINISTRATEUR, Role.FORMATEUR, Role.APPRENANT],
}

/**
 * Check if the user in the event has the required role.
 * 
 * @param event H3Event
 * @param roles Array of authorized roles
 * @throws 401 if user is not authenticated
 * @throws 403 if user doesn't have the required role
 */
export function ensureRole(event: H3Event, roles: Role[]) {
    const user = event.context.auth

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Non authentifié',
        })
    }

    if (!roles.includes(user.role)) {
        throw createError({
            statusCode: 403,
            statusMessage: "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource",
        })
    }
}

/**
 * Check if the user in the event is an admin
 */
export function ensureAdmin(event: H3Event) {
    ensureRole(event, AUTHORIZED_ROLES.ADMIN)
}

/**
 * Check if the user in the event is at least a trainer
 */
export function ensureTrainer(event: H3Event) {
    ensureRole(event, AUTHORIZED_ROLES.TRAINER)
}
