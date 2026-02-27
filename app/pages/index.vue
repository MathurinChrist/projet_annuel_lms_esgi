<template>
  <div class="space-y-8">
    <WelcomeHeader />
    <StatsGrid />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <ActivityChart />
        <CourseList />
      </div>
      <SidebarWidgets />
    </div>
  </div>
</template>

<script setup>
// Components are auto-imported in Nuxt
import ActivityChart from "~/components/dashboard/ActivityChart.vue";
import WelcomeHeader from "~/components/dashboard/WelcomeHeader.vue";
import StatsGrid from "~/components/dashboard/StatsGrid.vue";
import CourseList from "~/components/dashboard/CourseList.vue";
import SidebarWidgets from "~/components/dashboard/SidebarWidgets.vue";
</script>

