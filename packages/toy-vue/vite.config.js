// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.js'),
      name: 'toy-vue',
      fileName: (format) => `toy-vue.${format}.js`
    },
  }
})