import UserAgent from './UserAgent';
import Logger from '../Logger';

const logger = Logger.get('SdpParser');

/**
 * @module SdpParser
 * @description Simplify SDP parser.
 *
 * ## SDP munging vs Browser API summary
 *
 * Functions in this module use **SDP munging** (modifying the local SDP after createOffer,
 * before setLocalDescription). The following features rely on SDP munging because no
 * browser API supports them at runtime:
 *
 * - **setStereo** — Appends `stereo=1;sprop-stereo=1` to the Opus fmtp line.
 * - **setDTX** — Appends `usedtx=1` to the Opus fmtp line.
 * - **setMultiopus** — Adds a `multiopus/48000/6` codec entry for 5.1 surround audio.
 *
 * Why SDP munging is required for these:
 * - `RTCRtpSender.setParameters()` codecs field is read-only per W3C spec — confirmed
 *   broken in Chrome, Firefox, Safari.
 *   Chrome returns INTERNAL_ERROR for Opus fmtp changes: https://issues.webrtc.org/issues/443612840
 * - `RTCRtpTransceiver.setCodecPreferences()` rejects modified sdpFmtpLine with
 *   InvalidModificationError.
 * - Chrome engineers recommend SDP munging as the current workaround:
 *   https://github.com/w3c/webrtc-extensions/issues/120
 *
 * The following features use **Browser APIs** instead (handled in PeerConnection.ts):
 *
 * - **Codec selection** — `RTCRtpTransceiver.setCodecPreferences()` to order preferred codecs.
 * - **Simulcast** — `RTCRtpTransceiver` with `sendEncodings` for multiple spatial layers.
 * - **Bitrate control** — `RTCRtpSender.setParameters()` via BitrateManager to set
 *   `maxBitrate` on encodings.
 *
 * Utility functions (no munging, just parsing):
 * - **adaptCodecName** — Simple string replacement for codec name normalization (e.g. AV1X ↔ AV1).
 * - **getCodecPayloadType** — Extracts payload-type-to-codec mapping from SDP.
 */
const SdpParser = {

  /**
   * @function
   * @name setStereo
   * @description Parse SDP for support stereo. Appends stereo=1 and sprop-stereo=1 to the
   * Opus fmtp line in the local SDP offer.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with stereo support.
   * @example SdpParser.setStereo(sdp)
   */
  setStereo (sdp  = ''): string {
    sdp = appendOpusFmtpParam(sdp, 'stereo');
    sdp = appendOpusFmtpParam(sdp, 'sprop-stereo');
    return sdp;
  },

  /**
   * @function
   * @name setDTX
   * @description Set DTX (Discontinuous Transmission) on the Opus codec. Appends usedtx=1
   * to the Opus fmtp line in the local SDP offer. DTX allows a large reduction in audio
   * traffic when a participant is silent.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with DTX support.
   * @example SdpParser.setDTX(sdp)
   */
  setDTX (sdp = ''): string {
    sdp = appendOpusFmtpParam(sdp, 'usedtx');
    return sdp;
  },

  /**
   * @function
   * @name adaptCodecName
   * @description Replace codec name of a SDP.
   * @param {String} sdp - Current SDP.
   * @param {String} codec - Codec name to be replaced.
   * @param {String} newCodecName - New codec name to replace.
   * @returns {String} SDP updated with new codec name.
   */
  adaptCodecName (sdp = '', codec = '', newCodecName = ''): string {
    if (!sdp) {
      return sdp;
    }
    const regex = new RegExp(`${codec}`, 'i');

    return sdp.replace(regex, newCodecName);
  },

  /**
   * @function
   * @name getCodecPayloadType
   * @description Gets codec payload type mapping from SDP.
   * @param {String} sdp - Current SDP.
   * @returns {Object} Map of payload type to codec name.
   */
  getCodecPayloadType (sdp = ''): Record<string, string> {
    const reg = new RegExp('a=rtpmap:(\\d+) (\\w+)/\\d+', 'g');
    const matches = sdp.matchAll(reg);
    const codecMap: Record<string, string> = {};

    for (const match of matches) {
      codecMap[match[1]] = match[2];
    }
    return codecMap;
  },

  /**
   * @function
   * @name setMultiopus
   * @description Parse SDP for support multiopus (multichannel Opus, e.g. 5.1 surround).
   * Adds a multiopus/48000/6 codec entry to the audio m-line if the MediaStream has
   * more than 2 audio channels, or if no MediaStream is provided (viewer side).
   * Not supported in Firefox.
   * @param {String} sdp - Current SDP.
   * @param {MediaStream} [mediaStream] - MediaStream offered in the stream.
   * @returns {String} SDP parsed with multiopus support.
   * @example SdpParser.setMultiopus(sdp, mediaStream)
   */
  setMultiopus (sdp = '', mediaStream?: MediaStream): string {
    const browserData = new UserAgent();
    if (browserData.isFirefox()) {
      logger.info('Multiopus is not supported in Firefox');
      return sdp;
    }
    if (mediaStream && !hasAudioMultichannel(mediaStream)) {
      return sdp;
    }
    if (sdp.includes('multiopus/48000/6')) {
      logger.info('Multiopus already set');
      return sdp;
    }

    const audioMLineRegex = new RegExp('m=audio 9 UDP/TLS/RTP/SAVPF (.*)\\r\\n');
    const audioMLineMatch = audioMLineRegex.exec(sdp);
    if (!audioMLineMatch) {
      return sdp;
    }

    const audioMLine = audioMLineMatch[0];
    const pt = getAvailablePayloadTypeRange(sdp)[0];
    if (pt === undefined) {
      logger.warn('No available payload type for multiopus');
      return sdp;
    }

    const multiopus = audioMLine.replace('\r\n', ' ') + pt + '\r\n' +
      'a=rtpmap:' + pt + ' multiopus/48000/6\r\n' +
      'a=fmtp:' + pt + ' channel_mapping=0,4,1,2,3,5;coupled_streams=2;minptime=10;num_streams=4;useinbandfec=1\r\n';

    sdp = sdp.replace(audioMLine, multiopus);
    logger.info('Multiopus offer created');
    logger.debug('SDP parsed for multiopus: ', sdp);
    return sdp;
  },
};

const appendOpusFmtpParam = (sdp = '', paramName = ''): string => {
  if (!sdp || !paramName) {
    return sdp;
  }

  const opusPayloadTypes = new Set<string>();
  const opusRtpMapRegex = /^a=rtpmap:(\d+)\s+opus\/\d+/gim;
  let match: RegExpExecArray | null = opusRtpMapRegex.exec(sdp);
  while (match) {
    opusPayloadTypes.add(match[1]);
    match = opusRtpMapRegex.exec(sdp);
  }

  if (opusPayloadTypes.size === 0) {
    return sdp;
  }

  const hasParamRegex = new RegExp(`(?:^|;)${paramName}=\\d+(?:;|$)`);

  const lines = sdp.split('\r\n').map((line) => {
    const fmtpMatch = line.match(/^a=fmtp:(\d+)\s+(.+)$/i);
    if (!fmtpMatch) {
      return line;
    }

    const payloadType = fmtpMatch[1];
    const fmtpValue = fmtpMatch[2];

    if (!opusPayloadTypes.has(payloadType)) {
      return line;
    }

    if (!/\buseinbandfec=1\b/.test(fmtpValue)) {
      return line;
    }

    if (hasParamRegex.test(fmtpValue)) {
      return line;
    }

    return `a=fmtp:${payloadType} ${fmtpValue};${paramName}=1`;
  });

  return lines.join('\r\n');
};

const firstPayloadTypeLowerRange = 35;
const lastPayloadTypeLowerRange = 65;
const firstPayloadTypeUpperRange = 96;
const lastPayloadTypeUpperRange = 127;

const payloadTypeLowerRange = Array.from(
  { length: (lastPayloadTypeLowerRange - firstPayloadTypeLowerRange) + 1 },
  (_, i) => i + firstPayloadTypeLowerRange,
);
const payloadTypeUpperRange = Array.from(
  { length: (lastPayloadTypeUpperRange - firstPayloadTypeUpperRange) + 1 },
  (_, i) => i + firstPayloadTypeUpperRange,
);

const getAvailablePayloadTypeRange = (sdp: string): number[] => {
  const regex = /m=(?:.*) (?:.*) UDP\/TLS\/RTP\/SAVPF (.*)\r\n/gm;
  const matches = sdp.matchAll(regex);
  let ptAvailable = payloadTypeUpperRange.concat(payloadTypeLowerRange);

  for (const match of matches) {
    const usedNumbers = match[1].split(' ').map(n => parseInt(n));
    ptAvailable = ptAvailable.filter(n => !usedNumbers.includes(n));
  }

  return ptAvailable;
};

const hasAudioMultichannel = (mediaStream: MediaStream): boolean => {
  return mediaStream.getAudioTracks().some(track => (track.getSettings().channelCount ?? 0) > 2);
};

export default SdpParser;
