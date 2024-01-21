export interface AutoRouterConfig {
  entry: string
  output: string
  importPrefix: string
  ignoreFolder: Array<string | RegExp>
  fileName: string
}