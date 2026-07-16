import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity';
export declare class RoomsService {
    private roomRepo;
    private roomTypeRepo;
    constructor(roomRepo: Repository<Room>, roomTypeRepo: Repository<RoomType>);
    findAll(): Promise<Room[]>;
    findOne(id: number): Promise<Room>;
    checkAvailability(checkIn: string, checkOut: string, guests: number): Promise<Room[]>;
}
