<template>
  <div class="space-y-8">
    <DashboardWelcomeHeader
      :goal-percent="dashboard?.goalPercent ?? 0"
      :active-range="range"
      @range-change="handleRangeChange"
    />
    <DashboardStatsGrid :stats="dashboard?.stats ?? null" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <DashboardActivityChart :activity="dashboard?.activity ?? []" />
        <DashboardCourseList />
      </div>
      <DashboardSidebarWidgets :recent-activity="dashboard?.recentActivity ?? []" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'home-redirect' })

const student = useStudentCourse();
const dashboard = ref(null);
const range = ref('7');

async function loadDashboard() {
  try {
    dashboard.value = await student.getDashboard(Number(range.value));
  } catch {
    dashboard.value = null;
  }
}

function handleRangeChange(key) {
  range.value = key;
  loadDashboard();
}

onMounted(loadDashboard);
</script>

