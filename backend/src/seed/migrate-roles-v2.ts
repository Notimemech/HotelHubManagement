import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const dataSource = app.get(DataSource);

  try {
    await dataSource.transaction(async (manager) => {
      // 1. Find out if legacy tables exist
      const tableResults: any[] = await manager.query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('AccountRoles','Roles','Accounts')`,
      );
      const existing = new Set(tableResults.map((r) => r.TABLE_NAME));
      const hasAccounts = existing.has('Accounts');
      const hasAccountRoles = existing.has('AccountRoles');
      const hasRoles = existing.has('Roles');
      if (!hasAccounts) throw new Error('Accounts table missing');

      // 2. Ensure Accounts.Role column exists (idempotent)
      const roleCol: any[] = await manager.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Accounts' AND COLUMN_NAME='Role'`,
      );
      if (roleCol.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[migrate-roles-v2] Adding Accounts.Role column');
        await manager.query(
          `ALTER TABLE Accounts ADD Role NVARCHAR(50) NOT NULL CONSTRAINT DF_Accounts_Role DEFAULT N'User'`,
        );
      } else {
        // eslint-disable-next-line no-console
        console.log('[migrate-roles-v2] Accounts.Role already exists — skipping add');
      }

      // 3. Migrate AccountRoles -> Accounts.Role
      if (hasAccountRoles && hasRoles) {
        // eslint-disable-next-line no-console
        console.log('[migrate-roles-v2] Copying from AccountRoles -> Accounts.Role');
        // Use first role per account when multiple exist
        await manager.query(`
          ;WITH ranked AS (
            SELECT ar.AccountId, r.RoleName,
                   ROW_NUMBER() OVER (PARTITION BY ar.AccountId ORDER BY r.RoleName) AS rn
            FROM AccountRoles ar
            JOIN Roles r ON r.RoleId = ar.RoleId
          )
          UPDATE A SET A.Role = r.RoleName
          FROM Accounts A
          JOIN ranked r ON r.AccountId = A.AccountId AND r.rn = 1
          WHERE A.Role IS NULL OR A.Role = N'User';
        `);
      } else {
        // eslint-disable-next-line no-console
        console.log('[migrate-roles-v2] No legacy AccountRoles — leaving Roles in place');
      }

      // 4. Default leftover Accounts to 'User'
      // eslint-disable-next-line no-console
      console.log('[migrate-roles-v2] Backfilling NULL/blank Role to User');
      await manager.query(
        `UPDATE Accounts SET Role = N'User' WHERE Role IS NULL OR LTRIM(RTRIM(Role)) = N''`,
      );

      // 5. Drop FK if any
      if (hasAccountRoles) {
        // eslint-disable-next-line no-console
        console.log('[migrate-roles-v2] Dropping FK constraints on AccountRoles');
        const fks: any[] = await manager.query(`
          SELECT fk.name AS fk_name
          FROM sys.foreign_keys fk
          WHERE fk.parent_object_id = OBJECT_ID('AccountRoles')
        `);
        for (const fk of fks) {
          await manager.query(`ALTER TABLE AccountRoles DROP CONSTRAINT ${fk.fk_name}`);
        }

        // eslint-disable-next-line no-console
        console.log('[migrate-roles-v2] Dropping AccountRoles');
        await manager.query(`DROP TABLE AccountRoles`);
      }

      if (hasRoles) {
        // eslint-disable-next-line no-console
        console.log('[migrate-roles-v2] Dropping Roles');
        await manager.query(`DROP TABLE Roles`);
      }
    });

    // eslint-disable-next-line no-console
    console.log('[migrate-roles-v2] Done.');
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[migrate-roles-v2] Failed:', err);
  process.exitCode = 1;
});
