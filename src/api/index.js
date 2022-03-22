// 引入vue
import Vue from 'vue';
// 引入axios
import axios from 'axios';

// 请求拦截器，添加token 保证拥有获取数据权限
axios.interceptors.request.use((config) => {
  // console.log('##', config);
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
});

// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';

Vue.prototype.$http = axios; //把axios挂载到vue的原型对象上
