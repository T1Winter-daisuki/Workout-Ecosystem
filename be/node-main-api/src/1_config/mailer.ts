export const sendOTPEmail = async (
  to: string,
  otp: string,
): Promise<boolean> => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY as string,
      },
      body: JSON.stringify({
        sender: {
          name: 'H4C App',
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject: 'Mã xác thực OTP của H4C',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2>Your OTP Code</h2>
            <p>Valid for <strong>3 minutes</strong>:</p>
            <h1 style="letter-spacing: 8px; color: #d64b29;">${otp}</h1>
            <p>If you did not request this code, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (err: any) {
    return false;
  }
};