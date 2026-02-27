import * as dotenv from 'dotenv';
dotenv.config();

process.env.DB_PASSWORD = process.env.DB_PASS || process.env.DB_PASSWORD;

import '../config/env';
import { pool } from '../infra/database/pool';

async function runMigration() {
  try {
    console.log('Running migration on app.users...')
    await pool.query(`
      ALTER TABLE app.users
        ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
        ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
        ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;
    `)
    console.log('Migration completed successfully.')
  } catch (error) {
    console.error('Error running migration:', error)
  } finally {
    await pool.end()
  }
}

runMigration()
