import { Room } from './room.entity';
export declare class RoomType {
    RoomTypeId: number;
    TypeName: string;
    Description: string;
    Price: number;
    MaxGuests: number;
    rooms: Room[];
}
