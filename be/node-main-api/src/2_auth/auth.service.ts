import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';
import redis from '../1_config/redis';
import { sendOTPEmail } from '../1_config/mailer';
import { RegisterPayload, LoginPayload, JwtPayload } from './auth.model';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
} from './auth.errors';

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
  if (existing) throw new ConflictError('Email hoặc username đã tồn tại');

  const password_hash = await bcrypt.hash(temporaryPassword, 10);

  const user = await prisma.users.create({
    data: {
      email: null,
      username,
      password_hash,
      role: 'user',
      email_verified: false,
    },
  });

  return {
    message: 'Tài khoản đã tạo thành công',
    userId: user.id,
  };
};

// nhập email để nhận OTP
export const requestActivateOTP = async (username: string, email: string, temporaryPassword: string) => {
  const user = await prisma.users.findUnique({ where: { username } });
  if (!user) throw new NotFoundError('Tài khoản không tồn tại');
  if (user.email_verified) throw new ConflictError('Tài khoản đã được kích hoạt');

  const valid = await bcrypt.compare(temporaryPassword, user.password_hash as string);
  if (!valid) throw new UnauthorizedError('Mật khẩu không đúng');

  // Kiểm tra email chưa được dùng bởi acc khác
  const emailExist = await prisma.users.findFirst({
    where: { email, NOT: { username } },
  });
  if (emailExist) throw new ConflictError('Email đã được sử dụng');

  const otp = generateOTP();
  await redis.set(`otp:activate:${username}`, otp, 'EX', 180);

  const sent = await sendOTPEmail(email, otp);
  if (!sent) throw new InternalError('Gửi email thất bại, vui lòng thử lại sau');

  return { message: 'OTP đã gửi về email' };
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
    throw new UnauthorizedError('OTP không hợp lệ hoặc đã hết hạn');

  const password_hash = await bcrypt.hash(newPassword, 10);

  await prisma.users.update({
    where: { username },
    data: { email, email_verified: true, password_hash },
  });

  await redis.del(`otp:activate:${username}`);
  return { message: 'Tài khoản đã kích hoạt thành công' };
};

// Login
export const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.users.findFirst({
    where: {
      OR: [{ email }, { username: email }],
    },
  });
  if (!user) throw new NotFoundError('Email không tồn tại');

  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) throw new UnauthorizedError('Mật khẩu không đúng');

  if (!user.email_verified) throw new ForbiddenError('Tài khoản chưa được kích hoạt');

  const jwtPayload: JwtPayload = {
    userId: user.id,
    email: user.email as string,
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
  const genericMessage = {
    message: 'OTP đặt lại mật khẩu đã được gửi',
  };

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return genericMessage;

  const otp = generateOTP();
  await redis.set(`otp:reset:${email}`, otp, 'EX', 180);

  const sent = await sendOTPEmail(email, otp);
  if (!sent) throw new InternalError('Gửi OTP thất bại, vui lòng thử lại sau');

  return genericMessage;
};

// Reset Pass
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const stored = await redis.get(`otp:reset:${email}`);
  if (!stored || stored !== otp)
    throw new UnauthorizedError('OTP không hợp lệ hoặc đã hết hạn');

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw new NotFoundError('Tài khoản không tồn tại');

  const isSame = await bcrypt.compare(
    newPassword,
    user.password_hash as string,
  );
  if (isSame) throw new BadRequestError('Mật khẩu mới phải khác mật khẩu hiện tại');

  const password_hash = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { email },
    data: { password_hash },
  });

  await redis.del(`otp:reset:${email}`);
  return { message: 'Đặt lại mật khẩu thành công' };
};

export const resendOTP = async (
  identifier: string,
  type: 'activate' | 'reset',
  email?: string,
  temporaryPassword?: string,
) => {
  const genericMessage = { message: 'OTP mới đã được gửi' };

  if (type === 'activate') {
    const user = await prisma.users.findUnique({
      where: { username: identifier },
    });
    if (!user || user.email_verified) return genericMessage;

    const valid = await bcrypt.compare(temporaryPassword || '', user.password_hash as string);
    if (!valid) return genericMessage;

    const otp = generateOTP();
    await redis.set(`otp:activate:${identifier}`, otp, 'EX', 180);

    const sent = await sendOTPEmail(email as string, otp);
    if (!sent) throw new InternalError('Gửi OTP thất bại, vui lòng thử lại sau');

    return genericMessage;
  }

  const user = await prisma.users.findUnique({ where: { email: identifier } });
  if (!user) return genericMessage;

  const otp = generateOTP();
  await redis.set(`otp:reset:${identifier}`, otp, 'EX', 180);

  const sent = await sendOTPEmail(identifier, otp);
  if (!sent) throw new InternalError('Gửi OTP thất bại, vui lòng thử lại sau');

  return genericMessage;
};

// Cấp accessTok
export const refreshAccessToken = async (refreshToken: string) => {
  const session = await prisma.sessions.findUnique({
    where: { refresh_token: refreshToken },
    include: { users: true },
  });
  if (!session || session.expires_at < new Date())
    throw new UnauthorizedError('Refresh token không hợp lệ');

  const payload: JwtPayload = {
    userId: session.users.id,
    email: session.users.email as string,
    role: session.users.role,
  };

  const { accessToken } = generateTokens(payload);
  return { accessToken };
};

// Log out
export const logoutUser = async (refreshToken: string) => {
  await prisma.sessions.delete({ where: { refresh_token: refreshToken } });
  return { message: 'Đăng xuất thành công' };
};
