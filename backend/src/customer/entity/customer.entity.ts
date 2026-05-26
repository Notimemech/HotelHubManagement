import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column({ length: 50, nullable: false })
  first_name: string;

  @Column({ length: 50, nullable: false })
  last_name: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ length: 20, unique: true, nullable: false })
  phone_number: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 50, nullable: true })
  nationality: string;

  @Column({ length: 30, unique: true, nullable: false })
  identity_number: string;

  @Column({ nullable: true })
  address: string;

  @Column({ length: 20, default: 'NORMAL' })
  customer_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
