<script setup lang="ts">
import Sidebar from '../components/layout/Sidebar.vue';
</script>

<template>
  <div class="flex min-h-screen">
    <Sidebar />
    <main class="flex-1 bg-[#EFEFEF] p-6">
      <router-view />
    </main>
  </div>
</template>
