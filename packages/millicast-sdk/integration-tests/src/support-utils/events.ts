import { ScenarioWorld } from "cucumber-playwright-framework";
import { WebSocket } from "playwright";

export async function collectWsEvents(scenarioWorld:ScenarioWorld, actor:string) {
    scenarioWorld.page.on('websocket', (ws:WebSocket) => {
        ws.on('framereceived', (event:any) => {
        const payloadJson = JSON.parse(event.payload);
        if (payloadJson["name"] === "active") {
            scenarioWorld.localDataStore.save(actor+"_event_"+Date.now(), payloadJson);
        }
        if (payloadJson["name"] === "layers") {
            scenarioWorld.localDataStore.save(actor+"_event_"+Date.now(), payloadJson);
        }
      });
    }
  )}

export async function getLayersFromEvent(scenarioWorld: ScenarioWorld, actor: string) {
    const allevents: Map<any, any> = scenarioWorld.localDataStore.getAllData();
    let layers:Array<any> = [];
    allevents.forEach((value, key) => {
      if(key.includes("event") && value["name"] === "layers"){
      layers = value["data"]["medias"]["0"]["layers"]
      } 
    });
    return layers;
  }