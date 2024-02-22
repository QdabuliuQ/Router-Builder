import fs from "node:fs"
import prettier from "prettier"
import { rootPath } from "./rootPath";
import { dataType } from "./dataType";
import { depImportCode } from "./importCode";
import { ImportOption } from "../types";
import { getImportCode } from "./getImportCode";

let outputPath: string | null = null

// 判断输出路径是否存在
async function checkOutputPath(path: string): Promise<void> {
  // 解析输出路径
  const paths: string[] = path.split("/").filter((item) => Boolean(item));
  paths.pop()
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
}

// 搜索 import 选项 整合到 importOption 对象当中
function generateDepsImport(router: any, importOption: ImportOption) {
  // 如果存在 import 属性
  if (dataType(router.import) === 'object') {
    // 转换
    depImportCode(router.import, importOption)
    delete router.import
  }
  // 递归查找子路由
  if (router.children) {
    for (const item of router.children) {
      // 递归调用
      generateDepsImport(item, importOption)
    }
  }
}

// 外层路由处理
export async function outerRouterOptionHandle(routers: Array<any>, output: string) {
  let fileName: string = '';  // 文件名称
  if (!outputPath) {
    // 检查文件输出路径
    checkOutputPath(output)
    // 路径格式化处理
    const path = output.split("/").filter((item) => Boolean(item))
    fileName = path.pop() as string
    outputPath = path.join("//") + '//'
  }

  const importOption: ImportOption = {}  // 依赖导入
  const moduleImports: Array<string> = []  // 路由模块导入

  // 遍历所有路由
  for (let i = 0; i < routers.length; i++) {
    // 判断是否存在 module 抽离模块属性
    if (Object.prototype.hasOwnProperty.call(routers[i], 'module')) {
      // 递归调用
      await innerRouterOptionHandle(routers[i], routers[i].module)
      // 标记为 抽离默认
      routers[i] = `$$$${routers[i].module}$$$`
      // 加入模块导入语句数组
      moduleImports.push(`import ${routers[i].replace(/\$\$\$/g, "")} from "./${routers[i].replace(/\$\$\$/g, "")}"`)
    } else if (dataType(routers[i].import) === 'object') {  // 如果存在 import 导入对象
      // 进行转换
      generateDepsImport(routers[i], importOption)
    }
  }

  // 将模块导入对象转为 导入语句
  const imports = getImportCode(importOption)

  // 格式化代码 去除特殊标识
  const outerRouter = JSON.stringify(routers).replace(/"\$\$\$|\$\$\$"|\$\$\$/g, "").replace(/\\n/g, '\n')

  // 格式化代码
  const code = await prettier.format(generateRouterTemplate(outerRouter, imports, moduleImports.join("\n")), { parser: 'babel' });

  // 写入文件
  fs.promises.writeFile(
    `${rootPath}//${outputPath}//${fileName}`,
    code
  );
}

// 子路由模块处理
async function innerRouterOptionHandle(router: any, module: string) {
  const importOption: ImportOption = {}  // 依赖导入
  if (Object.prototype.hasOwnProperty.call(router, 'import')) {
    generateDepsImport(router, importOption)
  }

  const moduleImports = []  // 路由模块导入
  // 判断是否存在子路由
  if (router.children) {
    // 遍历子路由
    for (let i = 0; i < router.children.length; i++) {
      // 子路由是否存在 module 属性
      if (Object.prototype.hasOwnProperty.call(router.children[i], 'module')) {
        // 递归处理
        await innerRouterOptionHandle(router.children[i], router.children[i].module)
        // 标记模块抽离
        router.children[i] = `$$$${router.children[i].module}$$$`
        // 加入模块导入语句数组
        moduleImports.push(`import ${router.children[i].replace(/\$\$\$/g, "")} from "./${router.children[i].replace(/\$\$\$/g, "")}"`)
      } else if (dataType(router.children[i].import) === 'object') {  // 如果存在 import 导入对象
        // 进行转换
        generateDepsImport(router.children[i], importOption)
      }
    }
  }
  // 代码去除特殊表述
  router = JSON.stringify(router).replace(/"\$\$\$|\$\$\$"|\$\$\$/g, "").replace(/\\n/g, '\n')

  // 将模块导入对象转为 导入语句
  const imports = getImportCode(importOption)

  // 格式化代码
  const code = await prettier.format(generateRouterTemplate(router, imports, moduleImports.join("\n")), { parser: 'babel' });

  // 写入文件
  fs.promises.writeFile(
    `${rootPath}//${outputPath}//${module}.js`,
    code
  );
}

function generateRouterTemplate(router: string, imports: string, moduleImports: string) {
  return `
${moduleImports}
${imports}
export default ${router}  
  `
}