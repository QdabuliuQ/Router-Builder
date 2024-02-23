import lineReader from "line-reader"

const startRouterTarget = /<router>/
const endRouterTarget = /<\/router>/

export function fileReader(path: string): Promise<string> {
  return new Promise((resolve) => {
    let isTarget: boolean = false;

    const optionStr: Array<string> = []
    lineReader.eachLine(path, (line: string) => {

      // 开始标签
      if (!isTarget && startRouterTarget.test(line)) {
        isTarget = true
      }
      if (isTarget && endRouterTarget.test(line)) {  // 结束标签
        isTarget = false
      }

      if (!isTarget && (line.length === 0 || /<template>|<script[\s\S]*>|<style[\s\S]*>/.test(line))) {
        resolve(optionStr.join("\n"))
        return false
      }
      optionStr.push(line);
    });
  })
}