import { loadFeature, defineFeature } from 'jest-cucumber'
import fs from 'fs'
import path from 'path'

const feature = loadFeature('../features/UmdBundle.feature', { loadRelativePath: true, errors: true })

const distDir = path.resolve(__dirname, '../../dist')

defineFeature(feature, test => {
  let module
  let define
  let sdkExports
  let loadError

  const givenCommonJsAndAmdEnvironment = (given) => {
    given('an environment with CommonJS module and an AMD define like webpack', () => {
      module = { exports: {} }
      define = jest.fn()
      define.amd = {}
    })
  }

  const givenAmdOnlyEnvironment = (given) => {
    given('an environment with only an AMD define like RequireJS', () => {
      module = undefined
      define = jest.fn((deps, factory) => {
        sdkExports = {}
        factory(sdkExports)
      })
      define.amd = {}
    })
  }

  const whenLoad = (when, step, file) => {
    when(step, () => {
      const source = fs.readFileSync(path.join(distDir, file), 'utf8')
      sdkExports = undefined
      loadError = null
      try {
        new Function('module', 'exports', 'define', source).call(globalThis, module, module?.exports, define)
        if (module) {
          sdkExports = module.exports
        }
      } catch (e) {
        loadError = e
      }
    })
  }

  const thenWorkingLogger = (step) => {
    step('the SDK exports a working Logger', () => {
      expect(loadError).toBeNull()
      const { Logger } = sdkExports
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

  const thenSdkRegistersWithAmd = (then) => {
    then('the SDK registers itself once with the AMD define', () => {
      expect(loadError).toBeNull()
      expect(define).toHaveBeenCalledTimes(1)
      expect(define).toHaveBeenCalledWith(['exports'], expect.any(Function))
    })
  }

  test('Load the UMD build where an AMD define is available', ({ given, when, then, and }) => {
    givenCommonJsAndAmdEnvironment(given)
    whenLoad(when, 'I load the UMD build', 'millicast.umd.js')
    thenWorkingLogger(then)
    andNoAmdRegistration(and)
  })

  test('Load the debug UMD build where an AMD define is available', ({ given, when, then, and }) => {
    givenCommonJsAndAmdEnvironment(given)
    whenLoad(when, 'I load the debug UMD build', 'millicast.debug.umd.js')
    thenWorkingLogger(then)
    andNoAmdRegistration(and)
  })

  test('Load the UMD build with an AMD-only loader', ({ given, when, then, and }) => {
    givenAmdOnlyEnvironment(given)
    whenLoad(when, 'I load the UMD build', 'millicast.umd.js')
    thenSdkRegistersWithAmd(then)
    thenWorkingLogger(and)
  })

  test('Load the debug UMD build with an AMD-only loader', ({ given, when, then, and }) => {
    givenAmdOnlyEnvironment(given)
    whenLoad(when, 'I load the debug UMD build', 'millicast.debug.umd.js')
    thenSdkRegistersWithAmd(then)
    thenWorkingLogger(and)
  })
})
