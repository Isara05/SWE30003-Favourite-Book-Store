import { BadRequestException } from '@nestjs/common';

const EMAIL_PATTERN =  /^[^\s@]+@gmail\.com$/i;

// Handles the trim value logic.
function trimValue(value: string | undefined | null): string {
  return (value ?? '').trim();
}

// Cleans up the name value before it is used.
export function normalizeName(value: string | undefined | null): string {
  return trimValue(value);
}

// Cleans up the address value before it is used.
export function normalizeAddress(value: string | undefined | null): string {
  return trimValue(value);
}

// Cleans up the email value before it is used.
export function normalizeEmail(value: string | undefined | null): string {
  return trimValue(value).toLowerCase();
}

// Cleans up the phone number value before it is used.
export function normalizePhoneNumber(value: string | undefined | null): string {
  return trimValue(value);
}

// Checks that the name value is valid.
export function assertName(value: string | undefined | null): string {
  const name = normalizeName(value);
  // Handles the if logic.
  if (name.length < 2 || name.length > 80) {
    throw new BadRequestException('Name must be between 2 and 80 characters.');
  }
  return name;
}

// Checks that the address value is valid.
export function assertAddress(value: string | undefined | null): string {
  const address = normalizeAddress(value);
  // Handles the if logic.
  if (address.length < 5 || address.length > 160) {
    throw new BadRequestException('Address must be between 5 and 160 characters.');
  }
  return address;
}

// Checks that the email value is valid.
export function assertEmail(value: string | undefined | null): string {
  const email = normalizeEmail(value);
  if (!EMAIL_PATTERN.test(email)) {
    throw new BadRequestException('Email must be a valid email address.');
  }
  return email;
}

// Checks that the phone number value is valid.
export function assertPhoneNumber(value: string | undefined | null): string {
  const phoneNumber = normalizePhoneNumber(value);

  // Remove spaces, brackets and hyphens before validation
  const normalized = phoneNumber.replace(/[\s()-]/g, '');

  //phone numbers
  const PhonePattern =
    /^(?:\+61|0)(?:[23478]\d{8}|4\d{8})$/;

  if (!PhonePattern.test(normalized)) {
    throw new BadRequestException(
      'Please enter a valid phone number.'
    );
  }

  return phoneNumber;
}

// Checks that the password value is valid.
export function assertPassword(value: string | undefined | null): string {
  const password = trimValue(value);
  // Handles the if logic.
  if (password.length < 6) {
    throw new BadRequestException('Password must be at least 6 characters.');
  }
  return password;
}