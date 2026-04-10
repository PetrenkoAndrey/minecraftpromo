import { createHash, timingSafeEqual } from 'crypto'

/** @returns {{ email: string, password: string }[]} */
export function loadAdminUsersFromEnv() {
  const list = []
  for (let i = 1; i <= 32; i++) {
    const email = process.env[`ADMIN_LOGIN_${i}_EMAIL`]?.trim()
    const password = process.env[`ADMIN_LOGIN_${i}_PASSWORD`]
    if (email && password != null && String(password).length > 0) {
      list.push({ email: email.toLowerCase(), password: String(password) })
    }
  }
  return list
}

function sha256utf8(s) {
  return createHash('sha256').update(s, 'utf8').digest()
}

export function verifyAdminPassword(inputPassword, storedPassword) {
  const a = sha256utf8(inputPassword)
  const b = sha256utf8(storedPassword)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function findAdminByCredentials(email, password, users) {
  const e = email.trim().toLowerCase()
  for (const u of users) {
    if (u.email === e && verifyAdminPassword(password, u.password)) {
      return u.email
    }
  }
  return null
}
