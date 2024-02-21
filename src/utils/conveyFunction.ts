import { dataType } from "./dataType";

const ignoreKeys = new Set(['import', 'webpackChunkName', 'path', 'name'])

// 函数转存
export function conveyFunction(option: any) {
  // 遍历配置对象
  for (const key in option) {
    if (Object.prototype.hasOwnProperty.call(option, key)) {
      if (ignoreKeys.has(key)) continue
      const type = dataType(option[key])
      if (type === "function") {
        // 函数体
        try {
          let match = option[key].toString().match(/\{([\s\S]*)\}/)
          // 函数体
          const funBody = match && match[1] ? match[1] : ''
          // 入参
          match = option[key].toString().match(/\(([^)]*)\) (\{|=>)/)
          // 参数
          const funArgs = match && match[1] ? match[1] : ''
          // 替换换行符
          option[key] = `$$$function(${funArgs}) { ${funBody} } $$$`.replace(/\r\n/g, "\n")
        } catch (error) {
          console.log(error);
        }
      } else if (type === "object") {
        conveyFunction(option[key]);
      }
    }
  }
}