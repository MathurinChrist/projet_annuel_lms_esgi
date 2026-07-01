<template>
  <div class="space-y-8">
    <DashboardWelcomeHeader />
    <DashboardStatsGrid />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <DashboardActivityChart />
        <DashboardCourseList />
      </div>
      <DashboardSidebarWidgets />
    </div>
  </div>
</template>

<script setup>
</script>

