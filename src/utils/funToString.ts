const ignoreKeys = new Set(['import', 'webpackChunkName', 'path', 'name'])

// 函数转换为字符串
export function conveyFunctionToString(router: any) {
  for (const key in router) {
    if (Object.hasOwnProperty.call(router, key)) {
      if (ignoreKeys.has(key)) continue
      if (typeof router[key] === "function") {
        router[key] = `$$$${router[key].toString()}$$$`;
      } else if (router[key] && typeof router[key] === "object") {
        conveyFunctionToString(router[key]);
      }
    }
  }
  return router;
};