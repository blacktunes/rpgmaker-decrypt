import mitt from 'mitt'

type Events = {
  scrollToItem: void
  reload: void
}

export const emitter = mitt<Events>()
