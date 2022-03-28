<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告框 -->
      <el-alert
        title="添加商品信息"
        type="warning"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex * 1"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab 栏区域 外层包裹一个表单-->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 基本信息 第一项 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                clearable
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="optionsProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 第二项 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组件 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <!-- 第三项 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- 第四项 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片要上传到的后台api地址 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
              :file-list="fileList"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 按需引入 lodash
import cloneDeep from 'lodash/cloneDeep';

export default {
  name: 'Add',
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,

        goods_cat: [], // 商品所属的分类数组、级联选择框双向绑定到的数组
        pics: [], // 图片的数组
        goods_introduce: '', // 商品的详情
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
      cateList: [], // 储存商品分类数据
      // 级联选择器的配置对象
      optionsProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        // checkStrictly: true, //级联选择器只选择第一级 change-on-select
      },
      manyTableData: [], //动态参数数据-商品参数
      onlyTableData: [], //商品属性

      // 图片上传组件的 headers 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      previewPath: '',
      previewVisible: false,

      fileList: [
        {
          name: 'food.jpg',
          url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
        },
      ],
    };
  },

  mounted() {
    this.getCateList();
  },

  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories');
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！');
      }
      this.cateList = res.data;
      // console.log(this.cateList);
    },

    // 级联选择项变化时触发
    handleChange(val) {
      // console.log(val);
      if (val.length !== 3) {
        this.addForm.goods_cat = []; //清空数组
      }
    },

    // 如果没有选择三级分类，禁止 tabs 切换
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将进入的：' + activeName, '即将离开的：' + oldActiveName);
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！');
        return false;
      }
    },

    async tabClicked() {
      // console.log(this.activeIndex);
      // 证明访问的是动态参数面板-商品参数
      if (this.activeIndex === '1') {
        // 发起请求获取数据
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('获取失败！');
        }
        // console.log('商品参数', res.data);
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' '); //不为空才分割
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('获取失败！');
        }
        // console.log('商品属性', res.data);
        this.onlyTableData = res.data;
      }
    },

    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },

    // 处理移除图片 x 的操作
    handleRemove(file) {
      // 1、获取将要删除的图片临时路径
      const filePath = file.response.data.tmp_path;
      // 2、从 pics 数组中，找到这个图片对应的索引
      const index = this.addForm.pics.findIndex((x) => x.pic === filePath);
      // 3、调用数组的 splice 方法，把图片信息对象，从pics 数组中移除
      this.addForm.pics.splice(index, 1);
      // console.log(this.addForm);
    },

    // 文件上传成功时的钩子
    handleSuccess(response) {
      // 1、拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2、将图片信息对象 push 到 pics 数组中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },

    // 添加表单预验证
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写对应的表单项');
        // 执行添加的业务逻辑
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',');// 这么写是有冲突的，需要深拷贝
        // lodash cloneDeep(obj)
        const form = cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(',');

        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          };
          this.addForm.attrs.push(newInfo);
        });

        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });

        form.attrs = this.addForm.attrs;
        // console.log('完美解决', form);

        // 发起请求添加商品、商品的名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form);
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！');
        }
        this.$message.success('添加商品成功！');
        this.$router.push('/goods');
      });
    },
  },

  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" rel="stylesheet/less" scoped>
/deep/ .el-step__title {
  font-size: 12px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
/deep/ .ql-editor {
  min-height: 300px;
}
.quill-editor {
  margin-bottom: 20px;
}
</style>
