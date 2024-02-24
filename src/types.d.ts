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
  type: 'video' | 'image' | 'audio' | 'text' | 'other'
  name: string
  path: string
  text: string
}

type WorkerEventError = ErrorEvent | Error

type WorkerEvent =
  | {
      type: 'error'
      content: WorkerEventError
    }
  | {
      type: 'message-error'
      content: {
        title?: string
        message: string
      }
    }

type LoadFileWorkerEvent =
  | WorkerEvent
  | {
      type: 'no-system'
    }
  | {
      type: 'system'
      content: {
        key?: string
        title?: string
      }
    }
  | {
      type: 'count'
      content: 'image' | 'audio'
    }
  | {
      type: 'image' | 'audio'
      content: DirectoryTree
    }
  | {
      type: 'done'
    }

interface SaveFileWorkerProps {
  filesList: {
    image: BaseItem[]
    audio: BaseItem[]
  }
  dir: string
  baseUrl: string
  encryptionKey: string
  gameTitle?: string
  decrypt?: boolean
  backup?: boolean
}

type SaveFileWorkerEvent =
  | WorkerEvent
  | {
      type: 'progress'
      content: 'image' | 'audio'
    }
  | {
      type: 'done'
    }
