"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./entities/booking.entity");
const booking_detail_entity_1 = require("./entities/booking-detail.entity");
const room_entity_1 = require("../rooms/entities/room.entity");
let BookingsService = class BookingsService {
    bookingRepo;
    bookingDetailRepo;
    roomRepo;
    dataSource;
    constructor(bookingRepo, bookingDetailRepo, roomRepo, dataSource) {
        this.bookingRepo = bookingRepo;
        this.bookingDetailRepo = bookingDetailRepo;
        this.roomRepo = roomRepo;
        this.dataSource = dataSource;
    }
    async create(customerId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const checkIn = new Date(dto.CheckIn);
            const checkOut = new Date(dto.CheckOut);
            const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            const rooms = await queryRunner.manager.find(room_entity_1.Room, { where: { RoomId: (0, typeorm_2.In)(dto.RoomIds) }, relations: { roomType: true } });
            if (rooms.length !== dto.RoomIds.length) {
                throw new common_1.BadRequestException('Some rooms were not found');
            }
            let totalPrice = 0;
            for (const room of rooms) {
                totalPrice += Number(room.roomType.Price) * nights;
            }
            const booking = queryRunner.manager.create(booking_entity_1.Booking, {
                CustomerId: customerId,
                CheckIn: checkIn,
                CheckOut: checkOut,
                Adults: dto.Adults,
                Children: dto.Children,
                TotalPrice: totalPrice,
                SpecialRequest: dto.SpecialRequest,
                Status: 'Pending',
            });
            const savedBooking = await queryRunner.manager.save(booking);
            for (const room of rooms) {
                const detail = queryRunner.manager.create(booking_detail_entity_1.BookingDetail, {
                    BookingId: savedBooking.BookingId,
                    RoomId: room.RoomId,
                    Price: room.roomType.Price,
                    Nights: nights,
                });
                await queryRunner.manager.save(detail);
            }
            await queryRunner.commitTransaction();
            return { message: 'Booking created', BookingId: savedBooking.BookingId };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(customerId) {
        return this.bookingRepo.find({
            where: { CustomerId: customerId },
            order: { BookingDate: 'DESC' }
        });
    }
    async findOne(customerId, bookingId) {
        const booking = await this.bookingRepo.findOne({
            where: { BookingId: bookingId, CustomerId: customerId },
            relations: { details: { room: true }, payments: true, services: { service: true } }
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    async update(customerId, bookingId, updateData) {
        const booking = await this.findOne(customerId, bookingId);
        if (booking.Status === 'Cancelled' || booking.Status === 'Completed') {
            throw new common_1.BadRequestException('Cannot modify this booking');
        }
        if (updateData.Adults)
            booking.Adults = updateData.Adults;
        if (updateData.Children)
            booking.Children = updateData.Children;
        if (updateData.SpecialRequest)
            booking.SpecialRequest = updateData.SpecialRequest;
        await this.bookingRepo.save(booking);
        return { message: 'Booking updated' };
    }
    async cancel(customerId, bookingId) {
        const booking = await this.findOne(customerId, bookingId);
        if (booking.Status === 'Cancelled') {
            throw new common_1.BadRequestException('Booking is already cancelled');
        }
        booking.Status = 'Cancelled';
        await this.bookingRepo.save(booking);
        return { message: 'Booking cancelled' };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_detail_entity_1.BookingDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map