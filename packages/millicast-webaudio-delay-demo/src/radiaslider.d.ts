declare module '@maslick/radiaslider/src/slider-circular' {
  interface SliderOptions {
    id: number
    radius: number
    min: number
    max: number
    step: number
    color: string
    changed: (v: { deg: number }) => void
  }

  interface CircularSliderOptions {
    canvasId: string
    continuousMode: boolean
    x0: number
    y0: number
    readOnly: boolean
  }

  export default class CircularSlider {
    constructor(options: CircularSliderOptions)
    addSlider(options: SliderOptions): void
  }
}
