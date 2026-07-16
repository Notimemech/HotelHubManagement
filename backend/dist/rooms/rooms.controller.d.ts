import { RoomsService } from './rooms.service';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    checkAvailability(checkIn: string, checkOut: string, guests: number): Promise<import("./entities/room.entity").Room[]>;
    findAll(): Promise<import("./entities/room.entity").Room[]>;
    findOne(id: number): Promise<import("./entities/room.entity").Room>;
}
