export function useSaveStatus() {
  const isDirty = ref(false)
  function markDirty() { isDirty.value = true }
  function markSaved() { isDirty.value = false }
  return { isDirty, markDirty, markSaved }
}
