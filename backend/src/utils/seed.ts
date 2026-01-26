import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';
import { logger } from './logger';

async function seed() {
  try {
    logger.info('Starting database seeding...');

    const seedPath = join(__dirname, '../../..', 'database/migrations/002_seed.sql');
    const seedSQL = readFileSync(seedPath, 'utf-8');

    await pool.query(seedSQL);
    logger.info('Seeding completed successfully');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
