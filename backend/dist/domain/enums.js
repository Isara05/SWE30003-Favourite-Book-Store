"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRole = exports.StaffRole = exports.PaymentStatus = exports.OrderStatus = exports.BookCondition = exports.BookFormat = void 0;
var BookFormat;
(function (BookFormat) {
    BookFormat["Hardcover"] = "Hardcover";
    BookFormat["Paperback"] = "Paperback";
    BookFormat["Ebook"] = "Ebook";
})(BookFormat || (exports.BookFormat = BookFormat = {}));
var BookCondition;
(function (BookCondition) {
    BookCondition["New"] = "New";
    BookCondition["Used"] = "Used";
})(BookCondition || (exports.BookCondition = BookCondition = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Created"] = "Created";
    OrderStatus["Paid"] = "Paid";
    OrderStatus["Shipped"] = "Shipped";
    OrderStatus["Cancelled"] = "Cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "Pending";
    PaymentStatus["Processed"] = "Processed";
    PaymentStatus["Failed"] = "Failed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var StaffRole;
(function (StaffRole) {
    StaffRole["Staff"] = "Staff";
    StaffRole["Manager"] = "Manager";
})(StaffRole || (exports.StaffRole = StaffRole = {}));
var AccountRole;
(function (AccountRole) {
    AccountRole["Customer"] = "customer";
    AccountRole["Staff"] = "staff";
    AccountRole["Manager"] = "manager";
})(AccountRole || (exports.AccountRole = AccountRole = {}));
//# sourceMappingURL=enums.js.map