import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { LOGIN_URL } from '../core/apiUrls';

export function useAuth() {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const router = useRouter();

    const token = ref<string | null>(localStorage.getItem('token'));

    const isAuthenticated = computed(() => !!token.value);

    const login = async (payload: any) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(LOGIN_URL, payload);

            // Handle response structure: { success: true, data: { token: "..." } }
            const newToken = response.data?.data?.token || response.data?.token;

            if (newToken) {
                localStorage.setItem('token', newToken);
                token.value = newToken;
                router.push('/dashboard');
                return true;
            } else {
                error.value = 'Invalid credentials or missing token';
                return false;
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Login failed';
            return false;
        } finally {
            loading.value = false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        token.value = null;
        router.push('/auth/login');
    };

    return {
        isAuthenticated,
        loading,
        error,
        login,
        logout
    };
}
