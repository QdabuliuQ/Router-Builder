export interface RouterBuilderConfig {
  entry: string
  output: string
  importPrefix: string
  ignoreFolder: Array<string | RegExp>
  fileName: string
}

export interface ConfigImportItemOption {
  name: string
  alias?: string
  default?: boolean
}

export interface ConfigImportOption {
  [propName: string]: Array<string | ConfigImportItemOption>
}

export interface ImportOptionItem {
  alias?: string
  name: string
  default: boolean
}

export interface ImportOption {
  [propName: string]: Map<string, string | ConfigImportItemOption>
}

export interface ImportObject {
  [propName: string]: {
    [propName: string]: string
  }
}