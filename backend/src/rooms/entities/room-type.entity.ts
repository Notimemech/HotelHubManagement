import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Room } from './room.entity';

@Entity('RoomTypes')
export class RoomType {
  @PrimaryGeneratedColumn()
  RoomTypeId: number;

  @Column({ type: 'nvarchar', length: 50 })
  TypeName: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  Description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  Price: number;

  @Column({ type: 'int' })
  MaxGuests: number;

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}
