interface StateEvent {
  ready: boolean
  busy: boolean
}

type WorkerEvent =
  | {
      type: 'error'
      content: string
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
      type: 'count'
      content: 'image' | 'audio'
    }
  | {
      type: 'image' | 'audio'
      content: DirectoryTree
    }
  | {
      type: 'done'
      content: {
        baseUrl: string
        key?: string
        title?: string
      }
    }

interface SaveFileWorkerProps {
  filesList: {
    image: BaseItem[]
    audio: BaseItem[]
  }
  dir?: string
  baseUrl: string
  encryptionKey: string
  gameTitle?: string
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
      reload?: boolean
    }
