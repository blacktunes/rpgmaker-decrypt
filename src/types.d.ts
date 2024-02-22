interface DirectoryTree {
  path: string
  name: string
  children?: DirectoryTree[] | null
  disabled?: boolean
  root?: symbol
}

type DirWorkerEvent =
  | {
      type: 'no-system'
      title: string
      content: string
    }
  | {
      type: 'system'
      key?: string
      title?: string
    }
  | {
      type: 'count'
      count: 'image' | 'audio'
    }
  | {
      type: 'image' | 'audio'
      data: DirectoryTree
    }
  | {
      type: 'done'
    }

interface PreviewItem {
  type: 'video' | 'image' | 'audio' | 'text' | 'other'
  name: string
  path: string
  text: string
}
