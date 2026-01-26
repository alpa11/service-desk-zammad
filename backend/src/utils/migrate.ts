import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';
import { logger } from './logger';

async function migrate() {
  try {
    logger.info('Starting database migration...');

    const migrationPath = join(__dirname, '../../..', 'database/migrations/001_initial.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    await pool.query(migrationSQL);
    logger.info('Migration completed successfully');

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
