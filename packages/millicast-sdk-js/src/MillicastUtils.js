export default class MillicastUtils {
  static request(url, method, token, payload) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = (evt) => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          let res = JSON.parse(xhr.responseText);
          //console.log(res);
          switch (xhr.status) {
            case 200:
              resolve(res);
              break;
            default:
              reject(res);
              break;
          }
        }
      };
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/json;");
      if (!!token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      !!payload ? xhr.send(JSON.stringify(payload)) : xhr.send();
    });
  }
}
