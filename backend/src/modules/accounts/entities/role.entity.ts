import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AccountRole } from './account-role.entity';

@Entity('Roles')
export class Role {
  @PrimaryGeneratedColumn('uuid', { name: 'RoleId' })
  roleId!: string;

  @Column({ name: 'RoleName', type: 'nvarchar', length: 50 })
  roleName!: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 255, nullable: true })
  description!: string;

  @OneToMany(() => AccountRole, (accountRole) => accountRole.role)
  accountRoles: AccountRole[];
}
