import { createHmac, timingSafeEqual } from 'crypto'

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function b64urlDecode(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b, 'base64')
}

export function signAdminJwt(email, secret) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600
  const payload = b64url(JSON.stringify({ sub: email, exp }))
  const data = `${header}.${payload}`
  const sig = createHmac('sha256', secret).update(data).digest()
  const sigB64 = b64url(sig)
  return `${data}.${sigB64}`
}

/** Повертає email або null */
export function verifyAdminJwt(token, secret) {
  if (!token || typeof token !== 'string' || !secret) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, p, s] = parts
  const data = `${h}.${p}`
  const expected = createHmac('sha256', secret).update(data).digest()
  let sigBuf
  try {
    sigBuf = b64urlDecode(s)
  } catch {
    return null
  }
  if (sigBuf.length !== expected.length) return null
  if (!timingSafeEqual(sigBuf, expected)) return null
  let payload
  try {
    payload = JSON.parse(b64urlDecode(p).toString('utf8'))
  } catch {
    return null
  }
  if (!payload?.sub || typeof payload.exp !== 'number') return null
  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  return String(payload.sub)
}
