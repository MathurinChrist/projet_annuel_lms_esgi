<template>
  <div class="min-h-screen bg-[#F8FAFC] flex">
    <LayoutTheSidebar />

    <main class="flex-1 lg:ml-64 transition-all">
      <LayoutTheTopBar />

      <div class="p-8 max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
// Layout components are auto-imported in Nuxt
</script>

