// 引入 每个路由组件
import Login from '../pages/Login.vue';
import Home from '../pages/Home.vue';
import Welcome from '../pages/Welcome.vue';

import Users from '../pages/user/Users.vue'; // 用户组件

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
    redirect: '/welcome', // 嵌套重定向到 welcome子路由组件
    children: [
      {
        path: '/welcome',
        component: Welcome,
      },
      {
        path: '/users', // 路径是服务器规定死的
        component: Users,
      },
    ],
  },
];