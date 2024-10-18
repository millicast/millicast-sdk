const configReader = require('cucumber-playwright-framework/lib/readers/testConfigReader')
const fs = require('fs-extra')
const path = require('path')

const testConfigFile = path.join(__dirname, 'test.config.json')
process.env.TEST_CONFIG = testConfigFile
process.env.SUITE_START_TIME = `${new Date().toISOString()}`
const colorsEnabled = false

const testConfig = configReader.TestConfigReader.getConfig(testConfigFile)
fs.rmSync(testConfig.reportPath, { recursive: true, force: true })
fs.ensureDirSync(testConfig.artifactsPath)

if (!colorsEnabled) {
  process.env.FORCE_COLOR = '0'
}

const common = [
  './packages/millicast-sdk/e2e-tests/features/**/*.feature',
  '--require-module ts-node/register',
  '--require ./packages/millicast-sdk/e2e-tests/src/hooks/hooks.ts',
  '--require ./packages/millicast-sdk/e2e-tests/src/steps/**/*.ts',
  `-f json:${testConfig.reportPath}/${testConfig.reportFileName}.json`,
  `-f html:${testConfig.reportPath}/${testConfig.reportFileName}.html`,
  `-f junit:${testConfig.reportPath}/${testConfig.reportFileName}.junit`,
  '-f summary',
  '-f progress',
  `--retry ${testConfig.retry}`,
  `--parallel ${testConfig.parallel}`,
  `--format-options '{"colorsEnabled":${colorsEnabled}}'`
].join(' ')

const all = `${common} --tags "not @ignore and not @skip"`
const only = `${common} --tags "@only and not @ignore and not @skip"`
const ci = `${common} --tags "@ci and @LOCAL and not @ignore and not @skip"`
const smoke = `${common} --tags "@smoke and not @ignore and not @skip"`
const local = `${common} --tags "@LOCAL and not @ignore and not @skip"`
const rp2 = `${common} --tags "@RP2 and not @ignore and not @skip"`
const stg = `${common} --tags "@STG and not @ignore and not @skip"`
const prod = `${common} --tags "@PROD and not @ignore and not @skip"`

module.exports = {
  default: all,
  all,
  only,
  ci,
  smoke,
  local,
  rp2,
  stg,
  prod
}
