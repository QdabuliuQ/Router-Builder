import { ImportOption, ImportOptionItem } from "../types"
import { dataType } from "./dataType"

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
          const depName = !(v as ImportOptionItem).default && (v as ImportOptionItem).alias ? `${(v as ImportOptionItem).name} as ${(v as ImportOptionItem).alias}` : `${(v as ImportOptionItem).name}`
          if ((v as ImportOptionItem).default) {
            defaultExportDep = depName
          } else {
            specificExportDeps.push(depName)
          }
        }
      }
      importCodes.push(`import ${specificExportDeps.length && defaultExportDep !== '' ? `${defaultExportDep},` : ""} ${specificExportDeps.length ? `{ ${specificExportDeps.join(',')} }` : ''} from "${key}";`)
    }
  }
  return importCodes.join("")
}