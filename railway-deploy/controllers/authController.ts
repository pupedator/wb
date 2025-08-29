import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import emailService from '../services/emailService.js';
import { 
  LoginRequest, 
  RegisterRequest, 
  OTPRequest, 
  ResetPasswordRequest,
  AuthResponse,
  AuthRequest 
} from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Helper function to generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);
};

// Helper function to generate OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to format user for response
const formatUserResponse = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  status: user.status
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (user.status === 'banned') {
      res.status(403).json({ success: false, message: 'banned' });
      return;
    }

    if (!user.emailVerified) {
      res.status(401).json({ success: false, message: 'Please verify your email first' });
      return;
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString(), user.email, user.role);
    
    const response: AuthResponse = {
      success: true,
      token,
      user: formatUserResponse(user)
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }

    // Generate OTP and send email
    const otp = generateOTP();
    const emailResult = await emailService.sendOTP(
      email, 
      name, 
      otp, 
      'Your PixelCyberZone Verification Code'
    );

    if (!emailResult.success) {
      res.status(500).json({ success: false, message: emailResult.message });
      return;
    }

    // Store OTP in database (remove any existing OTPs for this email first)
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'registration' });
    
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: 'registration',
      userData: {
        name: name.trim(),
        password // Will be hashed when user is created
      }
    });

    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp }: OTPRequest = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(), 
      type: 'registration',
      otp 
    });

    if (!otpRecord) {
      res.status(400).json({ success: false, message: 'Invalid code' });
      return;
    }

    if (!otpRecord.isValid()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      res.status(400).json({ success: false, message: 'Expired code' });
      return;
    }

    // Create the user
    const userData = otpRecord.userData;
    if (!userData?.name || !userData?.password) {
      res.status(400).json({ success: false, message: 'Invalid registration data' });
      return;
    }

    const newUser = await User.create({
      name: userData.name,
      email: email.toLowerCase(),
      password: userData.password,
      emailVerified: true
    });

    // Clean up the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(email, userData.name).catch(console.error);

    // Generate token and auto-login
    const token = generateToken(newUser._id.toString(), newUser.email, newUser.role);
    
    const response: AuthResponse = {
      success: true,
      token,
      user: formatUserResponse(newUser)
    };

    res.json(response);
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: { email: string } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const existingOTP = await OTP.findOne({ 
      email: email.toLowerCase(), 
      type: 'registration' 
    });

    if (!existingOTP) {
      res.status(400).json({ success: false, message: 'No registration attempt found' });
      return;
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const emailResult = await emailService.sendOTP(
      email, 
      existingOTP.userData?.name || 'User', 
      newOTP, 
      'Your New PixelCyberZone Verification Code'
    );

    if (!emailResult.success) {
      res.status(500).json({ success: false, message: emailResult.message });
      return;
    }

    // Update the OTP record
    existingOTP.otp = newOTP;
    existingOTP.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await existingOTP.save();

    res.json({ success: true, message: 'New verification code sent' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: { email: string } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Always return success to prevent email enumeration
      res.json({ success: true, message: 'If the email exists, a reset code has been sent' });
      return;
    }

    // Generate OTP and send email
    const otp = generateOTP();
    await emailService.sendOTP(
      email, 
      user.name, 
      otp, 
      'Your PixelCyberZone Password Reset Code'
    );

    // Remove any existing password reset OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'password_reset' });

    // Store new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: 'password_reset'
    });

    res.json({ success: true, message: 'If the email exists, a reset code has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword }: ResetPasswordRequest = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      return;
    }

    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(), 
      type: 'password_reset',
      otp 
    });

    if (!otpRecord) {
      res.status(400).json({ success: false, message: 'Invalid code' });
      return;
    }

    if (!otpRecord.isValid()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      res.status(400).json({ success: false, message: 'Expired code' });
      return;
    }

    // Update user password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.password = newPassword; // Will be automatically hashed by pre-save hook
    await user.save();

    // Clean up the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, avatar } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
