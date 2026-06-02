import { BrevoClient } from '@getbrevo/brevo';

export const sendOTPEmail = async (
  to: string,
  otp: string,
): Promise<boolean> => {
  try {
    const brevo = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY as string,
    });

    const data = await brevo.transactionalEmails.sendTransacEmail({
      subject: 'Mã xác thực OTP của H4C',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>Mã OTP của bạn</h2>
          <p>Có hiệu lực trong <strong>3 phút</strong>:</p>
          <h1 style="letter-spacing: 8px; color: #d64b29;">${otp}</h1>
          <p>Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
        </div>
      `,
      sender: {
        name: 'H4C App',
        email: process.env.BREVO_SENDER_EMAIL as string,
      },
      to: [{ email: to }],
    });

    return true;
  } catch (err: any) {
    return false;
  }
};