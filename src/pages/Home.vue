<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/home_logo.png" alt="" />
        <span>企业后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 isToggle值为true变小 -->
      <el-aside :width="isToggle ? '64px' : '200px'">
        <div class="toggle-button" @click="toggle">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#1a73e8"
          unique-opened
          :collapse="isToggle"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容 -->
      <el-main>
        <!-- 欢迎页面路由视图 -->
        <!-- home 页面 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      // 添加左侧自定义字体图标
      iconObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      isToggle: false, // 是否折叠
      activePath: '', // 被激活的链接地址
    };
  },

  mounted() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  },

  methods: {
    // 退出登录、清除token、跳转至登录页
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login');
    },

    //获取左侧菜单数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus');
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      // console.log('##', res);
    },

    // 切换菜单折叠展开
    toggle() {
      this.isToggle = !this.isToggle;
    },

    // 点击二级菜单，保存链接的激活状态
    saveNavState(activePath) {
      // console.log(activePath);
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #292a2d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  color: #fff;
  padding-left: 2px;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #313743;
  .toggle-button {
    background-color: #475163;
    color: #fff;
    font-size: 10px;
    line-height: 26px;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #e9edf1;
}

.iconfont {
  margin-right: 10px;
}
</style>
