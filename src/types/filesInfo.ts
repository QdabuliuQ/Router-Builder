export interface FileInfoItem {
  type: 'file' | 'dict'
  path: string
  name: string
  names: Array<string>
  fullPath: string
}

export interface FilesInfo {
  [propName: string]: FileInfoItem
}