import Database from 'better-sqlite3'
import { mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', '..', 'data')
const dbPath = process.env.SQLITE_PATH || join(dataDir, 'shop.sqlite')

let db

export function getDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

function migrate() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name_uk TEXT NOT NULL,
      name_ru TEXT NOT NULL,
      description_uk TEXT NOT NULL DEFAULT '',
      description_ru TEXT NOT NULL DEFAULT '',
      price_rub INTEGER NOT NULL,
      accent TEXT NOT NULL DEFAULT 'emerald',
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS kits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name_uk TEXT NOT NULL,
      name_ru TEXT NOT NULL,
      description_uk TEXT NOT NULL DEFAULT '',
      description_ru TEXT NOT NULL DEFAULT '',
      price_rub INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS kit_items (
      kit_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (kit_id, product_id),
      FOREIGN KEY (kit_id) REFERENCES kits(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'pending',
      minecraft_username TEXT NOT NULL,
      contact TEXT NOT NULL,
      locale TEXT NOT NULL DEFAULT 'uk',
      total_rub INTEGER NOT NULL,
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      ref_id INTEGER NOT NULL,
      name_uk TEXT NOT NULL,
      name_ru TEXT NOT NULL,
      unit_price_rub INTEGER NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
  `)
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c
  if (count > 0) return

  const insertProduct = db.prepare(`
    INSERT INTO products (slug, name_uk, name_ru, description_uk, description_ru, price_rub, accent, sort_order)
    VALUES (@slug, @name_uk, @name_ru, @description_uk, @description_ru, @price_rub, @accent, @sort_order)
  `)

  const products = [
    {
      slug: 'iron',
      name_uk: 'IRON',
      name_ru: 'IRON',
      description_uk: 'Базовий ранг: кольоровий префікс у чаті та базові перки.',
      description_ru: 'Базовый ранг: цветной префикс в чате и базовые перки.',
      price_rub: 30,
      accent: 'emerald',
      sort_order: 10,
    },
    {
      slug: 'gold',
      name_uk: 'GOLD',
      name_ru: 'GOLD',
      description_uk: 'Розширені можливості та більше слотів.',
      description_ru: 'Расширенные возможности и больше слотов.',
      price_rub: 90,
      accent: 'amber',
      sort_order: 20,
    },
    {
      slug: 'deluxe',
      name_uk: 'DELUXE',
      name_ru: 'DELUXE',
      description_uk: 'Пріоритет у черзі та додаткові команди.',
      description_ru: 'Приоритет в очереди и дополнительные команды.',
      price_rub: 230,
      accent: 'cyan',
      sort_order: 30,
    },
    {
      slug: 'master',
      name_uk: 'MASTER',
      name_ru: 'MASTER',
      description_uk: 'Максимум привілеїв для активних гравців.',
      description_ru: 'Максимум привилегий для активных игроков.',
      price_rub: 540,
      accent: 'red',
      sort_order: 40,
    },
  ]

  for (const p of products) insertProduct.run(p)

  const insertKit = db.prepare(`
    INSERT INTO kits (slug, name_uk, name_ru, description_uk, description_ru, price_rub, sort_order)
    VALUES (@slug, @name_uk, @name_ru, @description_uk, @description_ru, @price_rub, @sort_order)
  `)

  insertKit.run({
    slug: 'pvp-starter',
    name_uk: 'PvP Старт',
    name_ru: 'PvP Старт',
    description_uk: 'Золото + ранг IRON: швидкий старт на арені.',
    description_ru: 'Золото + ранг IRON: быстрый старт на арене.',
    price_rub: 99,
    sort_order: 10,
  })

  const ironId = db.prepare(`SELECT id FROM products WHERE slug = 'iron'`).get().id
  const goldId = db.prepare(`SELECT id FROM products WHERE slug = 'gold'`).get().id
  const kitId = db.prepare(`SELECT id FROM kits WHERE slug = 'pvp-starter'`).get().id

  db.prepare(
    `INSERT INTO kit_items (kit_id, product_id, qty) VALUES (?, ?, ?)`,
  ).run(kitId, ironId, 1)
  db.prepare(
    `INSERT INTO kit_items (kit_id, product_id, qty) VALUES (?, ?, ?)`,
  ).run(kitId, goldId, 1)
}

export function initDb() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  migrate()
  seedIfEmpty()
}
