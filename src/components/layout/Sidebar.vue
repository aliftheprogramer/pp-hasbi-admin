<script setup lang="ts">
import { LayoutDashboard, FileText, LogOut, Map } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';

const { logout } = useAuth();
const route = useRoute();

const isActive = (path: string) => {
  return route.path === path;
};

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Map', path: '/map', icon: Map },

  { name: 'Laporan', path: '/laporan', icon: FileText },
];
</script>

<template>
  <aside class="w-[250px] bg-white h-screen flex flex-col p-6 shadow-[2px_0_5px_rgba(0,0,0,0.05)] sticky top-0">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-blue-500">Laporkan</h1>
    </div>

    <div class="flex items-center p-3 mb-8">
        <div class="w-10 h-10 rounded-full overflow-hidden mr-3">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" alt="Admin" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col flex-1">
            <span class="font-semibold text-sm text-gray-900">Name</span>
            <span class="text-xs text-gray-400">Admin</span>
        </div>
        <div class="text-gray-400">
            &gt;
        </div>
    </div>

    <nav class="flex-1">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.path">
          <router-link 
            :to="item.path" 
            class="flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium"
            :class="[
              isActive(item.path) 
                ? 'text-blue-500' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-blue-500'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="mt-auto">
        <button @click="logout" class="flex items-center w-full px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left">
            <LogOut class="w-5 h-5 mr-3" />
            <span>Keluar</span>
        </button>
    </div>
  </aside>
</template>
