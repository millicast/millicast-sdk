import { ScenarioWorld, logger, runSteps } from "cucumber-playwright-framework";


export async function viewerConnect(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`viewerConnect function was called`);
  await scenarioWorld.page.evaluate(`window.millicastView.connect()`)
};

export async function viewerStop(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`viewerStop function was called`);
  await scenarioWorld.page.evaluate(`window.millicastView.stop()`)
};

// Doesn't work, steps in runStep aren't called !
export async function viewerConnectAndVerifyStream(
  scenarioWorld: ScenarioWorld,
) {
  logger.debug(`viewerConnectAndVerifyStream function was called`);
  await runSteps(
    [
      `the viewer1 is on the "viewerPage" page of the "millicast-viewer-demo" app`,
      `viewer1 verify if connected`,
    ],
    scenarioWorld
  )
};

export async function viewerConnectWithOptions(
  scenarioWorld: ScenarioWorld,
  options: any,
) {
  logger.debug(`viewerConnectWithOptions function was called`);
  console.log(options)
  var page = scenarioWorld.page
  
  const optionsDict: Record<string,any> = {}
  //convert strings into boolean if true/false encountered
  Object.entries(options).forEach(([key, value]) => {
    if(value ==='true'|| value ==='false'){
      const myBool: boolean = (value === 'true');
      optionsDict[key] = myBool;
    } else{
      optionsDict[key] = value;
    }
  })

  var optionsStr = JSON.stringify(optionsDict)
  await page.evaluate(`window.millicastView.connect(${optionsStr})`)
}