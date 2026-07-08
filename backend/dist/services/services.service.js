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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_entity_1 = require("./entities/service.entity");
const booking_service_entity_1 = require("./entities/booking-service.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
let ServicesService = class ServicesService {
    serviceRepo;
    bookingServiceRepo;
    bookingRepo;
    constructor(serviceRepo, bookingServiceRepo, bookingRepo) {
        this.serviceRepo = serviceRepo;
        this.bookingServiceRepo = bookingServiceRepo;
        this.bookingRepo = bookingRepo;
    }
    async findAll() {
        return this.serviceRepo.find();
    }
    async requestService(customerId, dto) {
        const booking = await this.bookingRepo.findOne({ where: { BookingId: dto.BookingId, CustomerId: customerId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const service = await this.serviceRepo.findOne({ where: { ServiceId: dto.ServiceId } });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        const bookingService = this.bookingServiceRepo.create({
            BookingId: dto.BookingId,
            ServiceId: dto.ServiceId,
            Quantity: dto.Quantity
        });
        await this.bookingServiceRepo.save(bookingService);
        booking.TotalPrice = Number(booking.TotalPrice) + (Number(service.Price) * dto.Quantity);
        await this.bookingRepo.save(booking);
        return { message: 'Service requested successfully', TotalPrice: booking.TotalPrice };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_service_entity_1.BookingService)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ServicesService);
//# sourceMappingURL=services.service.js.map