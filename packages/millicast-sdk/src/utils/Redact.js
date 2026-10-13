const SECRET_KEY = /token|jwt|credential|password|secret|authorization/i

/**
 * Replaces a secret while retaining a short suffix for correlation.
 * @param {string} value
 * @returns {string}
 */
export const redactSecret = (value, keepLastChars = 6) => {
  const secret = String(value)
  if (secret.startsWith('Bearer ')) {
    return `Bearer ${redactSecret(secret.slice(7), keepLastChars)}`
  }
  return secret.length > keepLastChars * 2
    ? `REDACTED...${secret.slice(-keepLastChars)}`
    : 'REDACTED'
}

/**
 * Redacts secret-like string fields recursively.
 * @param {unknown} value
 * @returns {unknown}
 */
export const redactDeep = (value, keepLastChars = 6) => {
  if (Array.isArray(value)) {
    return value.map(item => redactDeep(item, keepLastChars))
  }
  if (!value || typeof value !== 'object') {
    return value
  }
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    SECRET_KEY.test(key) && typeof child === 'string'
      ? redactSecret(child, keepLastChars)
      : redactDeep(child, keepLastChars)
  ]))
}

/**
 * Redacts secret values in URL query parameters.
 * @param {string} value
 * @returns {string}
 */
export const redactUrl = (value, keepLastChars = 6) => {
  if (typeof value !== 'string') return value
  try {
    const parsed = new URL(value)
    for (const [key, child] of parsed.searchParams.entries()) {
      if (key === 'token' || key === 'jwt' || SECRET_KEY.test(key)) {
        parsed.searchParams.set(key, redactSecret(child, keepLastChars))
      }
    }
    return parsed.toString()
  } catch {
    return value.replace(/([?&])([^=&#]+)=([^&#]*)/g, (match, prefix, key, child) => {
      return key === 'token' || key === 'jwt' || SECRET_KEY.test(key)
        ? `${prefix}${key}=${encodeURIComponent(redactSecret(decodeURIComponent(child), keepLastChars))}`
        : match
    })
  }
}

/**
 * Redacts a WebSocket message if it contains JSON.
 * @param {string} value
 * @returns {string}
 */
export const redactMessage = (value, keepLastChars = 6) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.stringify(redactDeep(JSON.parse(value), keepLastChars))
  } catch {
    return value
  }
}
