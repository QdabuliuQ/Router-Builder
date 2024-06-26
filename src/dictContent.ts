import path from "node:path";
import { getFilesInfo } from "./filesInfo";
import { FileInfoItem, FilesInfo } from "./types/filesInfo";
import { generateRouterConfig, getRouterConfig } from "./routerConfig";
import { isRegExp } from "./utils/isRegExp";
import { RouterBuilderConfig } from "./types";
import { fileReader } from "./utils/fileReader";
import { rootPath } from "./utils/rootPath";

// 读取文件内容
async function readFileContent(dictInfo: FileInfoItem, mainConfig: RouterBuilderConfig) {
  try {
    // const data = await fs.promises.readFile(
    //   `${dictInfo.fullPath}/${mainConfig.fileName === "<dictName>" ? dictInfo.name : "index"
    //   }.vue`,
    //   "utf-8"
    // );

    const data = await fileReader(`${dictInfo.fullPath}/${mainConfig.fileName === "<dictName>" ? dictInfo.name : "index"
      }.vue`)

    const config = getRouterConfig(data);

    return config;
  } catch (err) {
    console.log(err, "error");
  }
};

// 读取文件夹内容
export async function readDictContent(dictInfo: FileInfoItem, mainConfig: RouterBuilderConfig, parentPath: string): Promise<any> {
  // 读取该文件夹下的子文件夹/文件
  const dictList: FilesInfo = getFilesInfo(dictInfo.fullPath, path.join(rootPath, mainConfig.entry));
  if (JSON.stringify(dictList) === "{}") return null; // 空文件夹 直接返回 null
  let router = null
  // 判断是否存在 vue 文件
  if (
    dictList.hasOwnProperty(
      mainConfig.fileName === "<dictName>"
        ? `${dictInfo.name}.vue`
        : "index.vue"
    )
  ) {
    // 判断文件夹内部是否存在页面文件（index.vue / <dictName>.vue）
    const defaultRouter = {
      // 默认 router 配置
      // path: dictInfo.names.length
      //   ? `/${dictInfo.names.join("/")}`
      //   : `/${dictInfo.name}`,
      path: parentPath ? `${parentPath}/${dictInfo.name}` : `/${dictInfo.name}`,
      name: dictInfo.name
    };
    // 读取页面文件 查看是否存在 <router></router> 配置对象
    const customRouter = await readFileContent(dictInfo, mainConfig);

    if (customRouter) {
      // 生成路由配置
      const res = await generateRouterConfig(
        customRouter,
        defaultRouter,
        dictInfo,
        mainConfig as any
      );
      if (res) {
        router = [...res]
      }
    }
  }
  // 遍历文件夹目录
  outer: for (const key in dictList) {
    if (
      // @ts-ignore
      dictList[
      mainConfig.fileName === "<dictName>"
        ? `${dictInfo.name}.vue`
        : "index.vue"
      ] === key
    ) continue
    if (dictList[key].type === 'file') continue
    for (const item of mainConfig.ignoreFolder) {
      if (typeof item === "string" || isRegExp(item)) {
        if (typeof item === "string" && item === dictList[key].name) {
          // 如果字符串 直接判断是否是要忽略的文件夹
          continue outer;
        }
        if (isRegExp(item) && (item as RegExp).test(dictList[key].name)) {
          // 如果是正则 直接判断是否是要忽略的文件夹
          continue outer;
        }
      }
    }
    // 继续递归调用查找，递归子文件夹

    if (router) {
      for (const item of router) {
        if (typeof item === 'string') continue;
        const res = await readDictContent(dictList[key], mainConfig, item.path);
        if (!item.children) item.children = [];
        res && item.children.push(...res);
      }
    } else {
      router = await readDictContent(dictList[key], mainConfig, parentPath);
    }
  }

  return router;
}