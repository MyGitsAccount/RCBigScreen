import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// 配置路由信息
// 配置路由信息
const routes: RouteRecordRaw[] = [
  { path: '/login', component: () => import('@/pages/Login/index.vue') },
  {
    path: '/dashboard',
    component: () => import('@/pages/Home/index.vue'),
    children: [
      {
        path: '/dashboard/BreedConservation',
        component: () => import('@/pages/Home/BreedConservation/index.vue'),
      },
      {
        path: '/dashboard/Cultivation',
        component: () => import('@/pages/Home/Cultivation/index.vue'),
      },
      {
        path: '/dashboard/Circulation',
        component: () => import('@/pages/Home/Circulation/index.vue'),
      },
      {
        path: '/dashboard/Process',
        component: () => import('@/pages/Home/Process/index.vue'),
      },
      {
        path: '/dashboard/Brand',
        component: () => import('@/pages/Home/Brand/index.vue'),
      },
      {
        path: '/dashboard/Supervision',
        component: () => import('@/pages/Home/Supervision/index.vue'),
      },
      {
        path: '/dashboard/Feces',
        component: () => import('@/pages/Home/Feces/index.vue'),
      },
    ],
  },
  {
    //在地址为空时，直接跳转Login路由
    path: '',
    redirect: '/dashboard/BreedConservation',
  },
];

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

export default router;
