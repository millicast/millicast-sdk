const mozGetCapabilities = kind => {
  if (kind === 'video') {
    return {
      codecs: [
        { codec: 'vp8', mimeType: 'video/VP8' },
        { codec: 'vp9', mimeType: 'video/VP9' },
        { codec: 'h264', mimeType: 'video/H264' },
        { codec: 'av1', mimeType: 'video/AV1X' }
      ],
      headerExtensions: []
    }
  }

  if (kind === 'audio') {
    return {
      codecs: [
        { codec: 'opus', mimeType: 'audio/opus', channels: 2 }
      ],
      headerExtensions: []
    }
  }

  return null
}

export default mozGetCapabilities
