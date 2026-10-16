import { loadFeature, defineFeature } from 'jest-cucumber'
import fs from 'fs'
import path from 'path'

const feature = loadFeature('../features/UmdBundle.feature', { loadRelativePath: true, errors: true })

const distDir = path.resolve(__dirname, '../../dist')

defineFeature(feature, test => {
  let module
  let define
  let loadError

  const givenAmdEnvironment = (given) => {
    given('an environment with CommonJS module and an AMD define like webpack', () => {
      module = { exports: {} }
      define = jest.fn()
      define.amd = {}
    })
  }

  const whenLoad = (when, step, file) => {
    when(step, () => {
      const source = fs.readFileSync(path.join(distDir, file), 'utf8')
      loadError = null
      try {
        new Function('module', 'exports', 'define', source).call(globalThis, module, module.exports, define)
      } catch (e) {
        loadError = e
      }
    })
  }

  const thenWorkingLogger = (then) => {
    then('the SDK exports a working Logger', () => {
      expect(loadError).toBeNull()
      const { Logger } = module.exports
      expect(typeof Logger.get).toBe('function')
      expect(typeof Logger.setLevel).toBe('function')
      expect(() => Logger.get('UmdBundle').info('loaded')).not.toThrow()
    })
  }

  const andNoAmdRegistration = (and) => {
    and('no bundled dependency registers itself with the AMD define', () => {
      expect(define).not.toHaveBeenCalled()
    })
  }

  test('Load the UMD build where an AMD define is available', ({ given, when, then, and }) => {
    givenAmdEnvironment(given)
    whenLoad(when, 'I load the UMD build', 'millicast.umd.js')
    thenWorkingLogger(then)
    andNoAmdRegistration(and)
  })

  test('Load the debug UMD build where an AMD define is available', ({ given, when, then, and }) => {
    givenAmdEnvironment(given)
    whenLoad(when, 'I load the debug UMD build', 'millicast.debug.umd.js')
    thenWorkingLogger(then)
    andNoAmdRegistration(and)
  })
})
