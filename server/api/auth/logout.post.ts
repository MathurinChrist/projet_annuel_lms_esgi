export default defineEventHandler((event) => {
  // Le cookie de session est httpOnly : seul le serveur peut le supprimer.
  deleteCookie(event, 'token', { path: '/' })

  return { loggedOut: true }
})
