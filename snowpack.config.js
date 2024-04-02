// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    // 将 src 目录挂载到 /dist，用于存放 JS 和其他处理过的资源
    src: '/dist',
    // 将 public 目录设置为静态资源目录，它的内容将被复制到构建输出
    public: {url: '/', static: true},
    fonts:{url: '/fonts', static: true},
    res:{url: '/res', static: true},
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    port: 5500,
    /* ... */
  },
  buildOptions: {
    htmlFragments:true
    /* ... */
  },
  // exclude: ["./src/aframe-scene.html"],
};