import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: `"Ecosystem App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Mã xác thực OTP của bạn',
    html: `
      <h2>Mã OTP của bạn</h2>
      <p>Mã OTP có hiệu lực trong <strong>3 phút</strong>:</p>
      <h1 style="letter-spacing: 8px; color: #da4040;">${otp}</h1>
      <p>Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
    `,
  });
};

export default transporter;
