interface DirectoryTree {
  path: string
  name: string
  children?: DirectoryTree[]
  disabled?: boolean
}

type DirWorkerEvent =
  | {
      type: 'no-system'
      title: string
      content: string
    }
  | {
      type: 'system'
      key: string
      title: string
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
