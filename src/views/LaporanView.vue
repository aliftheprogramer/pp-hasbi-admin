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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'text-green-600 bg-green-100';
    case 'REJECTED': return 'text-red-600 bg-red-100';
    case 'SOLVED': return 'text-blue-600 bg-blue-100';
    default: return 'text-yellow-600 bg-yellow-100';
  }
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

    <!-- Table -->
    <div v-if="reports.length" class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Info</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="report in reports" :key="report.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ report.fishReference?.name || 'Unknown Fish' }}</div>
                <div class="text-sm text-gray-500 mt-1 line-clamp-2">{{ report.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ report.user?.name || 'Anonymous' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <a :href="report.photoUrl" target="_blank" class="block w-16 h-16 rounded overflow-hidden border border-gray-200">
                  <img :src="report.photoUrl" class="w-full h-full object-cover" onerror="this.src='/placeholder.png'" alt="Reported fish" />
                </a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusColor(report.status)]">
                  {{ report.status }}
                </span>
                <div v-if="report.adminNote" class="text-xs text-gray-500 mt-1 max-w-[150px] truncate" :title="report.adminNote">
                  Note: {{ report.adminNote }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1 sm:space-y-0 sm:space-x-1 flex flex-col sm:flex-row">
                 <!-- Actions for PENDING -->
                 <template v-if="report.status === 'PENDING'">
                    <button @click="openActionModal(report, 'APPROVED')" 
                            class="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs flex items-center justify-center">
                      <Check class="w-3 h-3 mr-1" /> Approve
                    </button>
                    <button @click="openActionModal(report, 'REJECTED')" 
                            class="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs flex items-center justify-center">
                      <X class="w-3 h-3 mr-1" /> Reject
                    </button>
                 </template>
                 
                 <!-- Actions for APPROVED -->
                 <template v-if="report.status === 'APPROVED'">
                    <button @click="openActionModal(report, 'SOLVED')" 
                            class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs flex items-center justify-center">
                      <CheckCircle class="w-3 h-3 mr-1" /> Mark Solved
                    </button>
                 </template>

                 <!-- No actions for REJECTED or SOLVED unless we want to allow reverting? Assuming standard flow for now -->
              </td>
            </tr>
          </tbody>
        </table>
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
