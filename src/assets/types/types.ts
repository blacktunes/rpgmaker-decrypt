export interface DirectoryTree {
  path: string
  name: string
  children?: DirectoryTree[]
  disabled?: boolean
}
