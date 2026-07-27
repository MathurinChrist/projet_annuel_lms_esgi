export default defineWebSocketHandler({
  open(peer) {
    const rawUrl = String((peer.request as any)?.url ?? '')
    const qs = rawUrl.includes('?') ? rawUrl.split('?')[1] : ''
    const token = new URLSearchParams(qs).get('token')
    if (!token) { peer.close(1008, 'Unauthorized'); return }
    try {
      const payload = verifyToken(token)
      ;(peer as any)._userId = payload.userId
      wsClients.set(payload.userId, peer)
    } catch {
      peer.close(1008, 'Invalid token')
    }
  },
  close(peer) {
    const userId = (peer as any)._userId as number | undefined
    if (userId) wsClients.delete(userId)
  },
  error(peer) {
    const userId = (peer as any)._userId as number | undefined
    if (userId) wsClients.delete(userId)
  },
})
