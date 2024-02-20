import fs from "node:fs"
import prettier from "prettier"
import { AutoRouterConfig, ImportOption } from "./types";
import { FileInfoItem } from "./types/filesInfo";
import { conveyFunctionToString } from "./utils/funToString";
import { importCode } from "./utils/importCode";
import { rootPath } from "./utils/rootPath";
import { dataType } from "./utils/dataType";

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
// imports 导入依赖
// dictInfo 当前文件夹信息
// dictList 子文件夹/子文件
export async function generateRouterConfig(
  routerConfig: any,
  defaultRouter: any,
  imports: ImportOption,
  dictInfo: FileInfoItem,
  config: AutoRouterConfig
) {
  let router = null;
  if (routerConfig) {
    router = [];
    for (const item of routerConfig) {
      conveyFunctionToString(item);
      // 判断import对象
      if (item.import && dataType(item.import) === 'object') {
        // 遍历import对象
        for (const key in item.import) {
          // 判断数据类型
          if (Object.prototype.hasOwnProperty.call(item.import, key) && dataType(item.import[key]) === 'array' && item.import[key].length) {
            // 之前没有存在
            if (!Object.prototype.hasOwnProperty.call(imports, key)) {
              imports[key] = new Map()
            }
            // 遍历导入的子依赖
            for (const dep of item.import[key]) {
              if (dataType(dep) === 'string') {
                imports[key].set(dep, dep)
              } else if (dataType(dep) === 'object') {
                if (dataType(dep.name) === 'string' && Object.prototype.hasOwnProperty.call(dep, 'alias') ? dataType(dep.alias) === 'string' : true && Object.prototype.hasOwnProperty.call(dep, 'default') ? dataType(dep.default) === 'boolean' : true) {
                  imports[key].set(dep.name, dep)
                }
              }
            }
          }
        }
        delete item.import
      }

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

// 生成 router 文件
export async function generateRouterFile(route: string, imports: string, config: AutoRouterConfig) {
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
  const res = await prettier.format(generateRouterTemplate(route, imports), { parser: 'babel' });
  fs.promises.writeFile(
    `${fullPath}//${fileName}`,
    res
  );
};

function generateRouterTemplate(router: string, imports: string): string {
  return `
${imports}
export default ${router}  
`
};