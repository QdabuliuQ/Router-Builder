import colors from "colors-console"
import fs from "node:fs"
import { getFilesInfo } from "./filesInfo";
import { readDictContent } from "./dictContent";
import { RouterBuilderConfig, ImportOption } from "./types/index";
import { outerRouterOptionHandle } from "./utils/generateFile";

let customConfig = null;
// 尝试读取配置文件 router.config.js
try {
  customConfig = require(`${process.cwd()}\\router.config.js`);
} catch (error) {
  console.log(colors(['white', 'redBG'], "the router.config.js is no exist"));
}

(function () {
  if (!customConfig) return
  const start = Date.now()
  // 定义默认的配置
  const defaultConfig: RouterBuilderConfig = {
    entry: "/src/views",
    output: "/src/router/router.js",
    importPrefix: "@/src/views",
    ignoreFolder: [],
    fileName: "index",
  };

  // 完整配置
  const mainConfig: RouterBuilderConfig = {
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

      for (const key in dictList) {
        // 遍历子文件夹
        if (dictList.hasOwnProperty(key)) {
          if (dictList[key].type === "dict") {

            // 判断是否是文件夹类型
            const res = await readDictContent(dictList[key], mainConfig as any); // 递归搜索

            if (res) {
              // 将递归的结果存入 router 数组
              router.push(...res);
            }
          }
        }
      }

      await outerRouterOptionHandle(router, mainConfig.output)

      console.log(colors(['white', 'greenBG'], `router file generation successful! (Time-consuming: ${Date.now() - start}ms)`));
    })();
  } else {
    console.log(colors(['white', 'redBG'], "the entry folder is no exist"));
  }
})()

