import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Room } from './room.entity';

@Entity('RoomTypes')
export class RoomType {
  @PrimaryGeneratedColumn('uuid', { name: 'TypeID' })
  typeId!: string;

  @Column({ name: 'TypeName', type: 'nvarchar', length: 50 })
  typeName!: string;

  @Column({
    name: 'Description',
    type: 'nvarchar',
    length: 'MAX',
    nullable: true,
  })
  description!: string;

  @Column({ name: 'Price', type: 'decimal', precision: 18, scale: 2 })
  price!: number;

  @Column({ name: 'MaxGuests', type: 'int', default: 2 })
  maxGuests!: number;

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}
