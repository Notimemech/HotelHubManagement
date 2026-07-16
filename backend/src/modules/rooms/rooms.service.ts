import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(RoomType) private roomTypeRepo: Repository<RoomType>,
  ) {}

  async findAll() {
    return this.roomRepo.find({ relations: { roomType: true } });
  }

  async findOne(id: number) {
    const room = await this.roomRepo.findOne({
      where: { RoomId: id },
      relations: { roomType: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async create(dto: Partial<Room>) {
    if (!dto.RoomCode) {
      throw new BadRequestException('RoomCode is required');
    }

    const existingRoom = await this.roomRepo.findOne({
      where: { RoomCode: dto.RoomCode },
    });
    if (existingRoom) {
      throw new BadRequestException('Room code already exists');
    }

    const roomType = await this.roomTypeRepo.findOne({
      where: { TypeID: dto.TypeID },
    });
    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    const room = this.roomRepo.create(dto);
    return this.roomRepo.save(room);
  }

  async update(id: number, dto: Partial<Room>) {
    const room = await this.roomRepo.findOne({ where: { RoomId: id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (dto.RoomCode) {
      const existingRoom = await this.roomRepo.findOne({
        where: { RoomCode: dto.RoomCode },
      });
      if (existingRoom && existingRoom.RoomId !== id) {
        throw new BadRequestException('Room code already exists');
      }
    }

    if (dto.TypeID) {
      const roomType = await this.roomTypeRepo.findOne({
        where: { TypeID: dto.TypeID },
      });
      if (!roomType) {
        throw new NotFoundException('Room type not found');
      }
    }

    Object.assign(room, dto);
    return this.roomRepo.save(room);
  }

  async remove(id: number) {
    const room = await this.roomRepo.findOne({ where: { RoomId: id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    await this.roomRepo.remove(room);
    return { message: 'Room deleted successfully' };
  }

  async checkAvailability(checkIn: string, checkOut: string, guests: number) {
    const qb = this.roomRepo
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomType', 'roomType')
      .where('room.Status = :status', { status: 'Available' });

    return qb.getMany();
  }
}
