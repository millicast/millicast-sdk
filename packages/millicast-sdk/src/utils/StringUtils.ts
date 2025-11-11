export function hexToUint8Array(hexString: string|null|undefined): Uint8Array {
  if (!hexString) {
    return new Uint8Array();
  }

  // Validate hex string format
  if (!/^[0-9a-fA-F]*$/.test(hexString)) {
    throw new Error('Invalid hex string: contains non-hex characters');
  }

  // Throw error for odd length strings
  if (hexString.length%2!==0) {
    throw new Error('Invalid hex string: odd length');
  }

  const length=hexString.length;
  const uint8Array=new Uint8Array(length/2);

  for (let i=0;i<length;i+=2) {
    uint8Array[i/2]=parseInt(hexString.substr(i, 2), 16);
  }

  return uint8Array;
}