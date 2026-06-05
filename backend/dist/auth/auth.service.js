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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_proxy_service_1 = require("../database/database-proxy.service");
const enums_1 = require("../domain/enums");
const user_factory_1 = require("../domain/entities/user.factory");
const customer_validation_1 = require("../customers/customer-validation");
let AuthService = class AuthService {
    db;
    jwtService;
    constructor(db, jwtService) {
        this.db = db;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const name = (0, customer_validation_1.assertName)(dto.name);
        const address = (0, customer_validation_1.assertAddress)(dto.address);
        const email = (0, customer_validation_1.assertEmail)(dto.email);
        const phoneNumber = (0, customer_validation_1.assertPhoneNumber)(dto.phoneNumber);
        const password = (0, customer_validation_1.assertPassword)(dto.password);
        const users = await this.db.getUsers();
        const existingUser = users.find((item) => item.email.toLowerCase() === email);
        if (existingUser) {
            throw new common_1.BadRequestException('An account with that email already exists.');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const customer = {
            userId: this.db.generateId('CUS'),
            role: enums_1.AccountRole.Customer,
            name,
            address,
            email,
            phoneNumber,
            accountBalance: 0,
            passwordHash,
        };
        users.push(customer);
        await this.db.saveUsers(users);
        const userEntity = user_factory_1.UserFactory.createUser(enums_1.AccountRole.Customer, {
            userId: customer.userId,
            name: customer.name,
            address: customer.address,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            accountBalance: customer.accountBalance,
            passwordHash: customer.passwordHash,
        });
        return this.createAuthResponse({
            id: customer.userId,
            role: enums_1.AccountRole.Customer,
            name: userEntity.name,
            email: userEntity.email,
        });
    }
    async login(dto) {
        if (!dto.email || !dto.password) {
            throw new common_1.BadRequestException('Email and password are required.');
        }
        const email = dto.email.trim().toLowerCase();
        const users = await this.db.getUsers();
        const user = users.find((item) => item.email.toLowerCase() === email);
        if (user?.passwordHash && (await bcryptjs_1.default.compare(dto.password, user.passwordHash))) {
            return this.createAuthResponse({
                id: user.userId,
                role: user.role,
                name: user.name,
                email: user.email,
            });
        }
        throw new common_1.UnauthorizedException('Invalid email or password.');
    }
    async validateUser(email) {
        const normalizedEmail = email.trim().toLowerCase();
        const users = await this.db.getUsers();
        const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);
        if (!user) {
            return null;
        }
        return {
            id: user.userId,
            role: user.role,
            name: user.name,
            email: user.email,
        };
    }
    async findUserByEmail(email) {
        return this.validateUser(email);
    }
    createAuthResponse(user) {
        return {
            accessToken: this.jwtService.sign({ sub: user.id, role: user.role, name: user.name, email: user.email }),
            user,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_proxy_service_1.DatabaseProxyService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map