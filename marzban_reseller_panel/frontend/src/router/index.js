import { createRouter, createWebHistory } from 'vue-router';

import { useAdminAuthStore } from '@/store/adminAuth';
import { useResellerAuthStore } from '@/store/resellerAuth'; // Import reseller auth store
import AdminLayout from '@/layouts/AdminLayout.vue';
import ResellerLayout from '@/layouts/ResellerLayout.vue'; // Import ResellerLayout

// View components
import AdminLoginView from '../views/admin/AdminLogin.vue';
import AdminDashboardView from '../views/admin/AdminDashboard.vue';
import MarzbanPanelListVue from '../views/admin/marzban_panels/MarzbanPanelList.vue';
import ResellerListView from '../views/admin/resellers/ResellerList.vue';
import PricingPlanListVue from '../views/admin/pricing_plans/PricingPlanList.vue';
import ResellerPricingManagementVue from '../views/admin/reseller_pricings/ResellerPricingManagement.vue';
import PaymentReceiptListVue from '../views/admin/payment_receipts/PaymentReceiptList.vue';
import AdminReportsViewVue from '../views/admin/reports/AdminReportsView.vue';
import AdminSyncViewVue from '../views/admin/sync/AdminSyncView.vue';
import ResellerLoginView from '../views/reseller/ResellerLogin.vue';
import ResellerDashboardView from '../views/reseller/ResellerDashboard.vue';
import ResellerProfileViewVue from '../views/reseller/ResellerProfileView.vue';
import ResellerWalletViewVue from '../views/reseller/ResellerWalletView.vue';
import ResellerUserListView from '../views/reseller/users/UserList.vue'; // Import Reseller UserList

// A general Home/Landing page if needed, or redirect immediately
// import HomeView from '../views/Home.vue';

const routes = [
  {
    path: '/',
    redirect: '/admin/login',
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginView,
    meta: { requiresGuest: true } // For redirecting logged-in users
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboardView,
        meta: { requiresAdminAuth: true },
      },
      {
        path: 'marzban-panels', // New route for Marzban panels
        name: 'AdminMarzbanPanels',
        component: MarzbanPanelListVue,
        meta: { requiresAdminAuth: true },
      },
      {
        path: 'resellers', // New route for Reseller management by admin
        name: 'AdminResellers',
        component: ResellerListView,
        meta: { requiresAdminAuth: true },
      },
      {
        path: 'pricing-plans', // New route for Pricing Plans by admin
        name: 'AdminPricingPlans',
        component: PricingPlanListVue,
        meta: { requiresAdminAuth: true },
      },
      {
        path: 'reseller-pricing', // New route for Reseller Pricing by admin
        name: 'AdminResellerPricing',
        component: ResellerPricingManagementVue,
        meta: { requiresAdminAuth: true },
      },
      {
        path: 'payment-receipts', // New route for Payment Receipts by admin
        name: 'AdminPaymentReceipts',
        component: PaymentReceiptListVue,
        meta: { requiresAdminAuth: true },
      },
      {
        path: 'reports', // New route for Admin Reports
        name: 'AdminReports',
        component: AdminReportsViewVue,
        meta: { requiresAdminAuth: true },
      },
      {
        path: 'sync', // New route for Admin Sync
        name: 'AdminSync',
        component: AdminSyncViewVue,
        meta: { requiresAdminAuth: true },
      },
      // Add other admin routes here that should use AdminLayout
      // Example:
      // {
      //   path: 'users',
      //   name: 'AdminUsers',
      //   component: () => import('@/views/admin/AdminUsers.vue'), // Lazy load example
      //   meta: { requiresAdminAuth: true },
      // }
    ]
  },
  // Reseller routes
  {
    path: '/reseller/login',
    name: 'ResellerLogin',
    component: ResellerLoginView,
    meta: { requiresGuestReseller: true } // For redirecting logged-in resellers
  },
  {
    path: '/reseller',
    component: ResellerLayout,
    children: [
      {
        path: 'dashboard',
        name: 'ResellerDashboard',
        component: ResellerDashboardView,
        meta: { requiresResellerAuth: true },
      },
      {
        path: 'profile', // New route for Reseller Profile
        name: 'ResellerProfile',
        component: ResellerProfileViewVue,
        meta: { requiresResellerAuth: true },
      },
      {
        path: 'wallet', // New route for Reseller Wallet
        name: 'ResellerWallet',
        component: ResellerWalletViewVue,
        meta: { requiresResellerAuth: true },
      },
      {
        path: 'users', // New route for Reseller User Management
        name: 'ResellerUsers',
        component: ResellerUserListView,
        meta: { requiresResellerAuth: true },
      },
      // Add other reseller routes here that should use ResellerLayout
      // Example:
      // {
      //   path: 'clients',
      //   name: 'ResellerClients',
      //   component: () => import('@/views/reseller/ResellerClients.vue'),
      //   meta: { requiresResellerAuth: true },
      // }
    ]
  },
  // Catch-all route for 404 Not Found (optional)
  // {
  //   path: '/:catchAll(.*)*',
  //   name: 'NotFound',
  //   component: () => import('../views/NotFound.vue'), // Lazy load
  // }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/'),
  routes,
});

// Refined Navigation Guard
router.beforeEach(async (to, from, next) => {
  const adminAuthStore = useAdminAuthStore();
  const resellerAuthStore = useResellerAuthStore();

  // Initialize admin auth state if token exists in localStorage but not in store
  if (!adminAuthStore.token && localStorage.getItem('admin_token')) {
    await adminAuthStore.checkAuth();
  }
  const isAdminAuthenticated = adminAuthStore.isAuthenticated;

  // Initialize reseller auth state if token exists in localStorage but not in store
  if (!resellerAuthStore.token && localStorage.getItem('reseller_token')) {
    await resellerAuthStore.checkAuth();
  }
  const isResellerAuthenticated = resellerAuthStore.isAuthenticated;

  // Admin route protection
  if (to.matched.some(record => record.meta.requiresAdminAuth)) {
    if (!isAdminAuthenticated) {
      next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } else if (to.name === 'AdminLogin' && isAdminAuthenticated) {
    next({ name: 'AdminDashboard' });
  }
  // Reseller route protection
  else if (to.matched.some(record => record.meta.requiresResellerAuth)) {
    if (!isResellerAuthenticated) {
      next({ name: 'ResellerLogin', query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } else if (to.name === 'ResellerLogin' && isResellerAuthenticated) {
    next({ name: 'ResellerDashboard' });
  }
  // Allow access to other routes
  else {
    next();
  }
});

export default router;
