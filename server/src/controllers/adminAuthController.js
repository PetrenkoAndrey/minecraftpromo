import { signAdminJwt } from '../lib/adminJwt.js'
import {
  findAdminByCredentials,
  loadAdminUsersFromEnv,
} from '../lib/adminUsers.js'

export function adminLogin(req, res) {
  try {
    const secret = process.env.ADMIN_JWT_SECRET?.trim()
    if (!secret || secret.length < 16) {
      return res.status(503).json({ error: 'admin_not_configured' })
    }

    const users = loadAdminUsersFromEnv()
    if (users.length === 0) {
      return res.status(503).json({ error: 'admin_not_configured' })
    }

    const email = String(req.body?.email ?? '').trim()
    const password = String(req.body?.password ?? '')

    if (!email || !password) {
      return res.status(400).json({ error: 'invalid_credentials' })
    }

    const ok = findAdminByCredentials(email, password, users)
    if (!ok) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    const token = signAdminJwt(ok, secret)
    res.json({ token, email: ok })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
}
