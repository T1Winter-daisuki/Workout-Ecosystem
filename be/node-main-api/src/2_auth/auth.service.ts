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
  if (existing) throw new Error('Email hoặc username đã tồn tại');

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
    message: 'Tài khoản đã tạo thành công',
    userId: user.id,
  };
};

// nhập email để nhận OTP
export const requestActivateOTP = async (username: string, email: string) => {
  const user = await prisma.users.findUnique({ where: { username } });
  if (!user) throw new Error('Tài khoản không tồn tại');
  if (user.email_verified) throw new Error('Tài khoản đã được kích hoạt');

  // Kiểm tra email chưa được dùng bởi acc khác
  const emailExist = await prisma.users.findFirst({
    where: { email, NOT: { username } },
  });
  if (emailExist) throw new Error('Email đã được sử dụng');

  const otp = generateOTP();
  console.log('Before redis, username:', username, 'email:', email)
  await redis.set(`otp:activate:${username}`, otp, 'EX', 180);
  console.log('After redis, OTP:', otp)
  sendOTPEmail(email, otp);

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
    throw new Error('OTP không hợp lệ hoặc đã hết hạn');

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
  if (!user) throw new Error('Email không tồn tại');
  if (!user.email_verified) throw new Error('Tài khoản chưa được kích hoạt');

  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) throw new Error('Mật khẩu không đúng');

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
  if (!user) throw new Error('Email không tồn tại');

  const otp = generateOTP();
  await redis.set(`otp:reset:${email}`, otp, 'EX', 180);
  sendOTPEmail(email, otp);

  return { message: 'OTP đặt lại mật khẩu đã gửi về email' };
};

// Reset Pass
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const stored = await redis.get(`otp:reset:${email}`);
  if (!stored || stored !== otp)
    throw new Error('OTP không hợp lệ hoặc đã hết hạn');

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
) => {
  if (type === 'activate') {
    const user = await prisma.users.findUnique({
      where: { username: identifier },
    });
    if (!user) throw new Error('Tài khoản không tồn tại');
    if (user.email_verified) throw new Error('Tài khoản đã được kích hoạt rồi');

    const otp = generateOTP();
    await redis.set(`otp:activate:${identifier}`, otp, 'EX', 180);
    return { message: 'OTP mới đã được tạo' };
  }

  const user = await prisma.users.findUnique({ where: { email: identifier } });
  if (!user) throw new Error('Email không tồn tại');

  const otp = generateOTP();
  await redis.set(`otp:reset:${identifier}`, otp, 'EX', 180);
  sendOTPEmail(identifier, otp);
  return { message: 'OTP mới đã được gửi về email' };
};

// Cấp accessTok
export const refreshAccessToken = async (refreshToken: string) => {
  const session = await prisma.sessions.findUnique({
    where: { refresh_token: refreshToken },
    include: { users: true },
  });
  if (!session || session.expires_at < new Date())
    throw new Error('Refresh token không hợp lệ');

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
  return { message: 'Đăng xuất thành công' };
};
