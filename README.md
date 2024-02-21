# Router-Builder Plugin 自动路由生成插件

这是一款可以根据文件目录，自动生成`vue-router`配置对象，在一些页面数量庞大的项目中适用，当我们每次添加或者删除文件都需要去修改其对应的路由配置，这种工作没有任何技术含量，设置可能会因为配置错误耗费我们开发时间。

可以在npmjs官网查看：[npm](https://www.npmjs.com/package/router-builder)

所以可以通过`router-builder`自动生成`router`配置对象，目前`router-builder`只适用于`vue`。

## 插件使用

1. 插件安装，插件作为开发依赖安装到项目当中。
   `npm install router-builder --save-dev`

2. 插件使用，在终端中输入以下命令
   `npx router-builder`

**当终端输出`router file generation successful!`则表示成功生成**

## 插件配置

1. 我们可以在根目录`package.json同级`创建`router.config.js` 文件可以对配置进行自定义，提高一定的灵活性。

```js
module.exports = {
  entry: "/src/views", // 读取文件路径入口
  output: "/src/router/router.js", // 路由文件输出路径
  importPrefix: "@/views", // 组件导入前缀
  ignoreFolder: [“components”, /child\d/],  // 忽略匹配的文件夹 可以是字符串和正则
  fileName: "index", // 文件夹下的文件名称，通常是页面文件
};
```

2. 如果一个页面希望配置成为一个路由页面，则可以在`.vue`文件夹中添加`<router></router>`标签


```html
// router 标签包裹的内容就是页面路由配置
<router> title: 'home', meta: { info: "home" } </router>

<template>
  <div>home</div>
</template>

// 一个页面也可以配置多个 router
标签，表示该页面会生成多条路径指向该页面，在对于一个页面需要生成多条路由配置的时候，其 path
属性必须添加。
<router> title: "setting-child3-1", path: "/setting/child3-1" </router>

<router> title: "setting-child3-2", path: "/setting/child3-2" </router>

<router> title: "setting-child3-3", path: "/setting/child3-3" </router>
```

3. `router`的配置选项都可以写入到`<router></router>`标签当中。

4. 执行`npx router-builder`可以看到根据`output`选项配置的文件路径输出一个文件，改文件默认导出一个路由数组`export default [  ]`，将该文件导入到对应的路由配置文件当中使用即可。

## <router>参数
router配置参数，可在以下参数以外继续添加，新增的参数并且不是内置的参数会并入`router`配置对象
| 参数(params) | 必选(require) | 说明(description) | 类型(type) | 默认值(default) |
| ------------- | ----------- |------------- |----------------------------- | ----------- |
| `path` | `false` | 路由路径，当出现多个`<router>`标签的时候则是必填 | `string` | - |
| `name` | `true` | 路由路径，当出现多个`<router>`标签的时候则是必填 | `string` | - |
| `import` | `false` | 需要导入依赖的，可以配置`import`属性 | `{ [prop: string]: Array<string 或 { name: string, alias?: string, default?: boolean }` | - |
| `webpackChunkName` | `false` | 导入语句分块注释 | `string` | - |

1. `<router></router>`标签支持传入自定义参数，包含了`meta, name, 自定义参数`。

2. 一个文件可以存在多个`<router></router>`，这样意味着这个页面会生成多条路由路径指向该页面。
```js
<router>
  name: 'edit',
  meta: {
    title: 'edit'
  }
</router>
<router>
  name: 'add',
  meta: {
    title: 'add'
  }
</router>
```

3. `<router> webpackChunkName: "chunkName" </router>`，可以添加固有参数`webpackChunkName`，组件就会在导入的时候自动添加该魔法注释：`component: () => import(/* webpackChunkName: "配置的属性值" */ "path")`。
```js
<router>
  webpackChunkName: "chunkName",
</router>

// 输出
component: () => import(/* webpackChunkName: 'chunkName' */, "path...")
```

4. 也支持定义路由的导航守卫，直接写入函数内容即可

```js
<router>
  beforeEach: (to, from) => {},
  beforeEach(to, from) {},
  beforeEach: function(to, from) {}
</router>
```

5. `import`配置：如果在函数当中使用了第三方依赖或者需要导入的依赖，那么可以通过`import`配置对象生成`import`导入语句
```js
import: {
  '@/utils/index': [
    'getDate',  // 默认导出属性
    {
      name: 'getType',  // 导出属性名称
      alias: '_getType'  // 指定别名
    },
    {
      name: 'getTime',  // 导出属性名称
      default: true  // 指定为默认导出
    }
  ]
}

// 最终转为import语句
import getTime, { getDate, getType as _getType } from "@/utils/index"
```

## 插件文件结构
```
│  .gitignore
│  main.d.ts
│  package-lock.json
│  package.json
│  README.md
│  rollup.config.js
│  tsconfig.json
│
├─bin  打包文件夹
│      index.cjs
└─src
    │  dictContent.ts  目录读取
    │  filesInfo.ts  文件内容读取
    │  index.ts  入口文件
    │  routerConfig.ts  生成路由配置
    │
    ├─types  类型定义
    │      filesInfo.ts
    │      index.ts
    │
    └─utils  工具函数
           funToString.ts  函数转字符串存储
           importCode.ts  导出语句函数
           isRegExp.ts  类型校验
           rootPath.ts  文件路径查询
```
