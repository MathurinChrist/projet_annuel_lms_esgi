export default defineEventHandler((event) => {
  deleteCookie(event, 'token', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return { loggedOut: true }
})
