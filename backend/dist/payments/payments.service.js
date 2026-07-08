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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
let PaymentsService = class PaymentsService {
    paymentRepo;
    bookingRepo;
    constructor(paymentRepo, bookingRepo) {
        this.paymentRepo = paymentRepo;
        this.bookingRepo = bookingRepo;
    }
    async create(customerId, dto) {
        const booking = await this.bookingRepo.findOne({ where: { BookingId: dto.BookingId, CustomerId: customerId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const payment = this.paymentRepo.create({
            BookingId: dto.BookingId,
            Amount: dto.Amount,
            Method: dto.Method,
            Status: 'Paid',
            PaidAt: new Date()
        });
        const savedPayment = await this.paymentRepo.save(payment);
        if (booking.Status === 'Pending') {
            booking.Status = 'Confirmed';
            await this.bookingRepo.save(booking);
        }
        return { message: 'Payment successful', PaymentId: savedPayment.PaymentId };
    }
    async getHistory(customerId) {
        return this.paymentRepo.find({
            where: { booking: { CustomerId: customerId } },
            relations: { booking: true },
            order: { PaidAt: 'DESC' }
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map