// 引入 每个路由组件
import Login from '../pages/Login.vue';
import Home from '../pages/Home.vue';
import Welcome from '../pages/Welcome.vue';

import Users from '../pages/user/Users.vue'; // 用户列表组件
import Rights from '../pages/power/Rights.vue'; // 权限列表组件
import Roles from '../pages/power/Roles.vue'; // 角色列表组件
import Cate from '../pages/goods/Cate.vue'; // 商品分类
import Params from '../pages/goods/Params.vue'; // 分类参数
import GoodsList from '../pages/goods/List.vue'; // 商品列表
import Add from '../pages/goods/Add.vue'; // 商品列表 --> 添加商品
import Order from '../pages/order/Order.vue'; // 订单列表
import Report from '../pages/report/Reprot.vue'; // 数据报表

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
      {
        path: '/rights',
        component: Rights,
      },
      {
        path: '/roles',
        component: Roles,
      },
      {
        path: '/categories',
        component: Cate,
      },
      {
        path: '/params',
        component: Params,
      },
      {
        path: '/goods',
        component: GoodsList,
      },
      {
        path: '/goods/add',
        component: Add,
      },
      {
        path: '/orders',
        component: Order,
      },
      {
        path: '/reports',
        component: Report,
      },
    ],
  },
];
