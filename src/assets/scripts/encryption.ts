export const decryptBuffer = (arrayBuffer: ArrayBufferLike, encryptionKey: string) => {
  const body = arrayBuffer.slice(16)
  const view = new DataView(body)
  const key = encryptionKey.match(/.{2}/g)!

  for (let i = 0; i < 16; i++) {
    view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16))
  }
  return body
}

export const encryptionBuffer = (arrayBuffer: ArrayBufferLike, encryptionKey: string) => {
  const body = arrayBuffer
  const view = new DataView(body)
  const key = encryptionKey.match(/.{2}/g)!

  for (let i = 0; i < 16; i++) {
    view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16))
  }
  return Buffer.concat([Buffer.from(new ArrayBuffer(16)), Buffer.from(arrayBuffer)]).buffer
}
