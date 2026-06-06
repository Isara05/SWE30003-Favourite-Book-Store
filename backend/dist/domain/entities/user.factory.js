"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFactory = void 0;
const enums_1 = require("../enums");
const person_entity_1 = require("./person.entity");
class UserFactory {
    static createUser(roleType, payload) {
        const normalized = typeof roleType === 'string' ? roleType.toLowerCase() : roleType;
        if (normalized === enums_1.AccountRole.Customer || normalized === 'customer') {
            return new person_entity_1.CustomerEntity(payload.userId, payload.name, payload.address, payload.email, payload.phoneNumber, payload.accountBalance ?? 0, ['shop', 'orders', 'profile'], payload.passwordHash);
        }
        const staffRole = normalized === enums_1.AccountRole.Manager || normalized === enums_1.StaffRole.Manager || normalized === 'manager'
            ? enums_1.StaffRole.Manager
            : enums_1.StaffRole.Staff;
        return new person_entity_1.StaffEntity(payload.userId, payload.name, payload.address, payload.email, payload.phoneNumber, staffRole, staffRole === enums_1.StaffRole.Manager ? ['dashboard', 'manage-books', 'inventory', 'orders'] : ['dashboard', 'inventory', 'orders'], payload.passwordHash);
    }
}
exports.UserFactory = UserFactory;
//# sourceMappingURL=user.factory.js.map