/** Build Authorization headers only when a real JWT is available client-side. */
export function authHeaders(token?: string | null): Record<string, string> {
  if (!token || token === 'cookie' || token === 'undefined' || token === 'null') return {}
  // JWT = three base64 segments
  if (token.split('.').length !== 3) return {}
  return { Authorization: `Bearer ${token}` }
}
