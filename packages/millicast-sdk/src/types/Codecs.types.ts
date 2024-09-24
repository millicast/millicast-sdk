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
  vui_parameters: VUIParameters
}

export interface PictureParameterSet {
  seq_parameter_set_id: number
}