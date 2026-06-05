"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffEntity = exports.CustomerEntity = exports.PersonEntity = void 0;
const enums_1 = require("../enums");
class PersonEntity {
    name;
    address;
    email;
    phoneNumber;
    constructor(name, address, email, phoneNumber) {
        this.name = name;
        this.address = address;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }
}
exports.PersonEntity = PersonEntity;
class CustomerEntity {
    customerId;
    name;
    address;
    email;
    phoneNumber;
    accountBalance;
    permissions;
    passwordHash;
    constructor(customerId, name, address, email, phoneNumber, accountBalance = 0, permissions = ['shop', 'orders', 'profile'], passwordHash) {
        this.customerId = customerId;
        this.name = name;
        this.address = address;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.accountBalance = accountBalance;
        this.permissions = permissions;
        this.passwordHash = passwordHash;
    }
    static fromUserAccount(user) {
        return new CustomerEntity(user.userId, user.name, user.address, user.email, user.phoneNumber, user.accountBalance ?? 0, user.permissions ?? ['shop', 'orders', 'profile'], user.passwordHash);
    }
    toUserAccount() {
        return {
            userId: this.customerId,
            role: enums_1.AccountRole.Customer,
            name: this.name,
            address: this.address,
            email: this.email,
            phoneNumber: this.phoneNumber,
            accountBalance: this.accountBalance,
            permissions: this.permissions,
            passwordHash: this.passwordHash,
        };
    }
}
exports.CustomerEntity = CustomerEntity;
class StaffEntity {
    employeeId;
    name;
    address;
    email;
    phoneNumber;
    role;
    permissions;
    passwordHash;
    constructor(employeeId, name, address, email, phoneNumber, role = enums_1.StaffRole.Staff, permissions = ['dashboard', 'inventory', 'orders'], passwordHash) {
        this.employeeId = employeeId;
        this.name = name;
        this.address = address;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.permissions = permissions;
        this.passwordHash = passwordHash;
    }
    static fromUserAccount(user) {
        const role = user.role === enums_1.AccountRole.Manager ? enums_1.StaffRole.Manager : enums_1.StaffRole.Staff;
        return new StaffEntity(user.userId, user.name, user.address, user.email, user.phoneNumber, role, role === enums_1.StaffRole.Manager ? ['dashboard', 'manage-books', 'inventory', 'orders'] : ['dashboard', 'inventory', 'orders'], user.passwordHash);
    }
    toUserAccount() {
        return {
            userId: this.employeeId,
            role: this.role === enums_1.StaffRole.Manager ? enums_1.AccountRole.Manager : enums_1.AccountRole.Staff,
            name: this.name,
            address: this.address,
            email: this.email,
            phoneNumber: this.phoneNumber,
            permissions: this.permissions,
            passwordHash: this.passwordHash,
        };
    }
}
exports.StaffEntity = StaffEntity;
//# sourceMappingURL=person.entity.js.map