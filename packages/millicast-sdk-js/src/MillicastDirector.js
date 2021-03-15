//Dummy get publisher link. Response for Millicast stream name 'klr0vxjk'
export default class MillicastDirector {
  static getPublisher(token, streamName){
    return new Promise((resolve, reject) => {
      resolve(
        {
          "status": "success",
          "data": {
              "subscribeRequiresAuth": false,
              "wsUrl": "wss://live-west.millicast.com/ws/v2/pub/0d1e2856bd2049c99ef61b6370ec7f25",
              "urls": [
                  "wss://live-west.millicast.com/ws/v2/pub/0d1e2856bd2049c99ef61b6370ec7f25"
              ],
              "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2MTU4MzkwNDEsImV4cCI6MTYxNTgzOTA3MSwiaWF0IjoxNjE1ODM5MDQxLCJpc3MiOiJodHRwczovL2RpcmVjdG9yLm1pbGxpY2FzdC5jb20iLCJhdWQiOiJNaWxsaWNhc3REaXJlY3RvclJlc291cmNlIiwibWlsbGljYXN0Ijp7InR5cGUiOiJQdWJsaXNoIiwic3RyZWFtQWNjb3VudElkIjoidG5KaHZLIiwic3RyZWFtTmFtZSI6ImtscjB2eGprIiwic2VydmVySWQiOiIwZDFlMjg1NmJkMjA0OWM5OWVmNjFiNjM3MGVjN2YyNSIsInJlY29yZCI6ZmFsc2UsImN1c3RvbURhdGEiOnsiaXNEaXJlY3RvciI6dHJ1ZSwicmVxdWVzdElkIjoiY2NjYjc0NDRhZTIwNGZhNjg3ZjMwYjUzNWFjOTVkZmEiLCJ0b2tlbiI6IjkyZjdkYzk1ZGQ2M2FhM2UyMjYzY2IzNGQ3MzVhYWI5ZjBlZWVmMDY3ZmY2YjQzYzc0NzBmMjQzNjFhMGU2ZGUiLCJzdWJzY3JpYmVSZXF1aXJlc0F1dGgiOmZhbHNlfX19.4wzyN4WB8KmpCk_DkqYb264oe6arlJlRY5AfFK9xsoI",
              "streamAccountId": "tnJhvK"
          }
        }
      )
    })
    
  }
}