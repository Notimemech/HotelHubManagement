import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

@Entity('RefreshTokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid', { name: 'Id' })
  id!: string;

  @Index()
  @Column({ name: 'AccountId', type: 'uniqueidentifier' })
  accountId!: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'AccountId' })
  account?: Account;

  @Column({ name: 'TokenHash', type: 'varchar', length: 255, unique: true })
  tokenHash!: string;

  @Column({ name: 'ExpiresAt', type: 'datetime' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt!: Date;
}
