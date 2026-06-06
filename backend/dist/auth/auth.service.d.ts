import { JwtService } from '@nestjs/jwt';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { AuthUser } from '../domain/models';
import { AuthResponse, LoginDto, RegisterDto } from './dto';
export declare class AuthService {
    private readonly db;
    private readonly jwtService;
    constructor(db: DatabaseProxyService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    validateUser(email: string): Promise<AuthUser | null>;
    findUserByEmail(email: string): Promise<AuthUser | null>;
    private createAuthResponse;
}
