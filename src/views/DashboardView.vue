<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboard } from '../composables/useDashboard';
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next';

const { stats, reports, loading, error, fetchDashboardStats } = useDashboard();

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Belum Diproses';
    case 'APPROVED': return 'Disetujui';
    case 'REJECTED': return 'Ditolak';
    case 'SOLVED': return 'Selesai';
    default: return status;
  }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
};

onMounted(() => {
  fetchDashboardStats();
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

    <div v-if="loading" class="text-gray-500">Loading stats...</div>
    <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>
    
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Users Card -->
      <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 border border-gray-100">
        <div class="p-3 bg-blue-100 rounded-full">
          <Users class="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <p class="text-gray-500 text-sm">Total Users</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.countUser }}</p>
        </div>
      </div>

      <!-- Pending Reports -->
      <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 border border-gray-100">
        <div class="p-3 bg-yellow-100 rounded-full">
          <AlertCircle class="w-8 h-8 text-yellow-600" />
        </div>
        <div>
          <p class="text-gray-500 text-sm">Pending Reports</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.countReportPending }}</p>
        </div>
      </div>

      <!-- Approved Reports -->
      <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 border border-gray-100">
        <div class="p-3 bg-green-100 rounded-full">
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
        <div>
          <p class="text-gray-500 text-sm">Approved Reports</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.countReportSolved + stats.countReportApproved }}</p>
          <p class="text-xs text-gray-400" v-if="stats.countReportSolved > 0">Includes {{ stats.countReportSolved }} Solved</p>
        </div>
      </div>

      <!-- Rejected Reports -->
      <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 border border-gray-100">
        <div class="p-3 bg-red-100 rounded-full">
          <XCircle class="w-8 h-8 text-red-600" />
        </div>
        <div>
          <p class="text-gray-500 text-sm">Rejected Reports</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.countReportRejected }}</p>
        </div>
      </div>

    </div>

    <!-- Reports List Section -->
    <div class="mt-8">
       <h2 class="text-xl font-bold text-gray-800 mb-4">Laporan Terbaru</h2>
       
       <div v-if="reports.length" class="space-y-4">
         <div v-for="report in reports" :key="report.id" class="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
           
           <!-- Image Section -->
           <div class="w-full md:w-1/3 lg:w-1/4 h-48 md:h-auto relative flex-shrink-0 bg-gray-100">
             <img :src="report.photoUrl" class="w-full h-full object-contain" onerror="this.src='/placeholder.png'" alt="Report Image" />
             <div class="absolute top-4 left-4">
                <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" />
             </div>
           </div>

           <!-- Content Section -->
           <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                 <h3 class="text-blue-500 font-semibold text-sm md:text-base mb-1">
                    {{ report.addressText || 'Lokasi tidak tersedia' }}
                 </h3>
                 <p class="text-gray-700 text-sm mb-4">
                    {{ report.description || 'Tidak ada deskripsi' }}
                 </p>
                 <p class="text-gray-600 text-sm">
                    Pelapor : {{ report.user?.name || 'Anonymous' }}
                 </p>
              </div>

              <div class="flex flex-col md:flex-row items-start md:items-end justify-between mt-4">
                 <div class="flex items-center space-x-2">
                    <span class="px-4 py-1.5 bg-gray-500 text-white text-xs font-medium rounded">
                       {{ getStatusText(report.status) }}
                    </span>
                 </div>

                 <div class="text-right mt-2 md:mt-0">
                    <p class="text-gray-500 text-xs">Dilaporkan pada</p>
                    <p class="text-gray-700 text-sm">{{ formatDate(report.created_at) }}</p>
                 </div>
              </div>
           </div>

         </div>
       </div>
       <div v-else class="text-center py-10 bg-gray-50 rounded border border-gray-200">
           <p class="text-gray-500">No reports found.</p>
       </div>
    </div>
  </div>
</template>
