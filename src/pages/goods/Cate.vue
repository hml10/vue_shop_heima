<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域、插件 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效列 -->
        <!-- 相当于在表格内部定义了一个插槽，给他取个对应的名字 isok -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: green"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="medium" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="medium"
            type="success"
            v-else-if="scope.row.cat_level === 1"
          >
            二级
          </el-tag>
          <el-tag size="medium" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作列 -->
        <!-- <template slot="opt" slot-scope="scope"> -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">
            编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">
            删除
          </el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <!-- 1、样式，2、监听每页显示多少条，3、监听当前选中第几页，4、当前页，5、每页显示多少条，6、每页显示多少条数据，7、总条数 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateClose"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 级联选择 新版本有bug需要手动设置 height -->
        <el-form-item label="父级分类">
          <el-cascader
            clearable
            v-model="selectedKeys"
            :options="parentCateList"
            :props="optionsProps"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateItem"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      cateList: [], // 商品分类数据列表

      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1, //当前页码值
        pagesize: 5, //每页显示多少条数据
      },
      total: 0, //总数据条数

      // 为table定义、指定列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          // width: '200px',
          // align: 'center',
          // headerAlign: 'center', //标题对齐
        },
        {
          label: '是否有效',
          type: 'template', //表示将当前列设置为模板列(插槽)
          template: 'isok', //表示当前列使用的模板名称
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
        },
      ],

      addCateDialogVisible: false, //隐藏 添加对话框
      // 添加分类的表单对象
      addCateForm: {
        cat_name: '', //将要添加的分类名称
        cat_pid: 0, //父级分类id
        cat_level: 0, //分类的等级，默认要添加的等级为1级分类
      },
      // 添加分类的表单验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
      },
      parentCateList: [], //用来保存父级分类列表数据
      selectedKeys: [],
      // 级联选择器的配置对象
      optionsProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true, //级联选择器只选择第一级 change-on-select
      },
    };
  },

  mounted() {
    this.getCateList();
  },

  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        this.$message.error('获取失败！');
      }

      this.cateList = res.data.result; // 获取成功，赋值
      this.total = res.data.total; // 给总条数赋值
      // console.log('商品分类：', res.data);
    },

    //监听 pagesize 改变 (每页显示多少条)
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听 pagenum 改变 (当前选中第几页)
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },

    // 添加分类
    addCate() {
      // 在点击对话框时，获取父级分类列表的数据
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },

    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败！');
      }
      this.parentCateList = res.data;
      // console.log(res.data);
    },

    //监听级联选择器、选择项发生变化时调用
    parentCateChange(val) {
      console.log(val);
      // console.log(this.selectedKeys);

      // 如果 selectedKeys 或(val) 数组中的length 等于0，还没有选中父级分类。
      // 大于0，选中了父级分类。
      if (val.length > 0) {
        // 父级分类id (选择最后一项当父级分类的id) val是一个数组，通过索引找到它的最后一项，并赋值
        this.addCateForm.cat_pid = val[val.length - 1];
        // 为当前分类名称，的等级赋值
        this.addCateForm.cat_level = val.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },

    // 点击按钮添加新的分类
    addCateItem() {
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        );

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！');
        }
        this.$message.success('添加分类成功！');
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },

    //监听对话框的关闭事件，重置表单数据
    addCateClose() {
      this.$refs.addCateFormRef.resetFields();

      // 重置父级分类
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
  },
};
</script>

<style lang="less" rel="stylesheet/less" scoped>
.el-row {
  margin-bottom: 20px;
}
.el-cascader {
  width: 100%;
}
/deep/ .zk-table--firstProp-header-inner {
  padding-left: 12px;
}
</style>
