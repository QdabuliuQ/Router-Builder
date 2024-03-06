import fs from "node:fs"
import ora from 'ora'
import { getFilesInfo } from "./filesInfo";
import { readDictContent } from "./dictContent";
import { RouterBuilderConfig } from "./types/index";
import { outerRouterOptionHandle } from "./utils/generateFile";
import path from "node:path";


let customConfig = null;
// 尝试读取配置文件 router.config.js
try {
  customConfig = require(`${process.cwd()}/router.config.js`);
} catch (error) {
  const loading = ora('');
  loading.warn("the router.config.js is no exist")
}

(function () {
  if (!customConfig) return

  const loading = ora('scaning file...');
  loading.spinner = {
    "interval": 100,//转轮动画每帧之间的时间间隔  
    "frames": [
      "-", "\\", "|", "/", "-", "|"
    ],
  }
  loading.start();

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
  const fullPath = path.join(rootPath, entryPath)
  console.log(fullPath);


  // 判断入口文件夹是否存在
  if (fs.existsSync(fullPath)) {
    (async function () {
      try {
        const dictList = getFilesInfo(fullPath); // 获取path目录下的文件内容
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
        loading.stop()
        loading.succeed(`router file generation successful! (Time-consuming: ${Date.now() - start}ms)`);
      } catch (error) {
        loading.fail('generation failed!');
      }
    })();
  } else {
    loading.fail("the entry folder is no exist")
  }
})()

