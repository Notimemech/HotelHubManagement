import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AccountRole } from './account-role.entity';

@Entity('Roles')
export class Role {
  @PrimaryGeneratedColumn()
  RoleId: number;

  @Column({ type: 'nvarchar', length: 50 })
  RoleName: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Description: string;

  @OneToMany(() => AccountRole, (accountRole) => accountRole.role)
  accountRoles: AccountRole[];
}
