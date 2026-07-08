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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const typeorm_1 = require("typeorm");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const service_entity_1 = require("./service.entity");
let BookingService = class BookingService {
    BookingServiceId;
    BookingId;
    ServiceId;
    Quantity;
    booking;
    service;
};
exports.BookingService = BookingService;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BookingService.prototype, "BookingServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BookingService.prototype, "BookingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BookingService.prototype, "ServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BookingService.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, (booking) => booking.services),
    (0, typeorm_1.JoinColumn)({ name: 'BookingId' }),
    __metadata("design:type", booking_entity_1.Booking)
], BookingService.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.bookingServices),
    (0, typeorm_1.JoinColumn)({ name: 'ServiceId' }),
    __metadata("design:type", service_entity_1.Service)
], BookingService.prototype, "service", void 0);
exports.BookingService = BookingService = __decorate([
    (0, typeorm_1.Entity)('BookingServices')
], BookingService);
//# sourceMappingURL=booking-service.entity.js.map