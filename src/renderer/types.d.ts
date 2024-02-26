interface BaseItem {
  path: string
  name: string
}

type DirectoryTree = BaseItem & {
  children?: DirectoryTree[] | null
  disabled?: boolean
  root?: symbol
}

interface PreviewItem {
  type: 'video' | 'image' | 'audio' | 'text' | 'error' | 'other'
  name: string
  path: string
  text: string
}
