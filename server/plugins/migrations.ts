import { runMigrations } from '../utils/migrations';

export default defineNitroPlugin(async (nitroApp) => {
  console.log('📦 Running database migrations...');
  await runMigrations();
});
