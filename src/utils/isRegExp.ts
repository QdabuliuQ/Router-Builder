// 判断是否是正则类型
export function isRegExp(value: any): boolean {
  return Object.prototype.toString.call(value) === "[object RegExp]";
};