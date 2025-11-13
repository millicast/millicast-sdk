import { swapPropertyValues, typedKeys } from '../../src/utils/ObjectUtils'

describe('swapPropertyValues', () => {
  test('should swap string values between objects', () => {
    const obj1 = { name: 'Alice', age: 25 }
    const obj2 = { name: 'Bob', age: 30 }

    swapPropertyValues(obj1, obj2, 'name')

    expect(obj1.name).toBe('Bob')
    expect(obj2.name).toBe('Alice')
    expect(obj1.age).toBe(25) // unchanged
    expect(obj2.age).toBe(30) // unchanged
  })

  test('should swap number values between objects', () => {
    const obj1 = { id: 1, score: 100 }
    const obj2 = { id: 2, score: 200 }

    swapPropertyValues(obj1, obj2, 'score')

    expect(obj1.score).toBe(200)
    expect(obj2.score).toBe(100)
    expect(obj1.id).toBe(1) // unchanged
    expect(obj2.id).toBe(2) // unchanged
  })

  test('should swap boolean values between objects', () => {
    const obj1 = { active: true, verified: false }
    const obj2 = { active: false, verified: true }

    swapPropertyValues(obj1, obj2, 'active')

    expect(obj1.active).toBe(false)
    expect(obj2.active).toBe(true)
  })

  test('should swap array values between objects', () => {
    const obj1 = { items: [1, 2, 3], tags: ['a'] }
    const obj2 = { items: [4, 5, 6], tags: ['b'] }

    swapPropertyValues(obj1, obj2, 'items')

    expect(obj1.items).toEqual([4, 5, 6])
    expect(obj2.items).toEqual([1, 2, 3])
  })

  test('should swap object values between objects', () => {
    const obj1 = { config: { theme: 'dark' }, data: null }
    const obj2 = { config: { theme: 'light' }, data: null }

    swapPropertyValues(obj1, obj2, 'config')

    expect(obj1.config.theme).toBe('light')
    expect(obj2.config.theme).toBe('dark')
  })

  test('should swap null/undefined values', () => {
    const obj1 = { value: null, other: 1 }
    const obj2 = { value: undefined, other: 2 }

    swapPropertyValues(obj1, obj2, 'value')

    expect(obj1.value).toBeUndefined()
    expect(obj2.value).toBeNull()
  })

  // Edge cases and error conditions
  test('should handle when first object missing property', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const obj1 = { name: 'Alice' }
    const obj2 = { name: 'Bob', age: 30 }

    swapPropertyValues(obj1, obj2, 'age')

    expect(consoleSpy).toHaveBeenCalledWith(
      'One or both objects do not have the property "age"'
    )
    expect(obj1.name).toBe('Alice') // unchanged
    expect(obj2.name).toBe('Bob') // unchanged
    expect(obj2.age).toBe(30) // unchanged

    consoleSpy.mockRestore()
  })

  test('should handle when second object missing property', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const obj1 = { name: 'Alice', age: 25 }
    const obj2 = { name: 'Bob' }

    swapPropertyValues(obj1, obj2, 'age')

    expect(consoleSpy).toHaveBeenCalledWith(
      'One or both objects do not have the property "age"'
    )
    expect(obj1.name).toBe('Alice') // unchanged
    expect(obj1.age).toBe(25) // unchanged
    expect(obj2.name).toBe('Bob') // unchanged

    consoleSpy.mockRestore()
  })

  test('should handle when both objects missing property', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const obj1 = { name: 'Alice' }
    const obj2 = { name: 'Bob' }

    swapPropertyValues(obj1, obj2, 'age')

    expect(consoleSpy).toHaveBeenCalledWith(
      'One or both objects do not have the property "age"'
    )
    expect(obj1.name).toBe('Alice') // unchanged
    expect(obj2.name).toBe('Bob') // unchanged

    consoleSpy.mockRestore()
  })

  test('should work with different object types', () => {
    const person = { name: 'Alice', age: 25 }
    const employee = { name: 'Bob', age: 30, department: 'IT' }

    swapPropertyValues(person, employee, 'name')

    expect(person.name).toBe('Bob')
    expect(employee.name).toBe('Alice')
    expect(employee.department).toBe('IT') // unchanged
  })

  test('should work with symbol keys', () => {
    const sym = Symbol('test')
    const obj1 = { [sym]: 'value1' }
    const obj2 = { [sym]: 'value2' }

    swapPropertyValues(obj1, obj2, sym)

    expect(obj1[sym]).toBe('value2')
    expect(obj2[sym]).toBe('value1')
  })

  test('should work with numeric string keys', () => {
    const obj1 = { 123: 'first' }
    const obj2 = { 123: 'second' }

    swapPropertyValues(obj1, obj2, '123')

    expect(obj1['123']).toBe('second')
    expect(obj2['123']).toBe('first')
  })
})

describe('typedKeys', () => {
  test('should return keys for simple object', () => {
    const obj = { name: 'Alice', age: 25, active: true }
    const keys = typedKeys(obj)

    expect(keys).toEqual(['name', 'age', 'active'])
    expect(keys).toHaveLength(3)
  })

  test('should return empty array for empty object', () => {
    const obj = {}
    const keys = typedKeys(obj)

    expect(keys).toEqual([])
    expect(keys).toHaveLength(0)
  })

  test('should return keys for object with different value types', () => {
    const obj = {
      str: 'string',
      num: 42,
      bool: true,
      arr: [1, 2, 3],
      obj: { nested: true },
      nullVal: null,
      undefinedVal: undefined
    }
    const keys = typedKeys(obj)

    expect(keys).toEqual([
      'str',
      'num',
      'bool',
      'arr',
      'obj',
      'nullVal',
      'undefinedVal'
    ])
    expect(keys).toHaveLength(7)
  })

  test('should return keys for object with numeric string keys', () => {
    const obj = { 0: 'first', 1: 'second', name: 'test' }
    const keys = typedKeys(obj)

    expect(keys).toEqual(['0', '1', 'name'])
    expect(keys).toHaveLength(3)
  })

  test('should not return symbol keys', () => {
    const sym = Symbol('test')
    const obj = { name: 'Alice', [sym]: 'symbolValue' }
    const keys = typedKeys(obj)

    // Object.keys() doesn't return symbol keys
    expect(keys).toEqual(['name'])
    expect(keys).toHaveLength(1)
  })

  test('should not return inherited properties', () => {
    class Parent {
      constructor () {
        this.parentProp = 'parent'
      }
    }

    class Child extends Parent {
      constructor () {
        super()
        this.childProp = 'child'
      }
    }

    const obj = new Child()
    const keys = typedKeys(obj)

    // Should only return own properties
    expect(keys).toContain('childProp')
    expect(keys).toContain('parentProp') // This will be included since it's an own property
    expect(keys).not.toContain('constructor')
  })

  test('should work with various object structures', () => {
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' }
    const keys = typedKeys(user)

    expect(keys).toEqual(['id', 'name', 'email'])
    expect(keys).toHaveLength(3)
  })

  test('should maintain correct behavior', () => {
    const obj = { name: 'Alice', age: 25 }
    const keys = typedKeys(obj)

    // Ensure all returned keys exist on the object
    keys.forEach(key => {
      expect(typeof key).toBe('string')
      expect(Object.prototype.hasOwnProperty.call(obj, key)).toBe(true)
    })
  })

  test('should work with readonly objects', () => {
    const obj = Object.freeze({ name: 'Alice', age: 25 })
    const keys = typedKeys(obj)

    expect(keys).toEqual(['name', 'age'])
    expect(keys).toHaveLength(2)
  })
})
