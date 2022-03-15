// 引入 每个路由组件
import Login from '../pages/Login.vue';
import Home from '../pages/Home.vue';

// 暴露路由数组对象
export default [
  {
    path: '/',
    redirect: '/login', // 重定向
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/home',
    component: Home,
  },
];
