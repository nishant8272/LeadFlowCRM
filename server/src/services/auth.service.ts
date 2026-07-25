import bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { CustomError } from '../utils/CustomError';
import { IUserDocument } from '../types/user.types';

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    return await this.userService.createUser(userData);
  }

  async login(
    email: string,
    password?: string
  ): Promise<{ user: IUserDocument; accessToken: string; refreshToken: string }> {
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    const user = await this.userService.getUserByEmail(email);
    if (!user || !user.isActive) {
      throw new CustomError('Invalid credentials or inactive account', 401);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Generate tokens
    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { user, accessToken, refreshToken };
  }

  async refresh(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string; user: IUserDocument }> {
    if (!token) {
      throw new CustomError('Refresh token is required', 401);
    }

    try {
      const decoded = verifyRefreshToken(token);
      const user = await this.userService.getUserById(decoded.userId);

      if (!user || !user.isActive) {
        throw new CustomError('User is suspended or does not exist', 401);
      }

      const payload = { userId: user.id, role: user.role };
      const accessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      return { accessToken, refreshToken: newRefreshToken, user };
    } catch (error) {
      throw new CustomError('Invalid or expired refresh token', 401);
    }
  }
}
