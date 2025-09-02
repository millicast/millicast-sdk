export default class BitStreamReader {
    private data;
    private bitOffset;
    constructor(uint8Array: Uint8Array);
    readBits(numBits: number): number;
    skip(numBits: number): void;
    readExpGolombUnsigned(): number;
    readExpGolombSigned(): number;
}
