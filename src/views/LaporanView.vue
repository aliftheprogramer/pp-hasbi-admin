<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useReports, type Report } from '../composables/useReports';
import { Check, X, CheckCircle } from 'lucide-vue-next';

const { reports, loading, error, fetchReports, updateReportStatus } = useReports();
const processingId = ref<string | null>(null);
const showNoteModal = ref(false);
const selectedReport = ref<Report | null>(null);
const targetStatus = ref<string>('');
const adminNote = ref('');

onMounted(() => {
  fetchReports();
});

const openActionModal = (report: Report, status: string) => {
  selectedReport.value = report;
  targetStatus.value = status;
  adminNote.value = '';
  showNoteModal.value = true;
};

const confirmAction = async () => {
  if (!selectedReport.value) return;
  
  processingId.value = selectedReport.value.id;
  const success = await updateReportStatus(selectedReport.value.id, targetStatus.value, adminNote.value);
  processingId.value = null;
  
  if (success) {
    showNoteModal.value = false;
    selectedReport.value = null;
  }
};

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
    // Format: 8/6/2025 12:50
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Laporan Masuk</h1>
      <button @click="fetchReports" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
        Refresh Data
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading && !reports.length" class="text-gray-500 text-center py-10">Loading reports...</div>
    <div v-if="error" class="text-red-500 mb-4 bg-red-50 p-3 rounded">
      {{ error }}
      <button @click="fetchReports" class="ml-2 underline text-red-700">Retry</button>
    </div>

    <!-- Reports List (Cards) -->
    <div v-if="reports.length" class="space-y-4">
      <div v-for="report in reports" :key="report.id" class="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
        
        <!-- Image Section -->
        <div class="w-full md:w-1/3 lg:w-1/4 h-48 md:h-auto relative flex-shrink-0">
          <img :src="report.photoUrl" class="w-full h-full object-cover" onerror="this.src='/placeholder.png'" alt="Report Image" />
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
                 
                 <!-- Action Buttons (Mini) -->
                 <div class="flex space-x-1" v-if="report.status === 'PENDING'">
                    <button @click="openActionModal(report, 'APPROVED')" class="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Approve">
                       <Check class="w-4 h-4" />
                    </button>
                    <button @click="openActionModal(report, 'REJECTED')" class="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject">
                       <X class="w-4 h-4" />
                    </button>
                 </div>
                 <div class="flex space-x-1" v-if="report.status === 'APPROVED'">
                    <button @click="openActionModal(report, 'SOLVED')" class="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Mark Solved">
                       <CheckCircle class="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div class="text-right mt-2 md:mt-0">
                 <p class="text-gray-500 text-xs">Dilaporkan pada</p>
                 <p class="text-gray-700 text-sm">{{ formatDate(report.created_at) }}</p>
              </div>
           </div>
        </div>

      </div>
    </div>
    <div v-else-if="!loading" class="text-center py-10 bg-gray-50 rounded border border-gray-200">
        <p class="text-gray-500">No reports found.</p>
    </div>

    <!-- Action Modal -->
    <div v-if="showNoteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold mb-4 text-gray-800">
           {{ targetStatus === 'APPROVED' ? 'Approve Report' : targetStatus === 'REJECTED' ? 'Reject Report' : 'Mark as Solved' }}
        </h3>
        
        <p class="mb-4 text-sm text-gray-600">
          You are about to modify the status of this report. You can add an optional note.
        </p>

        <textarea v-model="adminNote" 
                  class="w-full border border-gray-300 rounded p-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  rows="3" 
                  placeholder="Admin note (optional)..."></textarea>
        
        <div class="flex justify-end space-x-3">
          <button @click="showNoteModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button @click="confirmAction" 
                  :disabled="!!processingId"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center">
            <span v-if="processingId === selectedReport?.id" class="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
            Confirm
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
