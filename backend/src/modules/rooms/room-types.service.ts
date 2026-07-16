import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomType } from './entities/room-type.entity';
import { Room } from './entities/room.entity';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Injectable()
export class RoomTypesService {
  constructor(
    @InjectRepository(RoomType) private typeRepo: Repository<RoomType>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
  ) {}

  findAll() {
    return this.typeRepo.find();
  }

  create(dto: CreateRoomTypeDto) {
    return this.typeRepo.save(this.typeRepo.create(dto));
  }

  async update(id: string, dto: UpdateRoomTypeDto) {
    const type = await this.typeRepo.findOne({ where: { typeId: id } });
    if (!type) throw new NotFoundException('Room type not found');
    Object.assign(type, dto);
    return this.typeRepo.save(type);
  }

  async remove(id: string) {
    const type = await this.typeRepo.findOne({ where: { typeId: id } });
    if (!type) throw new NotFoundException('Room type not found');
    const roomCount = await this.roomRepo.count({ where: { typeId: id } });
    if (roomCount > 0) {
      throw new ConflictException(
        `Cannot delete room type: ${roomCount} room(s) still reference it`,
      );
    }
    await this.typeRepo.remove(type);
    return { message: 'Room type deleted' };
  }
}