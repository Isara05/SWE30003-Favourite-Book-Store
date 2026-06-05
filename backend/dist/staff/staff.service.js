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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const database_proxy_service_1 = require("../database/database-proxy.service");
let StaffService = class StaffService {
    db;
    constructor(db) {
        this.db = db;
    }
    async listStaff() {
        return this.db.getStaff();
    }
    async getStaff(employeeId) {
        const staff = await this.db.getStaff();
        const member = staff.find((item) => item.employeeId === employeeId);
        if (!member) {
            throw new common_1.NotFoundException('Staff member not found.');
        }
        return member;
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_proxy_service_1.DatabaseProxyService])
], StaffService);
//# sourceMappingURL=staff.service.js.map