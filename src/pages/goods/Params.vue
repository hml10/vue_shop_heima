<template>
  <div class="outer">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
        center
      >
      </el-alert>

      <!-- 选择商品分类区 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品的级联选择器 -->
          <el-cascader
            clearable
            v-model="selectedKeys"
            :options="catelist"
            :props="optionsProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtn"
            @click="addDialogVisible = true"
          >
            添加参数
          </el-button>
          <!-- 动态参数的表格 -->
          <el-table border stripe :data="manyTableDate">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染 tag 标签 -->
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >

                <!-- 输入文本框、切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtn"
            @click="addDialogVisible = true"
          >
            添加属性
          </el-button>
          <!-- 静态参数的表格 -->
          <el-table border stripe :data="onlyTableDate">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染 tag 标签 -->
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >

                <!-- 输入文本框、切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数(动态/静态)的对话框 -->
    <el-dialog
      :title="`添加${titleText}`"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 表单区域， 阻止按回车键，页面刷新 @submit-->
      <el-form
        @submit.native.prevent
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="`修改${titleText}`"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 表单区域， 阻止按回车键，页面刷新 @submit-->
      <el-form
        @submit.native.prevent
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      catelist: [], // 商品分类列表

      selectedKeys: [], // 级联选择框双向绑定到的数组
      // 级联选择器的配置对象
      optionsProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        // checkStrictly: true, //级联选择器只选择第一级 change-on-select
      },

      activeName: 'many', // 被激活的 tab标签
      manyTableDate: [], // 动态参数的数据
      onlyTableDate: [], // 静态参数的数据

      addDialogVisible: false, // 控制添加对话框显示或隐藏
      // 添加表单的数据对象
      addForm: {
        attr_name: '',
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入添加名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
      },

      editDialogVisible: false, // 修改对话框显示或隐藏
      // 修改表单的数据对象
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入修改名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
      },

      // inputVisible: false, //控制按钮与文本框的切换显示
      // inputValue: '', // 文本框中输入的内容 //这样写有问题，要在遍历的时候单独的提供
    };
  },

  mounted() {
    this.getCateList();
  },

  methods: {
    // 获取所有商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories');

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！');
      }
      // console.log(res);
      this.catelist = res.data;
    },

    // 级联选择框选中变化，会触发这个函数
    handleChange() {
      this.getParamsData();
    },

    // tab 标签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
      // console.log(this.activeName);
    },

    // 获取参数的列表数据
    async getParamsData() {
      // 选中的不是三级分类，把数组重置为空
      // console.log(this.selectedKeys);
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []; //清空数组
        this.manyTableDate = [];
        this.onlyTableDate = [];
        return;
      }

      // 根据所选择的分类id，和当前所处的面板，获取对应的数据
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error('获取失败！');
      }

      // 获取数据成功后，还需判断具体是 动态数据、还是静态数据
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(' '); //不为空才分割
        item.inputVisible = false; // 控制文本框的显示或隐藏
        item.inputValue = ''; // 文本框中输入的值，给每一个item单独绑定上
      });
      // console.log(res.data);

      if (this.activeName === 'many') {
        this.manyTableDate = res.data; // 保存动态数据
      } else {
        this.onlyTableDate = res.data; // 保存静态数据
      }
    },

    // 监听对话框的关闭事件，重置表单
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },

    // 发送请求、添加操作
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        // console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败！');
        }
        this.$message.success('添加成功！');
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },

    // 编辑按钮
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName },
        }
      );
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败！');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },

    // 重置修改表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },

    // 点击按钮修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败！');
        }
        this.$message.success('修改成功！');
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },

    // 根据id删除
    removeParams(attr_id) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${attr_id}`
          );
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败！');
          }
          this.$message.success('删除成功!');
          this.getParamsData();
        })
        .catch(() => {
          this.$message.info('已取消删除');
        });
    },

    // 文本框时去焦点或者按下回车键都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return;
      }
      // 如果没有return 那输入的内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = '';
      row.inputVisible = false;

      this.saveAttrVal(row);
    },

    // 提炼共用的代码
    async saveAttrVal(row) {
      // 需要发请网络请求保存数据
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' '),
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败！');
      }
      this.$message.success('修改成功！');
    },

    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    // 删除操作
    handleClose(index, row) {
      row.attr_vals.splice(index, 1);
      this.saveAttrVal(row);
    },
  },

  computed: {
    // 如果按钮需要被禁用，返回true。否则返回false
    isBtn() {
      if (this.selectedKeys.length !== 3) {
        return true; //禁用
      }
      return false;
    },

    // 这是当前选中的三级分类id，取数组最后一项
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2];
      }
      return null;
    },

    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数';
      }
      return '静态属性';
    },
  },
};
</script>

<style lang="less" rel="stylesheet/less" scoped>
.cat_opt {
  margin-top: 20px;
}
// .outer {
//   user-select: none;
// }
.el-tag {
  margin-left: 10px;
}
.input-new-tag {
  width: 100px;
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
}
</style>
