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
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const room_entity_1 = require("./entities/room.entity");
const room_type_entity_1 = require("./entities/room-type.entity");
let RoomsService = class RoomsService {
    roomRepo;
    roomTypeRepo;
    constructor(roomRepo, roomTypeRepo) {
        this.roomRepo = roomRepo;
        this.roomTypeRepo = roomTypeRepo;
    }
    async findAll() {
        return this.roomRepo.find({ relations: { roomType: true } });
    }
    async findOne(id) {
        const room = await this.roomRepo.findOne({ where: { RoomId: id }, relations: { roomType: true } });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return room;
    }
    async checkAvailability(checkIn, checkOut, guests) {
        const qb = this.roomRepo.createQueryBuilder('room')
            .leftJoinAndSelect('room.roomType', 'roomType')
            .where('room.Status = :status', { status: 'Available' });
        if (guests) {
            qb.andWhere('roomType.MaxGuests >= :guests', { guests });
        }
        return qb.getMany();
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __param(1, (0, typeorm_1.InjectRepository)(room_type_entity_1.RoomType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map