export function dataType(data: any): string {
  let type = Object.prototype.toString.call(data).split(" ")[1]
  return type.substring(0, type.length - 1).toLowerCase()
}