import { AutoRouterConfig } from "../types";

// 导入语句特殊处理
export function importCode(paths: string[], name: string, config: AutoRouterConfig, webpackChunkName: string | undefined) {
  // 存在魔法注释 加入代码
  if (webpackChunkName) {
    return `$$$() => import( /* webpackChunkName: '${webpackChunkName}' */ '${config.importPrefix}/${paths.length ? paths.join("/") + "/" : ""
      }${config.fileName === "<dictName>" ? `${name}.vue` : "index"}.vue')$$$`;
  }
  // 不存在魔法注释
  return `$$$() => import('${config.importPrefix}/${paths.length ? paths.join("/") + "/" : ""
    }${config.fileName === "<dictName>" ? `${name}.vue` : "index"}.vue')$$$`;
};