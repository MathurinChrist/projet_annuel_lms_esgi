<template>
  <div class="h-screen bg-[#F8FAFC] flex overflow-hidden">
    <LayoutTheSidebar />
    <main class="flex-1 lg:ml-64 flex flex-col min-w-0 overflow-hidden">
      <LayoutTheTopBar />
      <slot />
    </main>
  </div>
</template>

<script setup>
</script>
