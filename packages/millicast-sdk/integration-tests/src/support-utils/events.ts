import { ScenarioWorld } from "cucumber-playwright-framework";
import { WebSocket } from "playwright";
import { retryUntilTrue } from "./generic";

export async function collectWsEvents(scenarioWorld:ScenarioWorld, actor:string) {
    //init events collection (array) for actor
    scenarioWorld.localDataStore.save(actor+"_eventsList",[])

    scenarioWorld.page.on('websocket', (ws:WebSocket) => {
        ws.on('framereceived', (event:any) => {
        const payloadJson = JSON.parse(event.payload);
        if (payloadJson["name"] === "active" || payloadJson["name"] === "layers") {
        const actorsEventList: Array<any> = scenarioWorld.localDataStore.load(actor+"_eventsList")
        actorsEventList.push(payloadJson)
        scenarioWorld.localDataStore.save(actor+"_eventsList", actorsEventList)
        }
      });
    }
  )}

export async function getListOfActorsEvents(scenarioWorld: ScenarioWorld, actor: string) {
  return scenarioWorld.localDataStore.load(actor+"_eventsList")
}

export async function waitForEventLayers(scenarioWorld: ScenarioWorld, actor: string) {
  const verifyMethod = async (): Promise<boolean> => {
    const eventsList: any = await getListOfActorsEvents(scenarioWorld, actor);
    let eventPresent = false;
    for (const myEvent of eventsList) {
      if(myEvent["name"] === "layers" && myEvent["data"]["medias"]["0"]["layers"].length === 3) {
        eventPresent = true
        console.log("3 Layers Found")
        console.log("Layers event content: "+JSON.stringify(myEvent["data"]))
      }
    } 
    return(eventPresent) as boolean
  }
  await retryUntilTrue(verifyMethod, 20)
}

export async function getLayersFromEvent(scenarioWorld: ScenarioWorld, actor: string) {
    const eventsList: any = await getListOfActorsEvents(scenarioWorld, actor);
    let layers:Array<any> = [];
    for (const myEvent of eventsList) {
      if(myEvent["name"] === "layers" && myEvent["data"]["medias"]["0"]["layers"].length === 3) {
      layers = myEvent["data"]["medias"]["0"]["layers"]
      }
  } if (layers) {return layers}
  else {throw Error('No layers found')}
}