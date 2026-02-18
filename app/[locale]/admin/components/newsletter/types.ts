export interface AudioSegment {
  buffer: ArrayBuffer
  fileName: string
  startTime: number
  endTime: number
  index: number
}

export interface TranscriptionResult {
  text: string
  language: string
  duration: number
  segmentIndex: number
}
