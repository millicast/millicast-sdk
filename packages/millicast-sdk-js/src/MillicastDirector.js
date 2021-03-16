import MillicastUtils from "./MillicastUtils.js";

export default class MillicastDirector {
  static async getPublisher(token, streamName) {
    let payload = { streamName };
    let response;
    try {
      response = await MillicastUtils.request(
        "https://director.millicast.com/api/director/publish",
        "POST",
        token,
        payload
      );
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  static async getSubscriber(
    token,
    streamAccountId,
    streamName,
    unauthorizedSubscribe = true
  ) {
    let payload = { streamAccountId, streamName, unauthorizedSubscribe };
    let response;
    try {
      response = await MillicastUtils.request(
        "https://director.millicast.com/api/director/subscribe",
        "POST",
        token,
        payload
      );
      return response.data;
    } catch (e) {
      throw e;
    }
  }
}
