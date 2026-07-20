import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });
config({ path: resolve(__dirname, '../../../.env') });

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL ?? 'postgresql://griddna:griddna_dev_secret@localhost:5432/griddna',
  });

  await dataSource.initialize();
  console.log('Connected to database');

  const passwordHash = await bcrypt.hash('GridDNA2026!', 10);

  await dataSource.query(
    `UPDATE users SET password_hash = $1 WHERE email = 'admin@griddna.ai'`,
    [passwordHash],
  );

  console.log('Admin password set: GridDNA2026!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
