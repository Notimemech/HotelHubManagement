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
exports.Room = void 0;
const typeorm_1 = require("typeorm");
const room_type_entity_1 = require("./room-type.entity");
const booking_detail_entity_1 = require("../../bookings/entities/booking-detail.entity");
let Room = class Room {
    RoomId;
    RoomNumber;
    RoomTypeId;
    Floor;
    Status;
    roomType;
    bookingDetails;
};
exports.Room = Room;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Room.prototype, "RoomId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, unique: true }),
    __metadata("design:type", String)
], Room.prototype, "RoomNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Room.prototype, "RoomTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Room.prototype, "Floor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Room.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_type_entity_1.RoomType, (roomType) => roomType.rooms),
    (0, typeorm_1.JoinColumn)({ name: 'RoomTypeId' }),
    __metadata("design:type", room_type_entity_1.RoomType)
], Room.prototype, "roomType", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_detail_entity_1.BookingDetail, (bookingDetail) => bookingDetail.room),
    __metadata("design:type", Array)
], Room.prototype, "bookingDetails", void 0);
exports.Room = Room = __decorate([
    (0, typeorm_1.Entity)('Rooms')
], Room);
//# sourceMappingURL=room.entity.js.map