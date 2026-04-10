import Database from 'better-sqlite3'
import { mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { seedSiteSettingsIfEmpty } from '../lib/siteSettings.js'

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
      price_uah INTEGER NOT NULL DEFAULT 0,
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
      price_uah INTEGER NOT NULL DEFAULT 0,
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
      total_uah INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      admin_note TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      ref_id INTEGER NOT NULL,
      name_uk TEXT NOT NULL,
      name_ru TEXT NOT NULL,
      unit_price_rub INTEGER NOT NULL,
      unit_price_uah INTEGER NOT NULL DEFAULT 0,
      qty INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
  `)
}

function tableColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name)
}

function ensureColumn(table, column, ddl) {
  if (tableColumns(table).includes(column)) return
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`)
}

function upgradeSchema() {
  ensureColumn('products', 'price_uah', 'INTEGER NOT NULL DEFAULT 0')
  ensureColumn('kits', 'price_uah', 'INTEGER NOT NULL DEFAULT 0')
  ensureColumn('orders', 'total_uah', 'INTEGER NOT NULL DEFAULT 0')
  ensureColumn('order_items', 'unit_price_uah', 'INTEGER NOT NULL DEFAULT 0')

  const { user_version: ver } = db.prepare('PRAGMA user_version').get()
  if (ver < 2) {
    db.prepare(
      `
      UPDATE products SET price_uah = CASE slug
        WHEN 'iron' THEN 15
        WHEN 'gold' THEN 45
        WHEN 'deluxe' THEN 115
        WHEN 'master' THEN 270
        ELSE MAX(1, CAST(ROUND(price_rub * 0.45) AS INTEGER))
      END
      WHERE COALESCE(price_uah, 0) = 0
    `,
    ).run()
    db.prepare(
      `
      UPDATE kits SET price_uah = CASE
        WHEN slug = 'pvp-starter' THEN 50
        ELSE MAX(1, CAST(ROUND(price_rub * 0.45) AS INTEGER))
      END
      WHERE COALESCE(price_uah, 0) = 0
    `,
    ).run()
    db.pragma('user_version = 2')
  }

  const { user_version: ver3 } = db.prepare('PRAGMA user_version').get()
  if (ver3 < 3) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `)
    ensureColumn('orders', 'admin_note', "TEXT NOT NULL DEFAULT ''")
    seedSiteSettingsIfEmpty(db)
    db.pragma('user_version = 3')
  }

  const { user_version: ver4 } = db.prepare('PRAGMA user_version').get()
  if (ver4 < 4) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        discount_percent INTEGER NOT NULL,
        max_uses_total INTEGER,
        max_uses_per_user INTEGER,
        valid_from TEXT,
        valid_until TEXT,
        min_order_rub INTEGER NOT NULL DEFAULT 0,
        min_order_uah INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS promo_redemptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        promo_id INTEGER NOT NULL,
        order_id INTEGER NOT NULL UNIQUE,
        minecraft_username TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (promo_id) REFERENCES promo_codes(id),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_promo_redemptions_promo ON promo_redemptions(promo_id);
      CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user ON promo_redemptions(promo_id, minecraft_username);
    `)
    ensureColumn('orders', 'promo_id', 'INTEGER')
    ensureColumn('orders', 'discount_rub', 'INTEGER NOT NULL DEFAULT 0')
    ensureColumn('orders', 'discount_uah', 'INTEGER NOT NULL DEFAULT 0')
    ensureColumn('orders', 'promo_code_snapshot', 'TEXT')
    db.pragma('user_version = 4')
  }
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c
  if (count > 0) return

  const insertProduct = db.prepare(`
    INSERT INTO products (slug, name_uk, name_ru, description_uk, description_ru, price_rub, price_uah, accent, sort_order)
    VALUES (@slug, @name_uk, @name_ru, @description_uk, @description_ru, @price_rub, @price_uah, @accent, @sort_order)
  `)

  const products = [
    {
      slug: 'iron',
      name_uk: 'IRON',
      name_ru: 'IRON',
      description_uk: 'Базовий ранг: кольоровий префікс у чаті та базові перки.',
      description_ru: 'Базовый ранг: цветной префикс в чате и базовые перки.',
      price_rub: 30,
      price_uah: 15,
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
      price_uah: 45,
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
      price_uah: 115,
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
      price_uah: 270,
      accent: 'red',
      sort_order: 40,
    },
  ]

  for (const p of products) insertProduct.run(p)

  const insertKit = db.prepare(`
    INSERT INTO kits (slug, name_uk, name_ru, description_uk, description_ru, price_rub, price_uah, sort_order)
    VALUES (@slug, @name_uk, @name_ru, @description_uk, @description_ru, @price_rub, @price_uah, @sort_order)
  `)

  insertKit.run({
    slug: 'pvp-starter',
    name_uk: 'PvP Старт',
    name_ru: 'PvP Старт',
    description_uk: 'Золото + ранг IRON: швидкий старт на арені.',
    description_ru: 'Золото + ранг IRON: быстрый старт на арене.',
    price_rub: 99,
    price_uah: 50,
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
  upgradeSchema()
  seedIfEmpty()
}
