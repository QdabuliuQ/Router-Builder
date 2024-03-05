import fs from "node:fs"
import path from "node:path"
import { FilesInfo } from "./types/filesInfo";
import { rootPath } from "./utils/rootPath";

// 读取目录内容
export function getFilesInfo(filePath: string) {
  let files: Array<string> = fs.readdirSync(filePath);
  const filesInfo: FilesInfo = {};
  files.forEach(function (fileName) {
    const filedir: string = path.join(filePath, fileName); // 文件路径
    const stats: fs.Stats = fs.statSync(filedir); // 获取文件信息
    filesInfo[fileName] = {
      type: stats.isFile() ? "file" : "dict",
      path: `/${fileName}`,
      name: fileName,
      names: [
        ...filePath
          .replace(`${rootPath}/src/views`, "")
          .split("/")
          .filter(Boolean),
        fileName,
      ],
      fullPath: filedir,
    };
  });
  return filesInfo;
};