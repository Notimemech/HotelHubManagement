export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

// Adapts both legacy `{ token }` and target `{ accessToken, refreshToken }` shapes.
export type LoginResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  user?: UserProfile;
};

export type RegisterResponse = {
  message?: string;
  customerId?: string;
};

export type UserProfile = {
  customerId?: string;
  accountId?: string;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type DecodedToken = {
  sub: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
};
