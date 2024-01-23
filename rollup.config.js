import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts', // 打包入口
  output: { // 打包出口
    dir: 'bin',
    inlineDynamicImports: true, // 内联动态导入
	  entryFileNames: '[name].cjs',
    format: 'cjs',
    banner: '#! /usr/bin/env node\nglobal.navigator = {userAgent: "node.js"}', // 补丁
  },
  plugins: [ // 打包插件
    terser(), // 压缩打包的结果
    resolve({ preferBuiltins: true }), // 查找和打包node_modules中的第三方模块
    commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    typescript(), // 解析TypeScript
    json(),
  ]
};