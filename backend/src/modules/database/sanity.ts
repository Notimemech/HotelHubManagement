import { DataSource } from 'typeorm';
import { Account } from '../accounts/entities/account.entity';
import { randomUUID } from 'crypto';

/**
 * Self-check: create Account with UUID PK, fetch by accountId, compare.
 * Run once at startup behind an env flag. No test framework needed.
 *
 * Skipped (deliberate): any broader unit/integration suite; this is the
 * minimum runnable check required by the refactor plan.
 * Add when: more entity relationships need roundtrip coverage.
 */
export async function runUuidRoundtripSanity(ds: DataSource): Promise<void> {
  if (process.env.SANITY_CHECK !== 'true') return;
  const repo = ds.getRepository(Account);
  const username = `sanity-${randomUUID().slice(0, 8)}`;
  const created = await repo.save(
    repo.create({
      username,
      password: 'not-used-in-sanity',
      isActive: true,
    }),
  );
  console.assert(
    typeof created.accountId === 'string' && created.accountId.length > 0,
    `[sanity] created.accountId should be a non-empty string, got ${created.accountId}`,
  );
  const fetched = await repo.findOne({ where: { accountId: created.accountId } });
  console.assert(
    fetched?.accountId === created.accountId,
    `[sanity] fetched.accountId ${fetched?.accountId} !== created ${created.accountId}`,
  );
  // cleanup
  await repo.delete({ accountId: created.accountId });
  // eslint-disable-next-line no-console
  console.log(`[sanity] UUID roundtrip OK: ${created.accountId}`);
}
