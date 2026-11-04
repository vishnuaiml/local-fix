/**
 * LocalFix: TiDB Cloud Database Integration
 * Host: gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000
 * Protocol: MySQL 8.0 Serverless over TLS with ISRG Root X1
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let pool: mysql.Pool | null = null;

function getSslCa(): Buffer | undefined {
  const caPaths = [
    process.env.DB_SSL_CA || './isrgrootx1.pem',
    path.resolve(process.cwd(), 'isrgrootx1.pem'),
    '/etc/ssl/certs/ISRG_Root_X1.pem',
    '/etc/ssl/certs/ca-certificates.crt',
  ];

  for (const p of caPaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p);
      }
    } catch {
      // Continue to next path
    }
  }
  return undefined;
}

export function getTiDbPool(): mysql.Pool {
  if (!pool) {
    const ca = getSslCa();
    const sslConfig = process.env.DB_SSL === 'true' || Boolean(ca)
      ? {
          ca,
          rejectUnauthorized: Boolean(ca),
        }
      : undefined;

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
      port: Number(process.env.DB_PORT) || 4000,
      user: process.env.DB_USER || '4JsiwENyAMmnJAx.root',
      password: process.env.DB_PASSWORD || 'LqMvwPO3adeqGwiz',
      database: process.env.DB_NAME || 'localfix',
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 5,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    console.log('[LocalFix] TiDB Cloud connection pool initialized');
  }

  return pool;
}

export async function checkTiDbConnection(): Promise<{ connected: boolean; version?: string; error?: string }> {
  try {
    const p = getTiDbPool();
    const [rows]: any = await p.query('SELECT 1 AS solution, VERSION() AS version');
    return {
      connected: true,
      version: rows?.[0]?.version || '8.0.11-TiDB-serverless',
    };
  } catch (err: any) {
    console.warn('[LocalFix] TiDB Cloud health check warning:', err?.message || err);
    return {
      connected: false,
      error: err?.message || String(err),
    };
  }
}

export async function findTiDbUserByEmail(email: string) {
  try {
    const p = getTiDbPool();
    const [rows]: any = await p.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
    if (rows && rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (err) {
    console.warn('[LocalFix] Failed to query TiDB user:', err);
    return null;
  }
}

export async function syncTiDbUser(user: {
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  phone?: string;
  passwordHash?: string;
}) {
  try {
    const p = getTiDbPool();
    await p.query(
      `INSERT INTO users (name, email, password_hash, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         role = VALUES(role),
         phone = COALESCE(VALUES(phone), phone),
         password_hash = COALESCE(VALUES(password_hash), password_hash),
         is_active = 1`,
      [
        user.name,
        user.email.toLowerCase().trim(),
        user.passwordHash || null,
        user.phone || '+91 98400 00000',
        user.role,
      ]
    );
  } catch (err) {
    console.warn('[LocalFix] Failed to sync user to TiDB:', err);
  }
}

export async function getTiDbTableCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const tables = ['users', 'provider_profiles', 'provider_applications', 'services', 'bookings', 'reviews'];
  try {
    const p = getTiDbPool();
    for (const t of tables) {
      try {
        const [rows]: any = await p.query(`SELECT COUNT(*) as count FROM ${t}`);
        counts[t] = Number(rows?.[0]?.count) || 0;
      } catch {
        counts[t] = 0;
      }
    }
  } catch {
    // Return empty on failure
  }
  return counts;
}
