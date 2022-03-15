<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>

      <!-- 登录表单区域 -->
      <el-form
        :model="loginForm"
        :rules="loginFromRules"
        ref="loginFromRef"
        label-width="0px"
        class="login_form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          >
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          >
          </el-input>
        </el-form-item>

        <!-- 按钮区域 -->
        <el-form-item class="login_btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 登录表单数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },

      //验证规则
      loginFromRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
    };
  },

  methods: {
    // 重置表单
    resetLoginForm() {
      this.$refs.loginFromRef.resetFields();
    },

    // 登录前预校验
    login() {
      this.$refs.loginFromRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post('login', this.loginForm);
        // console.log('##', res);
        if (res.meta.status !== 200) return this.$message.error('登录失败！');
        this.$message.success('登录成功！');

        // 登录成功之后：1、保存token到sessionStorage中 2、通过编程式路由跳转到主页 home
        window.sessionStorage.setItem('token', res.data.token);
        this.$router.push('/home'); // 如果用户没有登录，直接通过url跳转到其它页面，则需要重新导航到登录页(路由守卫)
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;

  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); //盒子居中

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;

    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login_form {
    position: absolute;
    bottom: 0px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .login_btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
