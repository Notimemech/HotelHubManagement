import { RoomType } from './room-type.entity';
import { BookingDetail } from '../../bookings/entities/booking-detail.entity';
export declare class Room {
    RoomId: number;
    RoomNumber: string;
    RoomTypeId: number;
    Floor: number;
    Status: string;
    roomType: RoomType;
    bookingDetails: BookingDetail[];
}
