const DEFAULT_API_ENDPOINT: string = 'https://director.millicast.com';

const urls = {
  apiEndpoint: DEFAULT_API_ENDPOINT,
  liveWebsocketDomain: '',
}

/**
 * Sets the Director API endpoint where requests will be sent.
 * 
 * @param url New Director API endpoint
 */
export const setEndpoint = (url: string): void => {
  urls.apiEndpoint = url.replace(/\/$/, '');
}

/**
 * Gets the current Director API endpoint where requests will be sent.
 * 
 * @returns API base url.
 * 
 * @defaultValue `https://director.millicast.com`
 */
export const getEndpoint = (): string => {
  return urls.apiEndpoint;
}

/**
 * Sets the Websocket Live domain from Director API response.
 * If it is set to empty, it will not parse the response.
 * 
 * @param domain New Websocket Live domain
 */
export const setLiveDomain = (domain: string): void => {
  urls.liveWebsocketDomain = domain.replace(/\/$/, '');
}

/**
 * Gets the current Websocket Live domain.
 * 
 * @returns Websocket Live domain
 * 
 * @defaultValue Empty which corresponds to not parse the Director response.
 */
export const getLiveDomain = (): string => {
  return urls.liveWebsocketDomain;
}
