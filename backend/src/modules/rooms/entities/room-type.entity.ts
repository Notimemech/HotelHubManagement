import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Room } from './room.entity';

@Entity('RoomTypes')
export class RoomType {
  @PrimaryGeneratedColumn({ name: 'TypeID' })
  TypeID: number;

  @Column({ name: 'TypeName', type: 'nvarchar', length: 50 })
  TypeName: string;

  @Column({
    name: 'Description',
    type: 'nvarchar',
    length: 'MAX',
    nullable: true,
  })
  Description: string;

  @Column({ name: 'Price', type: 'decimal', precision: 18, scale: 2 })
  Price: number;

  @Column({ name: 'MaxGuests', type: 'int', default: 2 })
  MaxGuests: number;

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}
