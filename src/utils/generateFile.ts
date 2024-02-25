import fs from "node:fs"
import prettier from "prettier"
import { rootPath } from "./rootPath";
import { dataType } from "./dataType";
import { ImportOption } from "../types";
import { getImportCode, mergeImportOption } from "./getImportCode";

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

  // 路由导入模块语句映射
  const moduleRouterMapped = new Map<string, Array<string>>()
  // import 导入语句映射
  const moduleDepMapped = new Map<string, ImportOption>()
  const name = fileName.split(".")[0]
  // 初始化
  moduleRouterMapped.set(name, []);
  moduleDepMapped.set(name, {})

  // 遍历所有路由
  for (let i = 0; i < routers.length; i++) {

    // 判断是否存在 module 抽离模块属性
    if (Object.prototype.hasOwnProperty.call(routers[i], 'module')) {

      const moduleName = routers[i].module
      delete routers[i].module

      if (dataType(routers[i].import) === 'object') {  // 如果存在 import 导入对象
        // 进行转换
        if (!moduleDepMapped.has(moduleName)) {
          moduleDepMapped.set(moduleName, {})
        }
        mergeImportOption(routers[i].import, moduleDepMapped.get(moduleName) as ImportOption)
        delete routers[i].import
      }

      // 递归调用
      await innerRouterOptionHandle(routers[i], moduleName, moduleDepMapped, moduleRouterMapped)
      // 标记为 抽离默认
      routers[i] = `$$$${moduleName}$$$`;

      // 加入模块导入语句数组
      (moduleRouterMapped.get(name) as Array<string>).push(`import ${routers[i].replace(/\$\$\$/g, "")} from "./${routers[i].replace(/\$\$\$/g, "")}"`)
    } else {
      if (dataType(routers[i].import) === 'object') {  // 如果存在 import 导入对象
        // 进行转换
        mergeImportOption(routers[i].import, moduleDepMapped.get(name) as ImportOption)
        delete routers[i].import
      }

      // 递归调用
      await innerRouterOptionHandle(routers[i], name, moduleDepMapped, moduleRouterMapped)
    } 
  }

  // 将模块导入对象转为 导入语句
  const importDepCode = getImportCode(moduleDepMapped.get(name) as ImportOption)

  // 格式化代码 去除特殊标识
  const outerRouter = JSON.stringify(routers).replace(/"\$\$\$|\$\$\$"|\$\$\$/g, "").replace(/\\n/g, '\n')

  // 格式化代码
  const code = await prettier.format(generateRouterTemplate(outerRouter, importDepCode, (moduleRouterMapped.get(name) as Array<string>).join("\n")), { parser: 'babel' });
  
  // 写入文件
  fs.promises.writeFile(
    `${rootPath}//${outputPath}//${fileName}`,
    code
  );
}

// 子路由模块处理
async function innerRouterOptionHandle(router: any, module: string, moduleDepMapped: Map<string, ImportOption>, moduleRouterMapped: Map<string, Array<string>>) {
  if (!moduleRouterMapped.has(module)) {
    moduleRouterMapped.set(module, [])
  }
  if(!moduleDepMapped.has(module)) {
    moduleDepMapped.set(module, {})
  }

  // 判断是否存在子路由
  if (router.children) {
    
    // 遍历子路由
    for (let i = 0; i < router.children.length; i++) {

      // 子路由是否存在 module 属性
      if (Object.prototype.hasOwnProperty.call(router.children[i], 'module') && typeof router.children[i].module === 'string') {
        
        const moduleName = router.children[i].module

        // 删除 module 属性
        delete router.children[i].module

        if (dataType(router.children[i].import) === 'object') {  // 如果存在 import 导入对象
          
          // 进行转换
          if (!moduleDepMapped.has(moduleName)) {
            moduleDepMapped.set(moduleName, {})
          }
          mergeImportOption(router.children[i].import, moduleDepMapped.get(moduleName) as ImportOption)
          delete router.children[i].import
        }

        // 递归处理
        await innerRouterOptionHandle(router.children[i], moduleName, moduleDepMapped, moduleRouterMapped)

        // 标记模块抽离
        router.children[i] = `$$$${moduleName}$$$`;

        // 加入模块导入语句数组
        (moduleRouterMapped.get(module) as Array<string>).push(`import ${router.children[i].replace(/\$\$\$/g, "")} from "./${router.children[i].replace(/\$\$\$/g, "")}"`)
      } else {
        if (dataType(router.children[i].import) === 'object') {  // 如果存在 import 导入对象
          if (!moduleDepMapped.has(module)) {
            moduleDepMapped.set(module, {})
          }
          // 进行转换
          mergeImportOption(router.children[i].import, moduleDepMapped.get(module) as ImportOption)
          delete router.children[i].import
        }

        // 递归调用
        await innerRouterOptionHandle(router.children[i], module, moduleDepMapped, moduleRouterMapped)
      }
    }
  }

  // 代码去除特殊表述
  router = JSON.stringify(router).replace(/"\$\$\$|\$\$\$"|\$\$\$/g, "").replace(/\\n/g, '\n')

  // 将模块导入对象转为 导入语句
  const importDepCode = getImportCode(moduleDepMapped.get(module) as ImportOption)

  // 格式化代码
  const code = await prettier.format(generateRouterTemplate(router, importDepCode, (moduleRouterMapped.get(module) as Array<string>).join("\n")), { parser: 'babel' });

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