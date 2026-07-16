import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const dataSource = app.get(DataSource);

  try {
    await dataSource.transaction(async (manager) => {
      // Order of dropping due to Foreign Key constraints.
      const tables = [
        'BookingServices',
        'Payments',
        'BookingDetails',
        'BookingVersions',
        'Bookings',
        'ChecklistLogs',
        'MaintenanceProves',
        'IssueReports',
        'StaffInfo',
        'Customers',
        'Accounts',
        'Rooms',
        'RoomTypes',
        'Services',
        'ChecklistTemplates',
      ];
      // eslint-disable-next-line no-console
      console.log('[seed:drop] Dropping all tables data...');
      for (const table of tables) {
        await manager.query(`DELETE FROM ${table}`);
      }
    });
    // eslint-disable-next-line no-console
    console.log('[seed:drop] All data cleared.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[seed:drop] Failed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed:drop] Fatal:', err);
  process.exit(1);
});