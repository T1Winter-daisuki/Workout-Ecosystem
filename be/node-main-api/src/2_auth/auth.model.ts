export interface RegisterPayload {
  username: string;
  temporaryPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}
