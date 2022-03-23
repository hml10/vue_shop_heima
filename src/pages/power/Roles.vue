<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入角色名称搜索"
            v-model="search"
            clearable
            @clear="getRolesList"
            @input="input"
            @keyup.13.native="searchRoles"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchRoles"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addRolesDialogVisible = true">
            添加角色
          </el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列区 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['dbbottom', index1 === 0 ? 'dbtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[index2 === 0 ? '' : 'dbtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过for循环 嵌套渲染三级权限 -->
                    <el-tag
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列区 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="updRoles(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="closeRolesDialog"
    >
      <!-- 添加角色表单 -->
      <el-form
        :model="roleForm"
        :rules="roleFormRules"
        ref="roleFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="upRolesDialogVisible"
      width="50%"
      @close="closeReset"
    >
      <el-form
        :model="updateForm"
        :rules="updateFormRules"
        ref="updateFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="updateForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="updateForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="upRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRolesValid"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogVisibleClose"
    >
      <!-- 树形组件 -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      addRolesDialogVisible: false, //添加角色对话框打开或关闭
      // 添加角色、表单验证对象
      roleForm: {
        roleName: '',
        roleDesc: '',
      },
      // 添加角色、验证规则对象
      roleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '长度在 3 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
      search: '', // 模糊搜索、查询角色

      upRolesDialogVisible: false, //修改对话框
      updateForm: {},
      updateFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '长度在 3 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },

      // 分配权限对话框打开或关闭
      setRightDialogVisible: false,
      rightList: [], // 所有权限的数据
      // 树形组件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认勾选选中的节点id值数组
      defKeys: [],
      roleId: '', // 保存即将分配权限的角色id
    };
  },

  mounted() {
    this.getRolesList();
  },

  methods: {
    // 获取角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表数据失败');
      }
      this.roleList = res.data;
      // console.log(res);
    },

    // 添加角色，重置表单
    closeRolesDialog() {
      this.$refs.roleFormRef.resetFields();
    },

    // 发送请求、添加角色并且重新刷新页面
    addRoles() {
      this.$refs.roleFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post('roles', this.roleForm);
        if (res.meta.status !== 201) {
          return this.$message.error('创建失败！');
        }
        this.$message.success('创建成功！');
        this.getRolesList();
        this.addRolesDialogVisible = false;
      });
    },

    // 模糊搜索、查询角色
    searchRoles() {
      this.roleList = this.roleList.filter((item) => {
        return item.roleName.indexOf(this.search) !== -1;
      });
    },

    input() {
      if (this.search === '') {
        this.getRolesList();
      }
    },

    // 删除角色
    removeRole(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id);
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败！');
          }
          this.$message.success('删除成功！');
          this.getRolesList();
          // console.log(res);
        })
        .catch(() => {
          this.$message.info('已取消删除！');
        });
    },

    // 修改角色列表、数据回显
    async updRoles(id) {
      const { data: res } = await this.$http.get('roles/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！');
      }
      this.upRolesDialogVisible = true;
      this.updateForm = res.data;
    },

    closeReset() {
      this.$refs.updateFormRef.resetFields();
    },

    // 发送修改角色列表的数据请求
    updateRolesValid() {
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) return;

        // 发送请求
        const { data: res } = await this.$http.put(
          'roles/' + this.updateForm.roleId,
          {
            roleName: this.updateForm.roleName,
            roleDesc: this.updateForm.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！');
        }
        this.$message.success('更新用户信息成功！');
        this.upRolesDialogVisible = false;
        this.getRolesList();
      });
    },

    // 根据id来删除对应的三级权限数据
    removeRightById(role, rightId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          );
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败！');
          }
          this.$message.success('删除成功！');
          role.children = res.data; // 因为删除后接口里面有返回数据，把服务器返回的最新数据，重新赋值即可

          // console.log(res);
          // this.getRolesList();//直接调用会导致页面更新，从而关闭expand
        })
        .catch(() => {
          this.$message.info('已取消删除！');
        });
    },

    // 分配权限
    async showSetRightDialog(role) {
      this.roleId = role.id; // 把id保存到data中，后面需要用

      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        this.$message.error('获取权限列表失败！');
      }
      this.rightList = res.data; //保存数据到data中
      // console.log(res);

      // 递归获取三级节点的id，把当前的角色传进去role，再提供一个数组
      this.getLeafKeys(role, this.defKeys);

      this.setRightDialogVisible = true;
    },

    // 定义递归函数，获取角色下所有三级权限的id，并保存到 defKeys数组中
    // node 节点、用来判断是不是三级节点，arr用来保存的数组
    getLeafKeys(node, arr) {
      // 如果当前 node不包含 children属性、则是三级节点。就把node.id值保存到数组中去
      if (!node.children) {
        return arr.push(node.id);
      }
      // 如果还不是三级节点
      node.children.forEach((item) => this.getLeafKeys(item, arr));
    },

    // 关闭对话框时，清空 defKeys数组
    setRightDialogVisibleClose() {
      this.defKeys = [];
    },

    // 点击确定按钮、为角色分配权限，发送请求
    async allotRights() {
      const keys = [
        // 获取所有 被选中的节点的 id和 半选中的节点的id数组
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      // console.log(keys);
      const idStr = keys.join(',');

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败！');
      }

      this.$message.success('更新成功！');
      // console.log(res);
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px 15px;
}

.dbtop {
  border-top: 1px solid #eee;
}
.dbbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
