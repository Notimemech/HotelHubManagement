import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { AccountsService } from '../modules/accounts/accounts.service';
import { Account } from '../modules/accounts/entities/account.entity';
import { AccountRole } from '../modules/accounts/entities/account-role.entity';
import { Role } from '../modules/accounts/entities/role.entity';
import { ROLES, STAFF_ACCOUNTS } from './roles.seed';

const OLD_ROLE_NAMES = ['Admin', 'Staff', 'Housekeeper', 'Maintenance'];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const dataSource = app.get(DataSource);
  const removedRoles: string[] = [];
  const addedRoles: string[] = [];
  const reassignedAccounts = new Set<string>();
  const errors: string[] = [];

  try {
    try {
      await dataSource.transaction(async (manager) => {
        const roleRepo = manager.getRepository(Role);
        const accountRepo = manager.getRepository(Account);
        const accountRoleRepo = manager.getRepository(AccountRole);
        const roleByName = new Map<string, Role>();

        for (const roleName of ROLES) {
          let role = await roleRepo.findOne({ where: { roleName } });
          if (!role) {
            role = await roleRepo.save(roleRepo.create({ roleName }));
            addedRoles.push(roleName);
          }
          roleByName.set(roleName, role);
        }

        const userRole = roleByName.get('User');
        if (!userRole) throw new Error('Required User role is missing');

        for (const oldRoleName of OLD_ROLE_NAMES) {
          const oldRole = await roleRepo.findOne({
            where: { roleName: oldRoleName },
          });
          if (!oldRole) continue;

          const links = await accountRoleRepo.find({
            where: { roleId: oldRole.roleId },
          });
          for (const link of links) {
            const hasUserRole = await accountRoleRepo.findOne({
              where: { accountId: link.accountId, roleId: userRole.roleId },
            });
            if (!hasUserRole) {
              await accountRoleRepo.save(
                accountRoleRepo.create({
                  accountId: link.accountId,
                  roleId: userRole.roleId,
                }),
              );
            }

            // Default old-role accounts to User before deleting obsolete roles.
            const account = await accountRepo.findOne({
              where: { accountId: link.accountId },
            });
            reassignedAccounts.add(account?.username ?? link.accountId);
            await accountRoleRepo.delete({
              accountId: link.accountId,
              roleId: oldRole.roleId,
            });
          }

          const remainingLinks = await accountRoleRepo.count({
            where: { roleId: oldRole.roleId },
          });
          if (remainingLinks > 0) {
            throw new Error(
              `Cannot delete role ${oldRoleName}: ${remainingLinks} account references remain`,
            );
          }
          await roleRepo.delete({ roleId: oldRole.roleId });
          removedRoles.push(oldRoleName);
        }

        // Bind the exported service to this transaction's repositories.
        const accountsService = new AccountsService(
          accountRepo,
          roleRepo,
          accountRoleRepo,
        );
        for (const staff of STAFF_ACCOUNTS) {
          const account = await accountRepo.findOne({
            where: { username: staff.username },
          });
          if (!account) {
            errors.push(`${staff.username}: account not found`);
            continue;
          }

          // setRole is additive, so clear stale roles before assigning the canonical role.
          await accountRoleRepo.delete({ accountId: account.accountId });
          await accountsService.setRole(account.accountId, staff.role);
        }
      });
    } catch (error) {
      removedRoles.length = 0;
      addedRoles.length = 0;
      reassignedAccounts.clear();
      errors.push(error instanceof Error ? error.message : String(error));
    }

    // eslint-disable-next-line no-console
    console.log('[migrate-roles] Summary');
    // eslint-disable-next-line no-console
    console.log(`  Removed roles: ${removedRoles.join(', ') || 'none'}`);
    // eslint-disable-next-line no-console
    console.log(`  Added roles: ${addedRoles.join(', ') || 'none'}`);
    // eslint-disable-next-line no-console
    console.log(
      `  Reassigned accounts: ${[...reassignedAccounts].join(', ') || 'none'}`,
    );
    // eslint-disable-next-line no-console
    console.log(`  Errors: ${errors.join('; ') || 'none'}`);
    if (errors.length > 0) process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[migrate-roles] Failed:', error);
  process.exitCode = 1;
});
