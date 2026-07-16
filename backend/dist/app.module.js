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
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const accounts_module_1 = require("./modules/accounts/accounts.module");
const auth_module_1 = require("./modules/auth/auth.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const customers_module_1 = require("./modules/customers/customers.module");
const database_module_1 = require("./modules/database/database.module");
const housekeeping_module_1 = require("./modules/housekeeping/housekeeping.module");
const maintenance_module_1 = require("./modules/maintenance/maintenance.module");
const payments_module_1 = require("./modules/payments/payments.module");
const rooms_module_1 = require("./modules/rooms/rooms.module");
const services_module_1 = require("./modules/services/services.module");
const staff_module_1 = require("./modules/staff/staff.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            accounts_module_1.AccountsModule,
            auth_module_1.AuthModule,
            bookings_module_1.BookingsModule,
            customers_module_1.CustomersModule,
            housekeeping_module_1.HousekeepingModule,
            maintenance_module_1.MaintenanceModule,
            payments_module_1.PaymentsModule,
            rooms_module_1.RoomsModule,
            services_module_1.ServicesModule,
            staff_module_1.StaffModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map