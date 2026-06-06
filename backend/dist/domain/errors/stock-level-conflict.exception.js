"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockLevelConflictException = void 0;
const common_1 = require("@nestjs/common");
class StockLevelConflictException extends common_1.ConflictException {
    constructor(isbn, requested, available) {
        super(`Stock level conflict for ${isbn}: requested ${requested}, available ${available}.`);
    }
}
exports.StockLevelConflictException = StockLevelConflictException;
//# sourceMappingURL=stock-level-conflict.exception.js.map