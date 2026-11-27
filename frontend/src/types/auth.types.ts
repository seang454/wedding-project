export type UserRole = 'ADMIN' | 'OWNER' | 'CLERK' | 'ACCOUNTANT';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
