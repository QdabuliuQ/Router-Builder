import { AutoRouterConfig } from "../types";

// 导入语句特殊处理
export function importCode (paths: string[], name: string, config: AutoRouterConfig) {
  return `$$$() => import('${config.importPrefix}/${
    paths.length ? paths.join("/") + "/" : ""
  }${config.fileName === "<dictName>" ? `${name}.vue` : "index"}.vue')$$$`;
};