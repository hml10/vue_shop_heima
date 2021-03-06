<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索和添加区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入搜索关键字"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">
            添加用户
          </el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe v-loading="loading">
        <el-table-column type="index" align="center"> </el-table-column>
        <el-table-column label="姓名" prop="username"> </el-table-column>
        <el-table-column label="邮件" prop="email"> </el-table-column>
        <el-table-column label="电话" prop="mobile"> </el-table-column>
        <el-table-column label="角色" prop="role_name"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="switchChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <!-- 修改、删除 -->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >
            </el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            >
            </el-button>
            <!-- 文字提示 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              >
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 7]"
        :page-size="queryInfo.pagesize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <h4>当前的用户：{{ userInfo.username }}</h4>
        <h4>当前的角色：{{ userInfo.role_name }}</h4>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 自定义邮箱验证规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error('请输入正确的邮箱'));
    };
    // 自定义手机号验证规则
    var checkMobile = (rule, value, cb) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error('请输入正确的手机号'));
    };

    return {
      queryInfo: {
        query: '', // 查询参数
        pagenum: 1, // 默认选中第几页
        pagesize: 3, // 默认每页显示几条
      },

      userList: [], // 所有用户列表
      total: 0, // 总数据条数
      loading: false, // 加载
      addDialogVisible: false, // 添加对话框、显示或隐藏

      // 添加用户、的表单数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加用户、验证表单规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
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
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },

      editDialogVisible: false, // 修改对话框、显示或隐藏
      // 查询到的用户信息对象
      editForm: {},
      // 修改用户、验证表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },

      setRoleDialogVisible: false, //分配角色的对话框
      userInfo: {}, // 需要被分配角色的用户信息
      rolesList: [], // 保存所有、角色的数据列表
      selectedRoleId: '', // 已选中的角色id值
    };
  },

  mounted() {
    this.getUserList();
  },

  methods: {
    // 获取接口用户列表数据
    async getUserList() {
      this.loading = true; // 加载 loading
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      });
      this.loading = false; // 关闭 loading
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！');
      }
      this.userList = res.data.users;
      this.total = res.data.total;

      // console.log('##', res);
    },

    // 监听 pagesize 改变事件、每页多少条 条/页
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize; // 重新设置每页多少条
      this.getUserList();
    },
    // 监听 页码值 改变事件、 当前页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },

    // 监听 swatch 状态的改变
    async switchChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state; // 如果失败将状态、取反回去
        return this.$message.error('更新用户状态失败！');
      }
      this.$message.success('更新用户状态成功！');
      // console.log(res);
    },

    // 监听对话框关闭，重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    // 点击确认按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 预验证通过后，发送网络请求
        const { data: res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！');
        }
        this.$message.success('添加用户成功！');
        this.addDialogVisible = false; // 隐藏对话框
        this.getUserList(); // 重新获取用户列表
        // console.log(res);
      });
    },

    // 修改用户的对话框、数据回显
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！');
      }

      this.editDialogVisible = true;
      this.editForm = res.data; // 把查询到的数据保存到 editForm 上
      // console.log('##', res);
    },

    // 监听修改用户对话框关闭，重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    // 修改用户信息、并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发送请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！');
        }
        this.$message.success('更新用户信息成功！');
        this.getUserList();
        // console.log(res);
        this.editDialogVisible = false;
      });
    },

    // 根据id删除用户
    removeUserById(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`users/${id}`);
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败！');
          }
          this.$message.success('删除成功！');
          this.getUserList();
          // console.log(res);
        })
        .catch(() => {
          this.$message.info('已取消删除！');
        });
    },

    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo; //保存到data数据中

      // 在展示下拉框之前，先获取所有的角色列表数据
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败！');
      }
      this.rolesList = res.data; // 保存所有、角色的数据列表

      // console.log(res);
      this.setRoleDialogVisible = true;
    },

    // 点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择一个新的分配角色');
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败！');
      }
      // console.log(res);
      this.$message.success('更新角色成功！');
      this.getUserList();
      this.setRoleDialogVisible = false;
    },

    // 监听对话框关闭事件，重新赋值
    setRoleDialogClosed() {
      this.userInfo = {};
      this.selectedRoleId = '';
    },
  },
};
</script>

<style lang="less" scoped></style>
