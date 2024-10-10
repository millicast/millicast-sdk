export function hexToUint8Array(hexString: string): Uint8Array {
  if (!hexString) {
    return new Uint8Array()
  }
  const length = hexString.length
  const uint8Array = new Uint8Array(length / 2)
  for (let i = 0; i < length; i += 2) {
    uint8Array[i / 2] = parseInt(hexString.substr(i, 2), 16)
  }
  return uint8Array
}
