import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { AccountRole } from '../domain/enums';
import { AuthUser, Customer, UserAccount } from '../domain/models';
import { UserFactory } from '../domain/entities/user.factory';
import { AuthResponse, LoginDto, RegisterDto } from './dto';
import {
  assertAddress,
  assertEmail,
  assertName,
  assertPassword,
  assertPhoneNumber,
} from '../customers/customer-validation';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseProxyService,
    private readonly jwtService: JwtService,
  ) {}

  // Handles the register logic.
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const name = assertName(dto.name);
    const address = assertAddress(dto.address);
    const email = assertEmail(dto.email);
    const phoneNumber = assertPhoneNumber(dto.phoneNumber);
    const password = assertPassword(dto.password);

    const users = await this.db.getUsers();
    const existingUser = users.find((item) => item.email.toLowerCase() === email);

    // Handles the if logic.
    if (existingUser) {
      throw new BadRequestException('An account with that email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer: UserAccount = {
      userId: this.db.generateId('CUS'),
      role: AccountRole.Customer,
      name,
      address,
      email,
      phoneNumber,
      accountBalance: 0,
      passwordHash,
    };

    users.push(customer);
    await this.db.saveUsers(users);

    const userEntity = UserFactory.createUser(AccountRole.Customer, {
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
      role: AccountRole.Customer,
      name: userEntity.name,
      email: userEntity.email,
    });
  }

  // Handles the login logic.
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Handles the if logic.
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required.');
    }

    const email = dto.email.trim().toLowerCase();
    const users = await this.db.getUsers();

    const user = users.find((item) => item.email.toLowerCase() === email);
    if (user?.passwordHash && (await bcrypt.compare(dto.password, user.passwordHash))) {
      return this.createAuthResponse({
        id: user.userId,
        role: user.role,
        name: user.name,
        email: user.email,
      });
    }

    throw new UnauthorizedException('Invalid email or password.');
  }

  // Checks whether the user details are usable.
  async validateUser(email: string): Promise<AuthUser | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await this.db.getUsers();
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    // Handles the if logic.
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

  // Finds the matching user by email record.
  async findUserByEmail(email: string): Promise<AuthUser | null> {
    return this.validateUser(email);
  }

  private createAuthResponse(user: AuthUser): AuthResponse {
    return {
      accessToken: this.jwtService.sign({ sub: user.id, role: user.role, name: user.name, email: user.email }),
      user,
    };
  }
}
