// Convert NTP Timestamp into Unix timestamp format
export function convertNtpTimestamp (timestampMicros) {
  // Convert microseconds timestamp to seconds and fraction
  const seconds = Math.floor(timestampMicros / 1000000)
  const fraction = ((timestampMicros % 1000000) / 1000000) * 1000

  // Convert timestamp to Unix time
  const unixTime = (seconds - 2208988800) * 1000 + fraction

  // Create a Date object from the Unix time
  const date = new Date(unixTime)

  return date
}
