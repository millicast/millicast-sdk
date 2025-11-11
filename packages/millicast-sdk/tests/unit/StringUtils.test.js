import { hexToUint8Array } from '../../src/utils/StringUtils'

describe('hexToUint8Array', () => {
  test('should return empty Uint8Array for null input', () => {
    const result = hexToUint8Array(null)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(0)
  })

  test('should return empty Uint8Array for undefined input', () => {
    const result = hexToUint8Array(undefined)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(0)
  })

  test('should return empty Uint8Array for empty string', () => {
    const result = hexToUint8Array('')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(0)
  })

  test('should convert simple hex string to Uint8Array', () => {
    const result = hexToUint8Array('48656c6c6f')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual([72, 101, 108, 108, 111])
  })

  test('should convert hex string with uppercase letters', () => {
    const result = hexToUint8Array('48656C6C6F')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual([72, 101, 108, 108, 111])
  })

  test('should convert hex string with mixed case', () => {
    const result = hexToUint8Array('48656c6C6f')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual([72, 101, 108, 108, 111])
  })

  test('should handle single byte (two hex characters)', () => {
    const result = hexToUint8Array('ff')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual([255])
  })

  test('should handle zero values', () => {
    const result = hexToUint8Array('0000')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual([0, 0])
  })

  test('should handle maximum byte values', () => {
    const result = hexToUint8Array('ffff')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual([255, 255])
  })

  test('should handle hex string with all possible hex digits', () => {
    const result = hexToUint8Array('0123456789abcdef')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual([1, 35, 69, 103, 137, 171, 205, 239])
  })

  test('should handle long hex strings', () => {
    const hexString = '0102030405060708090a0b0c0d0e0f10'
    const result = hexToUint8Array(hexString)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(16)
    expect(Array.from(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
  })

  // Error cases
  test('should throw error for odd length hex string', () => {
    expect(() => hexToUint8Array('abc')).toThrow('Invalid hex string: odd length')
    expect(() => hexToUint8Array('a')).toThrow('Invalid hex string: odd length')
    expect(() => hexToUint8Array('12345')).toThrow('Invalid hex string: odd length')
  })

  test('should throw error for invalid hex characters', () => {
    expect(() => hexToUint8Array('gg')).toThrow('Invalid hex string: contains non-hex characters')
    expect(() => hexToUint8Array('12gh')).toThrow('Invalid hex string: contains non-hex characters')
    expect(() => hexToUint8Array('xyz')).toThrow('Invalid hex string: contains non-hex characters')
    expect(() => hexToUint8Array('12 34')).toThrow('Invalid hex string: contains non-hex characters')
  })

  test('should throw error for hex string with special characters', () => {
    expect(() => hexToUint8Array('12-34')).toThrow('Invalid hex string: contains non-hex characters')
    expect(() => hexToUint8Array('0x1234')).toThrow('Invalid hex string: contains non-hex characters')
    expect(() => hexToUint8Array('12.34')).toThrow('Invalid hex string: contains non-hex characters')
  })
})
