import { default as UAParser } from 'ua-parser-js';

export default class UserAgent extends UAParser {
    constructor();
    isChromium(): boolean;
    isChrome(): boolean;
    isFirefox(): boolean;
    isOpera(): boolean;
    isSafari(): boolean;
}
