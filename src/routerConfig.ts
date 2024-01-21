import fs from "node:fs"
import prettier from "prettier"
import { AutoRouterConfig } from "./types";
import { FileInfoItem } from "./types/filesInfo";
import { conveyFunctionToString } from "./utils/funToString";
import { importCode } from "./utils/importCode";
import { rootPath } from "./utils/rootPath";

// 读取文件 <router></router>
export function getRouterConfig(content: string) {
  const matches: string[] = [];
  let match;
  // 正则匹配 <router></router> 标签名称
  const reg: RegExp = /<router>([\s\S]*?)<\/router>/g;
  // 可能匹配到多个 循环处理保存起来
  while ((match = reg.exec(content)) !== null) {
    matches.push(match[1]);
  }
  if (matches.length) {
    // 利用 eval 函数，将配置对象放入一个立即执行函数当中并且返回，就能快速将字符串转成一个对象
    const params = matches.map((match) =>
      eval(`(function(){return {${match}}})()`)
    );
    return params;
  }
  return null;
}

// 生成路由配置对象
// routerConfig 多个路由信息
// defaultRouter 默认的路由信息
// dictInfo 当前文件夹信息
// dictList 子文件夹/子文件
export async function generateRouterConfig (
  routerConfig: any,
  defaultRouter: any,
  dictInfo: FileInfoItem,
  config: AutoRouterConfig
) {
  let router = null;
  if (routerConfig) {
    router = [];
    for (const item of routerConfig) {
      conveyFunctionToString(item);
      router.push({
        ...defaultRouter,
        ...item,
        component: importCode(dictInfo.names, dictInfo.name, config),
      });
    }
  }
  return router;
};

// 生成 router 文件
export async function generateRouterFile (code: string, config: AutoRouterConfig) {
  // 解析输出路径
  const paths: string[] = config.output.split("/").filter((item) => Boolean(item));
  const fileName: string = paths.pop() as string; // 先保存文件名称
  let fullPath = rootPath;
  for (const p of paths) {
    // 遍历路径
    fullPath += `//${p}`;
    try {
      // 判断是否存在文件夹
      await fs.promises.access(fullPath);
    } catch (err) {
      // 不存在则创建文件夹
      await fs.promises.mkdir(fullPath);
    }
  }
  // 通过 writeFile 方法将最终结果写入到对应路径的文件当中
  const res = await prettier.format(await generateRouterTemplate(code), { parser: 'babel' });
  fs.promises.writeFile(
    `${fullPath}//${fileName}`,
    res
  );
};

async function generateRouterTemplate(router: string): Promise<string> {
  // 获取 packageJSON 文件 读取其 vue 的版本，生成不同的 router 文件
  const packageJSON = JSON.parse(
    await fs.promises.readFile(`${rootPath}\\package.json`, "utf-8")
  );
  let code = ''
  if (packageJSON.dependencies) {
    // vue2 版本
    if (packageJSON.dependencies.vue.replace("^", "").split(".")[0] === "2") {
      code = `
import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);
export default new Router({
  routes: ${router}
})
        `;
    } else {
      // vue3 版本
      code = `
import { createRouter, createWebHistory, RouteRecordRaw, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(),
	routes: ${router}
})

export default router
        `;
    }
  }
  return code
};