export enum BookFormat {
  Hardcover = 'Hardcover',
  Paperback = 'Paperback',
  Ebook = 'Ebook',
}

export enum BookCondition {
  New = 'New',
  Used = 'Used',
}

export enum OrderStatus {
  Created = 'Created',
  Paid = 'Paid',
  Shipped = 'Shipped',
  Cancelled = 'Cancelled',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Processed = 'Processed',
  Failed = 'Failed',
}

export enum StaffRole {
  Staff = 'Staff',
  Manager = 'Manager',
}

export enum AccountRole {
  Customer = 'customer',
  Staff = 'staff',
  Manager = 'manager',
}
