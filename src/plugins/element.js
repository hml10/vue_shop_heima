// 引入Vue
import Vue from 'vue';

// 按需引入
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Header,
  Container,
  Aside,
  Main,
  Menu,
  Submenu,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Loading,
  Dialog,
  MessageBox,
} from 'element-ui';

// 全局注册
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Header);
Vue.use(Container);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Card);
Vue.use(Row);
Vue.use(Col);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Switch);
Vue.use(Tooltip);
Vue.use(Pagination);
Vue.use(Loading);
Vue.use(Dialog);

Vue.prototype.$message = Message;
Vue.prototype.$confirm = MessageBox.confirm;