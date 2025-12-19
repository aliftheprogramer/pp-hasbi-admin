import { ref } from 'vue';
import axios from 'axios';
import { GET_REPORTS_URL, MAP_LAPORAN_URL, PUT_STATUS_URL } from '../core/apiUrls';

export interface FishReference {
    name: string;
    dangerLevel?: string;
}

export interface UserReference {
    name: string;
}

export interface Report {
    id: string;
    latitude?: number;
    longitude?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLVED';
    photoUrl: string;
    description?: string;
    fishReference?: FishReference;
    user?: UserReference;
    adminNote?: string;
    updatedAt?: string;
    addressText?: string;
    created_at?: string;
}

export function useReports() {
    const reports = ref<Report[]>([]);
    const mapReports = ref<Report[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    };

    const fetchReports = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(GET_REPORTS_URL, { headers: getAuthHeader() });
            if (response.data.success) {
                reports.value = response.data.data;
            } else {
                error.value = 'Failed to load reports';
            }
        } catch (err: any) {
            error.value = err.message || 'An error occurred';
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchMapReports = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(MAP_LAPORAN_URL, { headers: getAuthHeader() });
            if (response.data.success) {
                mapReports.value = response.data.data;
            } else {
                error.value = 'Failed to load map data';
            }
        } catch (err: any) {
            error.value = err.message || 'An error occurred';
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const updateReportStatus = async (id: string, status: string, adminNote?: string) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.put(
                PUT_STATUS_URL.replace(':id', id),
                { status, adminNote },
                { headers: getAuthHeader() }
            );
            if (response.data.success) {
                // Update local state for both lists to reflect changes immediately
                const updateItem = (item: Report) => {
                    if (item.id === id) {
                        item.status = response.data.data.status;
                        item.adminNote = response.data.data.adminNote;
                    }
                    return item;
                };
                reports.value = reports.value.map(updateItem);
                mapReports.value = mapReports.value.map(updateItem);
                return true;
            }
            return false;
        } catch (err: any) {
            error.value = err.message || 'Failed to update status';
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        reports,
        mapReports,
        loading,
        error,
        fetchReports,
        fetchMapReports,
        updateReportStatus
    };
}
