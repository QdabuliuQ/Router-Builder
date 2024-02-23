import { RouterBuilderConfig } from "./types";
import { FileInfoItem } from "./types/filesInfo";
import { conveyFunction } from "./utils/conveyFunction";
import { importCode } from "./utils/importCode";

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
    return params
  }
  return null;
}

// 生成路由配置对象
// routerConfig 多个路由信息
// defaultRouter 默认的路由信息
// imports 导入依赖
// dictInfo 当前文件夹信息
// dictList 子文件夹/子文件
export async function generateRouterConfig(
  routerConfig: any,
  defaultRouter: any,
  dictInfo: FileInfoItem,
  config: RouterBuilderConfig
) {
  let router = null;

  if (routerConfig) {
    router = [];

    for (const item of routerConfig) {
      // 对函数进行处理转换
      conveyFunction(item);

      // // 判断import对象
      const webpackChunkName = item.webpackChunkName
      // 如果存在 webpackChunkName 字段，保存然后移除
      item.webpackChunkName && delete item.webpackChunkName

      router.push({
        ...defaultRouter,
        ...item,
        component: importCode(dictInfo.names, dictInfo.name, config, webpackChunkName),
      });
    }
  }

  return router;
};