import { generate, Options } from 'cucumber-html-reporter';
import { TestConfigReader } from 'cucumber-playwright-framework/lib/readers/testConfigReader';
import { TestConfig } from 'cucumber-playwright-framework/lib/types/types';
import { cleanupEmptyFolders } from 'cucumber-playwright-framework/lib/utils/helper';

const testConfigFile = `${process.cwd()}/test.config.json`;
const testConfig = TestConfigReader.getConfig(testConfigFile);
const getBrowserName = (testConfig: TestConfig) => {
  return testConfig.apps.map((app) => `${app.appName}: ${app.browserName}`).join(', ');
};

const reportOptions: Options = {
  theme: 'bootstrap',
  name: 'Test Automation Report',
  brandTitle: `${testConfig.reportFileName}`,
  jsonFile: `${testConfig.reportPath}/${testConfig.reportFileName}.json`,
  output: `${testConfig.reportPath}/${testConfig.reportFileName}_CUCUMBER.html`,
  screenshotsDirectory: `${testConfig.artifactsPath}/.screenshots/`,
  storeScreenshots: true,
  noInlineScreenshots: true,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    Browser: getBrowserName(testConfig),
    Headless: `${testConfig.headless}`,
    Viewport: `${testConfig.viewport.width} x ${testConfig.viewport.height}`,
    Platform: `${process.platform}`,
    Time: `${new Date()}`,
  },
};

cleanupEmptyFolders(testConfig.artifactsPath);
generate(reportOptions);
