export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    role: 'customer' | 'staff' | 'manager';
    name: string;
    email: string;
  };
}
