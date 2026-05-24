import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => console.log('PostgreSQL connected'))
pool.on('error', (err) => console.error('PostgreSQL error:', err))

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });