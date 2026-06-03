import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';
import redis from '../1_config/redis';
import { sendOTPEmail } from '../1_config/mailer';
import { RegisterPayload, LoginPayload, JwtPayload } from './auth.model';

// OTP, tok
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: '7d',
    },
  );
  return { accessToken, refreshToken };
};

// Chỉ admin tạo
export const registerUser = async (payload: RegisterPayload) => {
  const { username, temporaryPassword } = payload;

  const existing = await prisma.users.findFirst({
    where: { username },
  });
  if (existing) throw new Error('Email or username already exists');

  const password_hash = await bcrypt.hash(temporaryPassword, 10);

  // OTP kích hoạt
  const otp = generateOTP();

  const user = await prisma.users.create({
    data: {
      email: '',
      username,
      password_hash,
      role: 'user',
      email_verified: false,
    },
  });

  await redis.set(`otp:activate:${username}`, otp, 'EX', 180);

  return {
    message: 'Account created successfully',
    userId: user.id,
  };
};

// nhập email để nhận OTP
export const requestActivateOTP = async (username: string, email: string) => {
  const user = await prisma.users.findUnique({ where: { username } });
  if (!user) throw new Error('Account does not exist');
  if (user.email_verified) throw new Error('Account has already been activated');

  // Kiểm tra email chưa được dùng bởi acc khác
  const emailExist = await prisma.users.findFirst({
    where: { email, NOT: { username } },
  });
  if (emailExist) throw new Error('Email is already in use');

  const otp = generateOTP();
  await redis.set(`otp:activate:${username}`, otp, 'EX', 180);
  sendOTPEmail(email, otp);

  return { message: 'OTP has been sent to your email' };
};

// Kích hoạt acc lần đầu
export const activateAccount = async (
  username: string,
  email: string,
  otp: string,
  newPassword: string,
) => {
  const stored = await redis.get(`otp:activate:${username}`);
  if (!stored || stored !== otp)
    throw new Error('Invalid or expired OTP');

  const password_hash = await bcrypt.hash(newPassword, 10);

  await prisma.users.update({
    where: { username },
    data: { email, email_verified: true, password_hash },
  });

  await redis.del(`otp:activate:${username}`);
  return { message: 'Account activated successfully' };
};

// Login
export const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.users.findFirst({
    where: {
      OR: [{ email }, { username: email }],
    },
  });
  if (!user) throw new Error('Email does not exist');
  if (!user.email_verified) throw new Error('Account has not been activated');

  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) throw new Error('Incorrect password');

  const jwtPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken } = generateTokens(jwtPayload);

  // Lưu refresh token vào database
  await prisma.sessions.create({
    data: {
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    role: user.role,
    emailVerified: user.email_verified,
  };
};

// Quên pass
export const forgotPassword = async (email: string) => {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw new Error('Email does not exist');

  const otp = generateOTP();
  await redis.set(`otp:reset:${email}`, otp, 'EX', 180);
  sendOTPEmail(email, otp);

  return { message: 'Password reset OTP has been sent to your email' };
};

// Reset Pass
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const stored = await redis.get(`otp:reset:${email}`);
  if (!stored || stored !== otp)
    throw new Error('Invalid or expired OTP');

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw new Error('Account does not exist');

  const isSame = await bcrypt.compare(
    newPassword,
    user.password_hash as string,
  );
  if (isSame) throw new Error('New password must be different from the current one');

  const password_hash = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { email },
    data: { password_hash },
  });

  await redis.del(`otp:reset:${email}`);
  return { message: 'Password reset successfully' };
};

export const resendOTP = async (
  identifier: string,
  type: 'activate' | 'reset',
) => {
  if (type === 'activate') {
    const user = await prisma.users.findUnique({
      where: { username: identifier },
    });
    if (!user) throw new Error('Account does not exist');
    if (user.email_verified) throw new Error('Account has already been activated');

    const otp = generateOTP();
    await redis.set(`otp:activate:${identifier}`, otp, 'EX', 180);
    return { message: 'New OTP has been generated' };
  }

  const user = await prisma.users.findUnique({ where: { email: identifier } });
  if (!user) throw new Error('Email does not exist');

  const otp = generateOTP();
  await redis.set(`otp:reset:${identifier}`, otp, 'EX', 180);
  sendOTPEmail(identifier, otp);
  return { message: 'New OTP has been sent to your email' };
};

// Cấp accessTok
export const refreshAccessToken = async (refreshToken: string) => {
  const session = await prisma.sessions.findUnique({
    where: { refresh_token: refreshToken },
    include: { users: true },
  });
  if (!session || session.expires_at < new Date())
    throw new Error('Invalid refresh token');

  const payload: JwtPayload = {
    userId: session.users.id,
    email: session.users.email,
    role: session.users.role,
  };

  const { accessToken } = generateTokens(payload);
  return { accessToken };
};

// Log out
export const logoutUser = async (refreshToken: string) => {
  await prisma.sessions.delete({ where: { refresh_token: refreshToken } });
  return { message: 'Logged out successfully' };
};
