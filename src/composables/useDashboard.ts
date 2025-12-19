import { ref } from 'vue';
import axios from 'axios';
import { GET_ALL_REPORTS_URL } from '../core/apiUrls';

interface DashboardStats {
    countUser: number;
    countReportPending: number;
    countReportApproved: number;
    countReportRejected: number;
    countReportSolved: number;
}

export function useDashboard() {
    const stats = ref<DashboardStats | null>(null);
    const reports = ref<any[]>([]); // Using any[] to match the implicit type from axios, or import Report type if available
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchDashboardStats = async () => {
        loading.value = true;
        error.value = null;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(GET_ALL_REPORTS_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                const reportsData: any[] = response.data.data;
                reports.value = reportsData;

                // Calculate stats from reports list
                const pending = reportsData.filter(r => r.status === 'PENDING').length;
                const approved = reportsData.filter(r => r.status === 'APPROVED').length;
                const rejected = reportsData.filter(r => r.status === 'REJECTED').length;
                const solved = reportsData.filter(r => r.status === 'SOLVED').length;

                // Count unique users who submitted reports (best effort for now)
                const uniqueUsers = new Set(reportsData.map(r => r.user?._id || r.userId)).size;

                stats.value = {
                    countUser: uniqueUsers,
                    countReportPending: pending,
                    countReportApproved: approved,
                    countReportRejected: rejected,
                    countReportSolved: solved
                };
            } else {
                error.value = 'Failed to load data';
            }
        } catch (err: any) {
            error.value = err.message || 'An error occurred';
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    return {
        stats,
        reports,
        loading,
        error,
        fetchDashboardStats
    };
}
