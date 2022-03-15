import Vue from 'vue';
import App from './App.vue';

// 引入路由器对象
import router from './router/index';
import './assets/css/global.css'; //引入全局样式
import './plugins/element'; //引入element-ui
import './api/index'; //引入axios

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),

  // 注册路由器
  router,
}).$mount('#app');
