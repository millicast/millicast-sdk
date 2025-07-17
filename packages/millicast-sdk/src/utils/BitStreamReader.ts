export default class BitStreamReader {
  private data: Uint8Array;
  private bitOffset = 0;

  constructor(uint8Array: Uint8Array) {
    this.data = uint8Array;
  }

  readBits(numBits: number) {
    if (this.bitOffset + numBits > this.data.length * 8) {
      throw new Error('Attempted to read past the end of the bitstream');
    }

    let value = 0;
    for (let i = 0; i < numBits; i++) {
      const byteOffset = Math.floor(this.bitOffset / 8);
      const bitIndex = 7 - (this.bitOffset % 8);
      const bit = (this.data[byteOffset] >> bitIndex) & 1;
      value |= bit << (numBits - 1 - i);
      this.bitOffset++;
    }
    return value;
  }

  skip(numBits: number) {
    this.bitOffset += numBits;
  }

  readExpGolombUnsigned() {
    let leadingZeros = -1;
    for (let b = 0; b === 0; leadingZeros++) {
      b = this.readBits(1);
    }
    return (1 << leadingZeros) - 1 + this.readBits(leadingZeros);
  }

  readExpGolombSigned() {
    const value = this.readExpGolombUnsigned();
    return value % 2 === 0 ? -(value / 2) : (value + 1) / 2;
  }
}
