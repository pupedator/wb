import nodemailer from 'nodemailer';

interface EmailConfig {
  service: string;
  user: string;
  password: string;
  from: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const config: EmailConfig = {
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      from: process.env.EMAIL_FROM || 'noreply@gamingcafe.com'
    };

    if (!config.user || !config.password) {
      console.warn('Email service not configured. OTP emails will not be sent.');
      this.isConfigured = false;
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: config.service,
      auth: {
        user: config.user,
        pass: config.password
      }
    });

    this.isConfigured = true;
  }

  async sendOTP(email: string, name: string, otp: string, subject: string): Promise<{ success: boolean; message?: string }> {
    if (!this.isConfigured) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return { 
        success: true, 
        message: 'Email service not configured. Check console for OTP (development only).' 
      };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@gamingcafe.com',
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6b46c1 0%, #9333ea 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Gaming Cafe</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0;">Hello ${name}!</h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Your verification code for Gaming Cafe is:
              </p>
              
              <div style="background: #6b46c1; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 4px; margin: 25px 0;">
                ${otp}
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 25px;">
                This code will expire in 10 minutes. If you didn't request this, please ignore this email.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  © 2024 Gaming Cafe. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter!.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { 
        success: false, 
        message: 'Failed to send verification email. Please try again later.' 
      };
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; message?: string }> {
    if (!this.isConfigured) {
      return { success: true, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@gamingcafe.com',
        to: email,
        subject: 'Welcome to Gaming Cafe!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6b46c1 0%, #9333ea 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Gaming Cafe!</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0;">Hello ${name}!</h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Thank you for joining Gaming Cafe! Your account has been successfully created.
              </p>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                You can now:
                <ul style="color: #475569; margin: 10px 0; padding-left: 20px;">
                  <li>Open cases and win amazing rewards</li>
                  <li>Manage your bonus points</li>
                  <li>Explore our gaming facilities</li>
                </ul>
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #6b46c1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Start Gaming Now
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  © 2024 Gaming Cafe. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter!.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, message: 'Failed to send welcome email' };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
