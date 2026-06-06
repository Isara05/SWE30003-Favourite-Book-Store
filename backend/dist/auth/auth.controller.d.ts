import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<import("./dto").AuthResponse>;
    register(body: RegisterDto): Promise<import("./dto").AuthResponse>;
    me(request: {
        user: {
            id: string;
            role: string;
            name: string;
            email: string;
        };
    }): {
        id: string;
        role: string;
        name: string;
        email: string;
    };
}
