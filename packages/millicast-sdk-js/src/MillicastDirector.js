//Dummy get publisher link. Response for Millicast stream name 'klr0vxjk', token: '92f7dc95dd63aa3e2263cb34d735aab9f0eeef067ff6b43c7470f24361a0e6de'
export default class MillicastDirector {
  static getPublisher(token, streamName) {
    return new Promise((resolve, reject) => {
      resolve({
        status: "success",
        data: {
          subscribeRequiresAuth: false,
          wsUrl:
            "wss://live-west.millicast.com/ws/v2/pub/8591ae3606bc48b08e122d9c1360dc1b",
          urls: [
            "wss://live-west.millicast.com/ws/v2/pub/8591ae3606bc48b08e122d9c1360dc1b",
          ],
          jwt:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2MTU5MDAzMjksImV4cCI6MTYxNTkwMDM1OSwiaWF0IjoxNjE1OTAwMzI5LCJpc3MiOiJodHRwczovL2RpcmVjdG9yLm1pbGxpY2FzdC5jb20iLCJhdWQiOiJNaWxsaWNhc3REaXJlY3RvclJlc291cmNlIiwibWlsbGljYXN0Ijp7InR5cGUiOiJQdWJsaXNoIiwic3RyZWFtQWNjb3VudElkIjoidG5KaHZLIiwic3RyZWFtTmFtZSI6ImtscjB2eGprIiwic2VydmVySWQiOiI4NTkxYWUzNjA2YmM0OGIwOGUxMjJkOWMxMzYwZGMxYiIsInJlY29yZCI6ZmFsc2UsImN1c3RvbURhdGEiOnsiaXNEaXJlY3RvciI6dHJ1ZSwicmVxdWVzdElkIjoiNWFjNjU1MWZhZmJmNGRmZmEzNjdlNDA0YWRkZjU4OTciLCJ0b2tlbiI6ImQ2NmE2OTM5YWQzYjNmMzYxNzVlYWU3ODM4YjA3N2ExOTFhYmEyYzZlYjNiNDUxMGM3YjY2NmExYTM4ZjVjMTUiLCJzdWJzY3JpYmVSZXF1aXJlc0F1dGgiOmZhbHNlfX19.iJBEgLb1ndFpIgt7V-BZK7xS0mXoox78xfnsRsUBgaU",
          streamAccountId: "tnJhvK",
        },
      });
    });
  }
}
