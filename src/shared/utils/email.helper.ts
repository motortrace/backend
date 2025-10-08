import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"MotorTrace" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(' Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  generatePasswordResetEmail(otp: string, email: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - MotorTrace</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                width: 80px;
                height: 80px;
                background-color: #3B82F6;
                border-radius: 15px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            .title {
                color: #1F2937;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #6B7280;
                font-size: 16px;
                margin-bottom: 30px;
            }
            .otp-container {
                background-color: #F3F4F6;
                border: 2px dashed #D1D5DB;
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
            }
            .otp-label {
                color: #374151;
                font-size: 14px;
                margin-bottom: 10px;
            }
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #3B82F6;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }
            .instructions {
                background-color: #FEF3C7;
                border-left: 4px solid #F59E0B;
                padding: 20px;
                margin: 30px 0;
                border-radius: 5px;
            }
            .instructions h3 {
                color: #92400E;
                margin-top: 0;
                font-size: 18px;
            }
            .instructions ul {
                color: #92400E;
                margin: 10px 0;
                padding-left: 20px;
            }
            .security-notice {
                background-color: #FEE2E2;
                border-left: 4px solid #EF4444;
                padding: 20px;
                margin: 30px 0;
                border-radius: 5px;
            }
            .security-notice h3 {
                color: #DC2626;
                margin-top: 0;
                font-size: 18px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #E5E7EB;
                color: #6B7280;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background-color: #3B82F6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">MT</div>
                <h1 class="title">Password Reset Request</h1>
                <p class="subtitle">We received a request to reset your password</p>
            </div>

            <p>Hello,</p>
            <p>We received a request to reset your password for your MotorTrace account associated with <strong>${email}</strong>.</p>

            <div class="otp-container">
                <div class="otp-label">Your verification code is:</div>
                <div class="otp-code">${otp}</div>
            </div>

            <div class="instructions">
                <h3>📱 How to use this code:</h3>
                <ul>
                    <li>Open the MotorTrace app</li>
                    <li>Go to the password reset screen</li>
                    <li>Enter the 6-digit code above</li>
                    <li>Create your new password</li>
                </ul>
            </div>

            <div class="security-notice">
                <h3>🔒 Security Notice</h3>
                <p>This code will expire in <strong>10 minutes</strong> for your security.</p>
                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
            </div>

            <p>If you're having trouble with the code, you can request a new one from the app.</p>

            <div class="footer">
                <p>This email was sent by MotorTrace</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>© 2024 MotorTrace. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generatePasswordResetText(otp: string, email: string): string {
    return `
MotorTrace - Password Reset Request

Hello,

We received a request to reset your password for your MotorTrace account associated with ${email}.

Your verification code is: ${otp}

This code will expire in 10 minutes for your security.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

If you're having trouble with the code, you can request a new one from the app.

This email was sent by MotorTrace
© 2024 MotorTrace. All rights reserved.
    `;
  }
}

export const emailService = new EmailService();
export default emailService;
