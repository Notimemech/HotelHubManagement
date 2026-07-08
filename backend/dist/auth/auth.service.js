"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const customer_entity_1 = require("../customers/entities/customer.entity");
let AuthService = class AuthService {
    customerRepo;
    jwtService;
    constructor(customerRepo, jwtService) {
        this.customerRepo = customerRepo;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.customerRepo.findOne({
            where: [{ Email: dto.Email }, { Phone: dto.Phone }]
        });
        if (existing)
            throw new common_1.BadRequestException('Email or Phone already exists');
        const hashedPassword = await bcrypt.hash(dto.Password, 10);
        const newCustomer = this.customerRepo.create({
            FullName: dto.FullName,
            Email: dto.Email,
            Phone: dto.Phone,
            Password: hashedPassword,
        });
        const savedCustomer = await this.customerRepo.save(newCustomer);
        return {
            message: 'Registered successfully',
            CustomerId: savedCustomer.CustomerId
        };
    }
    async login(dto) {
        const customer = await this.customerRepo.findOne({
            where: [{ Email: dto.Username }, { Phone: dto.Username }]
        });
        if (!customer)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isMatch = await bcrypt.compare(dto.Password, customer.Password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: customer.CustomerId, email: customer.Email };
        return {
            access_token: await this.jwtService.signAsync(payload)
        };
    }
    logout() {
        return { message: 'Logged out successfully' };
    }
    async changePassword(customerId, dto) {
        const customer = await this.customerRepo.findOne({ where: { CustomerId: customerId } });
        if (!customer)
            throw new common_1.BadRequestException('Customer not found');
        const isMatch = await bcrypt.compare(dto.OldPassword, customer.Password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Old password incorrect');
        customer.Password = await bcrypt.hash(dto.NewPassword, 10);
        await this.customerRepo.save(customer);
        return { message: 'Password changed successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map