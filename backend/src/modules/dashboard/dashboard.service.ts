import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingVersion } from '../bookings/entities/booking-version.entity';
import { BookingDetail } from '../bookings/entities/booking-detail.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Room } from '../rooms/entities/room.entity';
import { RoomType } from '../rooms/entities/room-type.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingVersion)
    private readonly versionRepo: Repository<BookingVersion>,
    @InjectRepository(BookingDetail)
    private readonly detailRepo: Repository<BookingDetail>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(RoomType)
    private readonly roomTypeRepo: Repository<RoomType>,
  ) {}

  async getSummary(from?: string, to?: string) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. totalBookings (count in range)
    const totalBookings = await this.bookingRepo.count({
      where: {
        bookingDate: Between(fromDate, toDate),
      },
    });

    // 2. totalRevenue (sum of Paid payments in range)
    const revenueRaw = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.Amount)', 'total')
      .where("p.Status = 'Paid'")
      .andWhere('p.PaidAt BETWEEN :from AND :to', { from: fromDate, to: toDate })
      .getRawOne<{ total: string | null }>();
    const totalRevenue = Number(revenueRaw?.total ?? 0);

    // 3. occupancyRate (occupied rooms / total rooms)
    const totalRooms = await this.roomRepo.count();
    const occupiedRooms = await this.roomRepo.count({
      where: { status: 'Occupied' },
    });
    const occupancyRate = totalRooms > 0 ? occupiedRooms / totalRooms : 0;

    // 4. topRoomTypes (top 5 room types by bookings count in range)
    const topRoomTypesRaw = await this.versionRepo
      .createQueryBuilder('v')
      .innerJoin(Booking, 'b', 'b.BookingId = v.BookingId')
      .innerJoin(BookingDetail, 'd', 'd.VersionId = v.VersionId')
      .innerJoin(Room, 'r', 'r.RoomID = d.RoomId')
      .innerJoin(RoomType, 'rt', 'rt.TypeID = r.TypeID')
      .where('b.BookingDate BETWEEN :from AND :to', { from: fromDate, to: toDate })
      .select('rt.TypeName', 'typeName')
      .addSelect('COUNT(DISTINCT b.BookingId)', 'bookings')
      .groupBy('rt.TypeName')
      .orderBy('bookings', 'DESC')
      .limit(5)
      .getRawMany<{ typeName: string; bookings: string }>();

    const topRoomTypes = topRoomTypesRaw.map((rt) => ({
      typeName: rt.typeName,
      bookings: Number(rt.bookings),
    }));

    // 5. bookingsByDay (array of { date, count } for chart)
    const bookingsByDayRaw = await this.bookingRepo
      .createQueryBuilder('b')
      .select("CONVERT(varchar(10), b.BookingDate, 120)", 'date')
      .addSelect('COUNT(b.BookingId)', 'count')
      .where('b.BookingDate BETWEEN :from AND :to', { from: fromDate, to: toDate })
      .groupBy("CONVERT(varchar(10), b.BookingDate, 120)")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    const bookingsByDay = bookingsByDayRaw.map((d) => ({
      date: d.date,
      count: Number(d.count),
    }));

    // 6. recentBookings (last 5 summary: bookingId, customerName, totalPrice, status, checkIn, checkOut)
    const recent = await this.bookingRepo.find({
      order: { bookingDate: 'DESC' },
      take: 5,
      relations: { customer: true, versions: true },
    });

    const recentBookings = recent.map((b) => {
      const sortedVersions = b.versions
        ? [...b.versions].sort((x, y) => y.versionNumber - x.versionNumber)
        : [];
      const latest = sortedVersions[0];
      return {
        bookingId: b.bookingId,
        customerName: b.customer?.fullName ?? 'Unknown',
        totalPrice: Number(b.totalPrice),
        status: b.status,
        checkIn: latest?.checkIn ?? null,
        checkOut: latest?.checkOut ?? null,
      };
    });

    return {
      totalBookings,
      totalRevenue,
      occupancyRate,
      topRoomTypes,
      bookingsByDay,
      recentBookings,
    };
  }
}
