module.exports = {
  lintOnSave: false, // 关闭检查

  devServer: {
    host: 'localhost', // 本地域名/ip地址
    port: '8080', // 端口号

    //#region
    /* proxy: {
      // 配置跨域 --- 匹配所有以'/apis'开头的路径
      '/apis': {
        secure: false, // 如果是不是https接口，可以不配置这个参数
        changeOrigin: true, // 允许跨域、默认为 true
        target: 'https://www.baidu.com/', // 需要代理的地址
        pathRewrite: {
          '^/apis': '', // 路径重写，匹配所有以apis开头的路径，都变为空串
        },
      },
      '/apis2': {
        target: 'https://www.baidu.com/', // 需要代理的地址 [改地址2]
        pathRewrite: {
          '^/apis2': '', // 路径重写，匹配所有以apis开头的路径，都变为空串
        },
      },
    }, */
    //#endregion
  },
};
