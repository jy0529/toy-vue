// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.js'),
      name: 'runtime',
      fileName: (format) => `toy-vue-runtime.${format}.js`
    },
  }
})