// 引入Vue
import Vue from 'vue';
// 引入vue-router
import VueRouter from 'vue-router';

// 引入所有的路由组件 routes
import routes from './routes';

// 声明使用插件
Vue.use(VueRouter);

// 创建路由器对象,并暴露出去
const router = new VueRouter({
  mode: 'history', // history---地址栏中没有#  hash ----地址栏中带有#
  routes,
});

// 前置路由守卫
router.beforeEach((to, from, next) => {
  // 如果访问的是登录页，直接放行
  if (to.path === '/login') return next();
  // 从 sessionStorage取出保存的 token 判断
  const tokenStr = window.sessionStorage.getItem('token');
  // 如果没有token、强制跳转到登录页
  if (!tokenStr) return next('/login');
  next();
});

export default router;
