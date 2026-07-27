<script setup>
/**
 * Ancienne URL détail → page unique (avec layout / sidebar).
 */
const route = useRoute()
const localePath = useLocalePath()

const code = decodeURIComponent(String(route.params.code || ''))

await navigateTo({
  path: localePath('/certificates'),
  query: code ? { code } : {},
}, { replace: true })
</script>

<template>
  <div class="py-24 flex justify-center">
    <div class="size-10 rounded-full border-4 border-slate-200 border-t-[#0A66C2] animate-spin" />
  </div>
</template>
