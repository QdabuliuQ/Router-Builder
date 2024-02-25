import { ConfigImportItemOption, ConfigImportOption, ImportOption, ImportOptionItem } from "../types"
import { dataType } from "./dataType"

function checkImportOption(option: ConfigImportItemOption): boolean {
  if (!Object.prototype.hasOwnProperty.call(option, "name") || typeof option.name !== 'string') {
    return false
  }
  if (Object.prototype.hasOwnProperty.call(option, "default") && typeof option.default !== 'boolean') {
    return false
  }
  if (Object.prototype.hasOwnProperty.call(option, "alias") && typeof option.alias !== 'string') {
    return false
  }
  return true
}

export function getImportCode(imports: ImportOption): string {
  const importCodes: Array<string> = []
  if (!imports) return ''
  // 遍历导入对象
  for (const key in imports) {
    if (Object.prototype.hasOwnProperty.call(imports, key)) {
      const specificExportDeps = []  // 具名导出依赖
      let defaultExportDep = ''  // 默认导出
      // 遍历每一子项
      for (const [k, v] of imports[key]) {
        
        // 如果是字符串 具名导出
        if (dataType(v) === 'string') {
          specificExportDeps.push(v)
        } else if (dataType(v) === 'object') {
          if (!checkImportOption(v as ConfigImportItemOption)) continue
          if ((v as ConfigImportItemOption).default) {
            defaultExportDep = (v as ImportOptionItem).name
          } else {
            specificExportDeps.push((v as ImportOptionItem).alias ? `${(v as ImportOptionItem).name} as ${(v as ImportOptionItem).alias}` : (v as ImportOptionItem).name)
          }
          
        }
      }
      importCodes.push(`import ${defaultExportDep}${specificExportDeps.length && defaultExportDep !== '' ? ',' : ''} ${specificExportDeps.length ? `{ ${specificExportDeps.join(',')} }` : ''} from "${key}";`)
    }
  }
  
  return importCodes.join("")
}

// 合并import选项
// importOption 传入的 import 对象
// moduleImportOption 合并后的 import 对象
export function mergeImportOption(importOption: ConfigImportOption, moduleImportOption: ImportOption) {
  
  for (const key in importOption) {
    if (Object.prototype.hasOwnProperty.call(importOption, key)) {
      if (dataType(importOption[key]) !== 'array') continue
      if (!Object.prototype.hasOwnProperty.call(moduleImportOption, key)) {
        moduleImportOption[key] = new Map()
      }
      for (const item of importOption[key]) {
        if (typeof item === 'string') {
          moduleImportOption[key].set(item, item)
        } else if (dataType(item) === 'object') {
          moduleImportOption[key].set(item.name, item)
        }
      }
    }
  }
}