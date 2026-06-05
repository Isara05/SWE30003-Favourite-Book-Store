"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const enums_1 = require("../domain/enums");
let MenuService = class MenuService {
    getMenuForRole(role) {
        const r = typeof role === 'string' ? role.toLowerCase() : enums_1.AccountRole[role];
        switch (r) {
            case 'manager':
            case enums_1.AccountRole.Manager:
                return [
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'manage-books', label: 'Manage Books' },
                    { id: 'inventory', label: 'Inventory' },
                    { id: 'orders', label: 'Orders' },
                ];
            case 'staff':
            case enums_1.AccountRole.Staff:
                return [
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'inventory', label: 'Inventory' },
                    { id: 'orders', label: 'Orders' },
                ];
            default:
                return [
                    { id: 'shop', label: 'Shop' },
                    { id: 'orders', label: 'My Orders' },
                    { id: 'profile', label: 'Profile' },
                ];
        }
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)()
], MenuService);
//# sourceMappingURL=menu.service.js.map