export interface RouterBuilderConfig {
  entry: string
  output: string
  importPrefix: string
  ignoreFolder: Array<string | RegExp>
  fileName: string
}

export interface ImportOptionItem {
  alias?: string
  name: string
  default: boolean
}

export interface ImportOption {
  [propName: string]: Map<string, string | ImportOptionItem>
}

export interface ImportObject {
  [propName: string]: {
    [propName: string]: string
  }
}