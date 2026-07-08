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
exports.BookingDetail = void 0;
const typeorm_1 = require("typeorm");
const booking_entity_1 = require("./booking.entity");
const room_entity_1 = require("../../rooms/entities/room.entity");
let BookingDetail = class BookingDetail {
    BookingDetailId;
    BookingId;
    RoomId;
    Price;
    Nights;
    booking;
    room;
};
exports.BookingDetail = BookingDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BookingDetail.prototype, "BookingDetailId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BookingDetail.prototype, "BookingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BookingDetail.prototype, "RoomId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], BookingDetail.prototype, "Price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BookingDetail.prototype, "Nights", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, (booking) => booking.details),
    (0, typeorm_1.JoinColumn)({ name: 'BookingId' }),
    __metadata("design:type", booking_entity_1.Booking)
], BookingDetail.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_entity_1.Room, (room) => room.bookingDetails),
    (0, typeorm_1.JoinColumn)({ name: 'RoomId' }),
    __metadata("design:type", room_entity_1.Room)
], BookingDetail.prototype, "room", void 0);
exports.BookingDetail = BookingDetail = __decorate([
    (0, typeorm_1.Entity)('BookingDetails')
], BookingDetail);
//# sourceMappingURL=booking-detail.entity.js.map