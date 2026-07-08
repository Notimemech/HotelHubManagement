import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(RoomType) private roomTypeRepo: Repository<RoomType>
  ) {}

  async findAll() {
    return this.roomRepo.find({ relations: { roomType: true } });
  }

  async findOne(id: number) {
    const room = await this.roomRepo.findOne({ where: { RoomId: id }, relations: { roomType: true } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async checkAvailability(checkIn: string, checkOut: string, guests: number) {
    const qb = this.roomRepo.createQueryBuilder('room')
      .leftJoinAndSelect('room.roomType', 'roomType')
      .where('room.Status = :status', { status: 'Available' });

    if (guests) {
      qb.andWhere('roomType.MaxGuests >= :guests', { guests });
    }

    return qb.getMany();
  }
}
