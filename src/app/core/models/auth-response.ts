export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  expiration: Date;
  roles?: string[];
  refreshToken: string;
}
