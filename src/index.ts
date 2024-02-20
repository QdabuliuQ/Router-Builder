import colors from "colors-console"
import fs from "node:fs"
import { getFilesInfo } from "./filesInfo";
import { readDictContent } from "./dictContent";
import { AutoRouterConfig, ImportOption } from "./types/index";
import { generateRouterFile } from "./routerConfig";
import { getImportCode } from "./utils/getImportCode";

let customConfig = null;
// 尝试读取配置文件 router.config.js
try {
  customConfig = require(`${process.cwd()}\\router.config.js`);
} catch (error) {
  console.log(colors(['white', 'redBG'], "the router.config.js is no exist"));
}

(function () {
  if (!customConfig) return
  // 定义默认的配置
  const defaultConfig: AutoRouterConfig = {
    entry: "/src/views",
    output: "/src/router/router.js",
    importPrefix: "@/src/views",
    ignoreFolder: [],
    fileName: "index",
  };

  // 完整配置
  const mainConfig: AutoRouterConfig = {
    ...defaultConfig,
    ...customConfig,
  };

  const rootPath = process.cwd();

  // 入口文件路径
  const entryPath = mainConfig.entry.split("/").filter(Boolean).join("\\");

  // 判断入口文件夹是否存在
  if (fs.existsSync(`${rootPath}\\${entryPath}`)) {
    (async function () {
      const dictList = getFilesInfo(`${rootPath}\\${entryPath}`); // 获取path目录下的文件内容
      const router = []; // router 对象
      // 导入语句
      const imports: ImportOption = {}
      for (const key in dictList) {
        // 遍历子文件夹
        if (dictList.hasOwnProperty(key)) {
          if (dictList[key].type === "dict") {
            // 判断是否是文件夹类型
            const res = await readDictContent(dictList[key], imports, mainConfig as any); // 递归搜索
            if (res) {
              // 将递归的结果存入 router 数组
              router.push(...res);
            }
          }
        }
      }
      // 将 router 内容写入到文件当中
      generateRouterFile(
        // 转为json 并且移除函数标识符
        JSON.stringify(router).replace(/"\$\$\$|\$\$\$"|\\r|\\n/g, ""),
        getImportCode(imports),
        mainConfig
      );
      console.log(colors(['white', 'greenBG'], "router file generation successful!"));
    })();
  } else {
    console.log(colors(['white', 'redBG'], "the entry folder is no exist"));
  }
})()

