import Vue from 'vue';
import App from './App.vue';

// 引入路由器对象
import router from './router/index';
import './assets/css/global.css'; //引入全局样式
import './plugins/element'; //引入element-ui
import './api/index'; //引入axios

import moment from 'moment'; // monment.js插件
// 创建一个全局时间转换过滤器
Vue.filter('formonment', function (v, pattern) {
  return moment(v).format(pattern);
});

// import { format } from 'timeago.js'; //时间插件
// // 定义全局的过滤器 "changeTime":改变时间为几周前
// Vue.filter('changeTime', function (dateStr) {
//   return format(dateStr, 'zh_CN');
// });

import TreeTable from 'vue-table-with-tree-grid';

Vue.config.productionTip = false;
Vue.component('tree-table', TreeTable); //安装插件、引入插件、注册(全局)插件

new Vue({
  render: (h) => h(App),

  // 注册路由器
  router,
}).$mount('#app');
