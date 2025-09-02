/**
 * @module SdpParser
 * @description Simplify SDP parser.
 */
declare const SdpParser: {
    /**
     * @function
     * @name setStereo
     * @description Parse SDP for support stereo.
     * @param {String} sdp - Current SDP.
     * @returns {String} SDP parsed with stereo support.
     * @example SdpParser.setStereo(sdp)
     */
    setStereo(sdp?: string): string;
    /**
     * @function
     * @name setDTX
     * @description Set DTX (Discontinuous Transmission) to the connection. Advanced configuration of the opus audio codec that allows for a large reduction in the audio traffic. For example, when a participant is silent, the audio packets won't be transmitted.
     * @param {String} sdp - Current SDP.
     * @returns {String} SDP parsed with dtx support.
     * @example SdpParser.setDTX(sdp)
     */
    setDTX(sdp?: string): string;
    /**
     * @function
     * @name setAbsoluteCaptureTime
     * @description Mangle SDP for adding absolute capture time header extension.
     * @param {String} sdp - Current SDP.
     * @returns {String} SDP mungled with abs-capture-time header extension.
     * @example SdpParser.setAbsoluteCaptureTime(sdp)
     */
    setAbsoluteCaptureTime(sdp?: string): string;
    /**
     * @function
     * @name setDependencyDescriptor
     * @description Mangle SDP for adding dependency descriptor header extension.
     * @param {String} sdp - Current SDP.
     * @returns {String} SDP mungled with abs-capture-time header extension.
     * @example SdpParser.setAbsoluteCaptureTime(sdp)
     */
    setDependencyDescriptor(sdp?: string): string;
    /**
     * @function
     * @name setVideoBitrate
     * @description Parse SDP for desired bitrate.
     * @param {String} sdp - Current SDP.
     * @param {Number} bitrate - Bitrate value in kbps or 0 for unlimited bitrate.
     * @returns {String} SDP parsed with desired bitrate.
     * @example SdpParser.setVideoBitrate(sdp, 1000)
     */
    setVideoBitrate(sdp?: string, bitrate?: number): string;
    /**
     * @function
     * @name removeSdpLine
     * @description Remove SDP line.
     * @param {String} sdp - Current SDP.
     * @param {String} sdpLine - SDP line to remove.
     * @returns {String} SDP without the line.
     * @example SdpParser.removeSdpLine(sdp, 'custom line')
     */
    removeSdpLine(sdp?: string, sdpLine?: string): string;
    /**
     * @function
     * @name adaptCodecName
     * @description Replace codec name of a SDP.
     * @param {String} sdp - Current SDP.
     * @param {String} codec - Codec name to be replaced.
     * @param {String} newCodecName - New codec name to replace.
     * @returns {String} SDP updated with new codec name.
     */
    adaptCodecName(sdp?: string, codec?: string, newCodecName?: string): string;
    /**
     * @function
     * @name setMultiopus
     * @description Parse SDP for support multiopus.
     * **Only available in Google Chrome.**
     * @param {String} sdp - Current SDP.
     * @param {MediaStream} mediaStream - MediaStream offered in the stream.
     * @returns {String} SDP parsed with multiopus support.
     * @example SdpParser.setMultiopus(sdp, mediaStream)
     */
    setMultiopus(sdp?: string, mediaStream?: MediaStream | null): string;
    /**
     * @function
     * @name getAvailablePayloadTypeRange
     * @description Gets all available payload type IDs of the current Session Description.
     * @param {String} sdp - Current SDP.
     * @returns {Array<Number>} All available payload type ids.
     */
    getAvailablePayloadTypeRange(sdp?: string): Array<number>;
    /**
     * @function
     * @name getAvailableHeaderExtensionIdRange
     * @description Gets all available header extension IDs of the current Session Description.
     * @param {String} sdp - Current SDP.
     * @returns {Array<Number>} All available header extension IDs.
     */
    getAvailableHeaderExtensionIdRange(sdp?: string): Array<number>;
    /**
     * @function
     * @name renegotiate
     * @description Renegotiate remote sdp based on previous description.
     * This function will fill missing m-lines cloning on the remote description by cloning the codec and extensions already negotiated for that media
     * @param {String} localDescription - Updated local sdp
     * @param {String} remoteDescription - Previous remote sdp
     */
    renegotiate(localDescription?: string, remoteDescription?: string): string;
    /**
     * @function
     * @name updateMissingVideoExtensions
     * @description Adds missing extensions of each video section in the localDescription
     * @param {String} localDescription - Previous local sdp
     * @param {String} remoteDescription - Remote sdp
     * @returns {String} SDP updated with missing extensions.
     */
    updateMissingVideoExtensions(localDescription?: string, remoteDescription?: string): string | undefined;
    getCodecPayloadType(sdp?: string): {
        [key: string]: string;
    };
};
export default SdpParser;
