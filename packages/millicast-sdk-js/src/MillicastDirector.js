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
    streamAccountId,
    streamName,
    unauthorizedSubscribe = true
  ) {
    let payload = { streamAccountId, streamName, unauthorizedSubscribe };
    const token = null;
    let response;
    try {
      response = await MillicastUtils.request(
        "https://director.millicast.com/api/director/subscribe",
        "POST",
        token,
        payload
      );
      console.log(response.data);
      return response.data;
    } catch (e) {
      throw e;
    }
  }
}
