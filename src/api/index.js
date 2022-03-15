// 引入vue
import Vue from 'vue'
// 引入axios
import axios from 'axios'

// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.prototype.$http = axios //把axios挂载到vue的原型对象上