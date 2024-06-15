// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
require('dotenv-flow').config();
module.exports = {
  mount: {
    // 将 src 目录挂载到 /dist，用于存放 JS 和其他处理过的资源
    src: '/dist',
    // 将 public 目录设置为静态资源目录，它的内容将被复制到构建输出
    public: {url: '/', static: true},
    fonts:{url: '/fonts', static: true},
    res:{url: '/res', static: true},
    models:{url: '/models', static: true},
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    port: 80,
    /* ... */
  },
  buildOptions: {
    htmlFragments:true
    /* ... */
  },
  env: {
    API_URL: process.env.BACKEND_API_URL
    /* ... */
  },
  exclude: [
    "**/backend/**"  // 排除 backend 文件夹
  ],
};
