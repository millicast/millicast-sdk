import { TransformWorkerSeiMetadata } from '../types/TransformWorker.types';
import { VideoCodec } from '../types/Codecs.types';

export declare const DOLBY_SEI_DATA_UUID = "6e9cfd2a-5907-49ff-b363-8978a6e8340e";
export declare const DOLBY_SEI_TIMESTAMP_UUID = "9a21f3be-31f0-4b78-b0be-c7f7dbb97250";
export declare const DOLBY_SDK_TIMESTAMP_UUID = "d40e38ea-d419-4c62-94ed-20ac37b4e4fa";
export interface SeiMetadata {
    seiPicTimingTimeCodeArray?: SeiPicTimingTimeCode[];
    uuid?: Uint8Array;
    unregistered?: Uint8Array;
    timecode?: Uint8Array | number;
}
interface SeiPicTimingTimeCode {
    n_frames: number;
    seconds_value: number;
    minutes_value: number;
    hours_value: number;
    time_offset: number;
}
/**
 * SEI User unregistered data
 * @typedef {object} SEIUserUnregisteredData
 * @global
 * @property {string} uuid - the UUID of the SEI user unregistered data
 * @property {Uint8Array} data - the binary content of the SEI user unregistered data
 */
/**
 * SEI Pic timing time code
 * @typedef {object} SEIPicTimingTimeCode
 * @global
 * @property {number} seconds
 * @property {number} minutes
 * @property {number} hours
 * @property {number} n_frames
 * @property {number} time_offset
 */
/**
 * Metadata of the Encoded Frame
 * @typedef {object} FrameMetaData
 * @global
 * @property {number} timestamp - the time at which frame sampling started, value is a positive integer containing the sampling instant of the first byte in this frame, in microseconds
 * @property { Array<SEIUserUnregisteredData> } seiUserUnregisteredDataArray - the SEI user unregistered data array
 * @property { Array<SEIPicTimingTimeCode> } [seiPicTimingTimeCodeArray] - the SEI pic timing time codes
 */
/**
 * Extract user unregistered metadata from H26x Encoded Frame
 * @param { RTCEncodedFrame } encodedFrame
 * @param { 'H264' | 'H265' } codec
 * @returns { FrameMetaData }
 */
export declare function extractH26xMetadata(encodedFrame: RTCEncodedVideoFrame, codec: VideoCodec): SeiMetadata;
export declare function addH26xSEI({ uuid, payload, timecode }: TransformWorkerSeiMetadata, encodedFrame: RTCEncodedVideoFrame): void;
export {};
