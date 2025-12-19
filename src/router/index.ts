import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import BlankLayout from '../layouts/BlankLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import LaporanView from '../views/LaporanView.vue'
import MapView from '../views/MapView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/auth',
            component: BlankLayout,
            children: [
                {
                    path: 'login',
                    name: 'login',
                    component: LoginView
                }
            ]
        },
        {
            path: '/',
            component: DefaultLayout,
            redirect: '/dashboard',
            meta: { requiresAuth: true },
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: DashboardView,
                },
                {
                    path: 'map',
                    name: 'map',
                    component: MapView,
                },
                {
                    path: 'laporan',
                    name: 'laporan',
                    component: LaporanView,
                },
            ],
        },
    ],
})

router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('token');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !token) {
        next('/auth/login');
    } else if (to.path === '/auth/login' && token) {
        next('/dashboard');
    } else {
        next();
    }
});

export default router
