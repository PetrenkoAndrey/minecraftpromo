import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDb } from './db/init.js'
import { listProducts, listKits } from './controllers/shopController.js'
import { createOrder } from './controllers/orderController.js'
import { listOrdersAdmin } from './controllers/adminController.js'

dotenv.config()

initDb()

const app = express()
const PORT = Number(process.env.PORT) || 3001

const origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : true

app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
)
app.use(express.json({ limit: '48kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/products', listProducts)
app.get('/api/kits', listKits)
app.post('/api/orders', createOrder)
app.get('/api/admin/orders', listOrdersAdmin)

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' })
})

const server = app.listen(PORT, () => {
  console.log(`Shop API http://localhost:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[shop-api] Порт ${PORT} уже зайнятий (зазвичай старий node після попереднього npm run dev).`,
    )
    console.error(
      '  → Закрий той термінал / процес, або в корені: npm run free:3001',
    )
    console.error(
      `  → Або в server/.env: PORT=3002 і в корені .env.local: VITE_API_URL=http://127.0.0.1:3002`,
    )
    process.exit(1)
  }
  throw err
})
