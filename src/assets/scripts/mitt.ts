import mitt from 'mitt'

type Events = {
  scrollToItem: void
}

export const emitter = mitt<Events>()
