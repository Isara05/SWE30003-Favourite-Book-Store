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
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("./catalog.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const enums_1 = require("../domain/enums");
let CatalogController = class CatalogController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async listBooks(search, genre, author, format, condition, limit, offset) {
        return this.catalogService.listBooks({ search, genre, author, format, condition, limit, offset });
    }
    async getBook(isbn) {
        return this.catalogService.getBook(isbn);
    }
    async createBook(body, request) {
        return this.catalogService.createBook(body);
    }
    async updateBook(isbn, body) {
        return this.catalogService.updateBookDetails(isbn, body);
    }
    async updateStock(isbn, body) {
        return this.catalogService.updateBookStock(isbn, Number(body.quantity));
    }
    async deleteBook(isbn) {
        await this.catalogService.deleteBook(isbn);
        return { deleted: true, isbn };
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('books'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('genre')),
    __param(2, (0, common_1.Query)('author')),
    __param(3, (0, common_1.Query)('format')),
    __param(4, (0, common_1.Query)('condition')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "listBooks", null);
__decorate([
    (0, common_1.Get)('books/:isbn'),
    __param(0, (0, common_1.Param)('isbn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.AccountRole.Staff, enums_1.AccountRole.Manager),
    (0, common_1.Post)('books'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.AccountRole.Staff, enums_1.AccountRole.Manager),
    (0, common_1.Put)('books/:isbn'),
    __param(0, (0, common_1.Param)('isbn')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateBook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.AccountRole.Staff, enums_1.AccountRole.Manager),
    (0, common_1.Patch)('books/:isbn/stock'),
    __param(0, (0, common_1.Param)('isbn')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateStock", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.AccountRole.Staff, enums_1.AccountRole.Manager),
    (0, common_1.Delete)('books/:isbn'),
    __param(0, (0, common_1.Param)('isbn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteBook", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.Controller)('catalog'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map