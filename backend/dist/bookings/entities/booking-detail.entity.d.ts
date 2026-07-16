import { Booking } from './booking.entity';
import { Room } from '../../rooms/entities/room.entity';
export declare class BookingDetail {
    BookingDetailId: number;
    BookingId: number;
    RoomId: number;
    Price: number;
    Nights: number;
    booking: Booking;
    room: Room;
}
