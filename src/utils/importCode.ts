import { RouterBuilderConfig, ImportOption } from "../types";
import { dataType } from "./dataType";

// 导入语句特殊处理
export function importCode(paths: string[], name: string, config: RouterBuilderConfig, webpackChunkName: string | undefined) {
  // 存在魔法注释 加入代码
  if (webpackChunkName) {
    return `$$$() => import( /* webpackChunkName: '${webpackChunkName}' */ '${config.importPrefix}/${paths.length ? paths.join("/") + "/" : ""
      }${config.fileName === "<dictName>" ? `${name}.vue` : "index"}.vue')$$$`;
  }
  // 不存在魔法注释
  return `$$$() => import('${config.importPrefix}/${paths.length ? paths.join("/") + "/" : ""
    }${config.fileName === "<dictName>" ? `${name}.vue` : "index"}.vue')$$$`;
};

// 处理import对象
export function depImportCode(importOption: Array<any>, imports: ImportOption): void {
  // 遍历import对象
  for (const key in importOption) {
    // 判断数据类型
    if (Object.prototype.hasOwnProperty.call(importOption, key) && dataType(importOption[key]) === 'array' && importOption[key].length) {
      // 之前没有存在
      if (!Object.prototype.hasOwnProperty.call(imports, key)) {
        imports[key] = new Map()
      }
      // 遍历导入的子依赖
      for (const dep of importOption[key]) {
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
}