import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Room } from './room.entity';

@Entity('RoomTypes')
export class RoomType {
  @PrimaryGeneratedColumn({ name: 'TypeID' })
  TypeID: number;

  @Column({ name: 'TypeName', type: 'nvarchar', length: 50 })
  TypeName: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  Description: string;

  @Column({ name: 'PricePerDay', type: 'decimal', precision: 18, scale: 2 })
  PricePerDay: number;

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}
