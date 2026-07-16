import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity';
import { BookingDetail } from '../bookings/entities/booking-detail.entity';
import { BookingVersion } from '../bookings/entities/booking-version.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(RoomType) private roomTypeRepo: Repository<RoomType>,
    @InjectRepository(BookingDetail)
    private detailRepo: Repository<BookingDetail>,
    @InjectRepository(BookingVersion)
    private versionRepo: Repository<BookingVersion>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  async findAll() {
    return this.roomRepo.find({ relations: { roomType: true } });
  }

  async findOne(id: string) {
    const room = await this.roomRepo.findOne({
      where: { roomId: id },
      relations: { roomType: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async create(dto: Partial<Room>) {
    if (!dto.roomCode) {
      throw new BadRequestException('roomCode is required');
    }

    const existingRoom = await this.roomRepo.findOne({
      where: { roomCode: dto.roomCode },
    });
    if (existingRoom) {
      throw new BadRequestException('Room code already exists');
    }

    const roomType = await this.roomTypeRepo.findOne({
      where: { typeId: dto.typeId },
    });
    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    const room = this.roomRepo.create(dto);
    return this.roomRepo.save(room);
  }

  async update(id: string, dto: Partial<Room>) {
    const room = await this.roomRepo.findOne({ where: { roomId: id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (dto.roomCode) {
      const existingRoom = await this.roomRepo.findOne({
        where: { roomCode: dto.roomCode },
      });
      if (existingRoom && existingRoom.roomId !== id) {
        throw new BadRequestException('Room code already exists');
      }
    }

    if (dto.typeId) {
      const roomType = await this.roomTypeRepo.findOne({
        where: { typeId: dto.typeId },
      });
      if (!roomType) {
        throw new NotFoundException('Room type not found');
      }
    }

    Object.assign(room, dto);
    return this.roomRepo.save(room);
  }

  async setStatus(id: string, status: string) {
    const room = await this.roomRepo.findOne({ where: { roomId: id } });
    if (!room) throw new NotFoundException('Room not found');
    if (!['Available', 'Occupied', 'Maintenance', 'Cleaning'].includes(status)) {
      throw new BadRequestException(
        'status must be one of: Available, Occupied, Maintenance, Cleaning',
      );
    }
    room.status = status;
    return this.roomRepo.save(room);
  }

  async remove(id: string) {
    const room = await this.roomRepo.findOne({ where: { roomId: id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    await this.roomRepo.remove(room);
    return { message: 'Room deleted successfully' };
  }

  async checkAvailability(checkIn: string, checkOut: string, guests: number | undefined) {
    // No dates provided: fall back to plain status filter.
    if (!checkIn || !checkOut) {
      return this.roomRepo.find({
        where: { status: 'Available' },
        relations: { roomType: true },
      });
    }

    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (isNaN(ci.getTime()) || isNaN(co.getTime()) || ci >= co) {
      throw new BadRequestException(
        'checkIn and checkOut must be valid dates with checkIn < checkOut',
      );
    }

    // Standard overlap formula: existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn.
    // Excludes cancelled bookings.
    const occupiedRoomIds = this.versionRepo
      .createQueryBuilder('v')
      .innerJoin(BookingDetail, 'd', 'd.versionId = v.VersionId')
      .innerJoin(Booking, 'b', 'b.BookingId = v.BookingId')
      .where('v.CheckIn < :co', { co })
      .andWhere('v.CheckOut > :ci', { ci })
      .andWhere("b.Status <> 'Cancelled'")
      .select('DISTINCT d.RoomId', 'roomId')
      .getRawMany<{ roomId: string }>();

    const ids = (await occupiedRoomIds).map((r) => r.roomId);

    const qb = this.roomRepo
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomType', 'roomType')
      .where('room.Status = :status', { status: 'Available' });

    if (ids.length > 0) {
      qb.andWhere('room.RoomID NOT IN (:...ids)', { ids });
    }

    if (guests && Number.isFinite(guests)) {
      qb.andWhere('roomType.MaxGuests >= :guests', { guests: Number(guests) });
    }

    return qb.getMany();
  }
}