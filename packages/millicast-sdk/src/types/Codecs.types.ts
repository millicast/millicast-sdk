/** Video codecs supported by the platform. */
export enum VideoCodec {
  /** VP8 */
  VP8 = 'vp8',
  /** VP9 */
  VP9 = 'vp9',
  /** H264 */
  H264 = 'h264',
  /**
   * AV1
   * @remarks Not available on all platforms.
   */
  AV1 = 'av1',
  /**
   * H265
   * @remarks Only available with Safari.
   */
  H265 = 'h265',
}

/** Audio codecs supported by the platform. */
export enum AudioCodec {
  /** OPUS */
  OPUS = 'opus',
  /** Multi OPUS */
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
