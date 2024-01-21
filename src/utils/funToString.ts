// 函数转换为字符串
export function conveyFunctionToString (router: any) {
  for (const key in router) {
    if (Object.hasOwnProperty.call(router, key)) {
      if (typeof router[key] === "function") {
        router[key] = `$$$${router[key].toString()}$$$`;
      } else if (router[key] && typeof router[key] === "object") {
        conveyFunctionToString(router[key]);
      }
    }
  }
  return router;
};