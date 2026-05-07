const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP email to the user
 */
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      `"Flutter Chennai Voting" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Voting OTP - Flutter Chennai Annual Vote",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a73e8; margin-bottom: 8px;">Flutter Chennai Annual Voting</h2>
        <p>Your one-time password (OTP) for voting is:</p>
        <div style="background: #f0f4ff; border-radius: 8px; padding: 20px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a73e8;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This OTP expires in <strong>5 minutes</strong>.</p>
        <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Flutter Chennai Community</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
