/**
 * Enum of Millicast supported Video codecs
 * @readonly
 * @enum {String}
 * @property {String} VP8
 * @property {String} VP9
 * @property {String} H264
 * @property {String} AV1
 * @property {String} H265 - Only available in Safari
 */
export enum VideoCodec {
  VP8 = 'vp8',
  VP9 = 'vp9',
  H264 = 'h264',
  AV1 = 'av1',
  H265 = 'h265',
}

/**
 * Enum of Millicast supported Audio codecs
 * @readonly
 * @enum {String}
 * @property {String} OPUS
 * @property {String} MULTIOPUS
 */
export enum AudioCodec {
  OPUS = 'opus',
  MULTIOPUS = 'multiopus',
}

export interface TimingInfo {
  num_units_in_tick: number
  time_scale: number
  fixed_frame_rate_flag: number
}

export interface HRDParameters {
  cpb_removal_delay_length_minus1: number
  dpb_output_delay_length_minus1: number
  time_offset_length: number
}

export interface VUIParameters {
  timing_info?: TimingInfo
  nal_hrd_parameters?: HRDParameters
  vcl_hrd_parameters?: HRDParameters
  pic_struct_present_flag: number
}

export interface SequenceParameterSet {
  vui_parameters: VUIParameters | undefined
}

export interface PictureParameterSet {
  seq_parameter_set_id: number
}
