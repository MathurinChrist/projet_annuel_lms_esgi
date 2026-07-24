export function useUnreadMessages() {
  return useState<number>('unreadMessagesCount', () => 0)
}
