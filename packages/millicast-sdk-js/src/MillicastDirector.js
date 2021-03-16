//Dummy get publisher link. Response for Millicast stream name 'klr0vxjk', token: '92f7dc95dd63aa3e2263cb34d735aab9f0eeef067ff6b43c7470f24361a0e6de'
export default class MillicastDirector {
  static getPublisher(token, streamName) {
    return new Promise((resolve, reject) => {
      resolve({
        status: "success",
        data: {
          subscribeRequiresAuth: false,
          wsUrl:
            "wss://live-west.millicast.com/ws/v2/pub/e460b10dd31948db8a5e91b855902589",
          urls: [
            "wss://live-west.millicast.com/ws/v2/pub/e460b10dd31948db8a5e91b855902589",
          ],
          jwt:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2MTU4NTQyNzYsImV4cCI6MTYxNTg1NDMwNiwiaWF0IjoxNjE1ODU0Mjc2LCJpc3MiOiJodHRwczovL2RpcmVjdG9yLm1pbGxpY2FzdC5jb20iLCJhdWQiOiJNaWxsaWNhc3REaXJlY3RvclJlc291cmNlIiwibWlsbGljYXN0Ijp7InR5cGUiOiJQdWJsaXNoIiwic3RyZWFtQWNjb3VudElkIjoidG5KaHZLIiwic3RyZWFtTmFtZSI6ImtscjB2eGprIiwic2VydmVySWQiOiJlNDYwYjEwZGQzMTk0OGRiOGE1ZTkxYjg1NTkwMjU4OSIsInJlY29yZCI6ZmFsc2UsImN1c3RvbURhdGEiOnsiaXNEaXJlY3RvciI6dHJ1ZSwicmVxdWVzdElkIjoiNzY2NzU3YjFjMGNhNGNiMjkyYjIzY2Y3ODlhNGQxMDUiLCJ0b2tlbiI6ImQ2NmE2OTM5YWQzYjNmMzYxNzVlYWU3ODM4YjA3N2ExOTFhYmEyYzZlYjNiNDUxMGM3YjY2NmExYTM4ZjVjMTUiLCJzdWJzY3JpYmVSZXF1aXJlc0F1dGgiOmZhbHNlfX19.5YH7_MxzZA_cZ-BJcscT1kvaKux_PsNiwZI_4lHwI6E",
          streamAccountId: "tnJhvK",
        },
      });
    });
  }
}
