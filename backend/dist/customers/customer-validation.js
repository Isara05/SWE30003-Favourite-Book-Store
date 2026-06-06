"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeName = normalizeName;
exports.normalizeAddress = normalizeAddress;
exports.normalizeEmail = normalizeEmail;
exports.normalizePhoneNumber = normalizePhoneNumber;
exports.assertName = assertName;
exports.assertAddress = assertAddress;
exports.assertEmail = assertEmail;
exports.assertPhoneNumber = assertPhoneNumber;
exports.assertPassword = assertPassword;
const common_1 = require("@nestjs/common");
const EMAIL_PATTERN = /^[^\s@]+@gmail\.com$/i;
function trimValue(value) {
    return (value ?? '').trim();
}
function normalizeName(value) {
    return trimValue(value);
}
function normalizeAddress(value) {
    return trimValue(value);
}
function normalizeEmail(value) {
    return trimValue(value).toLowerCase();
}
function normalizePhoneNumber(value) {
    return trimValue(value);
}
function assertName(value) {
    const name = normalizeName(value);
    if (name.length < 2 || name.length > 80) {
        throw new common_1.BadRequestException('Name must be between 2 and 80 characters.');
    }
    return name;
}
function assertAddress(value) {
    const address = normalizeAddress(value);
    if (address.length < 5 || address.length > 160) {
        throw new common_1.BadRequestException('Address must be between 5 and 160 characters.');
    }
    return address;
}
function assertEmail(value) {
    const email = normalizeEmail(value);
    if (!EMAIL_PATTERN.test(email)) {
        throw new common_1.BadRequestException('Email must be a valid email address.');
    }
    return email;
}
function assertPhoneNumber(value) {
    const phoneNumber = normalizePhoneNumber(value);
    const normalized = phoneNumber.replace(/[\s()-]/g, '');
    const PhonePattern = /^(?:\+61|0)(?:[23478]\d{8}|4\d{8})$/;
    if (!PhonePattern.test(normalized)) {
        throw new common_1.BadRequestException('Please enter a valid phone number.');
    }
    return phoneNumber;
}
function assertPassword(value) {
    const password = trimValue(value);
    if (password.length < 6) {
        throw new common_1.BadRequestException('Password must be at least 6 characters.');
    }
    return password;
}
//# sourceMappingURL=customer-validation.js.map