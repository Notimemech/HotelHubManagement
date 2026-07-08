"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const customers_module_1 = require("./customers/customers.module");
const rooms_module_1 = require("./rooms/rooms.module");
const bookings_module_1 = require("./bookings/bookings.module");
const payments_module_1 = require("./payments/payments.module");
const services_module_1 = require("./services/services.module");
const customer_entity_1 = require("./customers/entities/customer.entity");
const room_type_entity_1 = require("./rooms/entities/room-type.entity");
const room_entity_1 = require("./rooms/entities/room.entity");
const booking_entity_1 = require("./bookings/entities/booking.entity");
const booking_detail_entity_1 = require("./bookings/entities/booking-detail.entity");
const payment_entity_1 = require("./payments/entities/payment.entity");
const service_entity_1 = require("./services/entities/service.entity");
const booking_service_entity_1 = require("./services/entities/booking-service.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mssql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '1433', 10),
                username: process.env.DB_USER || 'sa',
                password: process.env.DB_PASS || 'YourStrongPassword!',
                database: process.env.DB_NAME || 'HotelHubManagement',
                entities: [
                    customer_entity_1.Customer,
                    room_type_entity_1.RoomType,
                    room_entity_1.Room,
                    booking_entity_1.Booking,
                    booking_detail_entity_1.BookingDetail,
                    payment_entity_1.Payment,
                    service_entity_1.Service,
                    booking_service_entity_1.BookingService
                ],
                synchronize: false,
                extra: {
                    trustServerCertificate: true,
                }
            }),
            auth_module_1.AuthModule,
            customers_module_1.CustomersModule,
            rooms_module_1.RoomsModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            services_module_1.ServicesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map