import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { IUserDocument } from '../types/user.types';
import { CustomError } from '../utils/CustomError';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    if (!userData.email || !userData.password || !userData.name) {
      throw new CustomError('Name, email and password are required', 400);
    }

    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new CustomError('User with this email already exists', 400);
    }

    // Auto-promote first user to ADMIN as a bootstrap helper, otherwise default to role or MEMBER
    const allUsers = await this.userRepository.findAll();
    const role = allUsers.length === 0 ? 'ADMIN' : (userData.role || 'MEMBER');

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role,
    });
  }

  async getUserById(id: string): Promise<IUserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getAllUsers(filter: any = {}): Promise<IUserDocument[]> {
    return await this.userRepository.findAll(filter);
  }

  async updateUser(id: string, updateData: Partial<IUserDocument>): Promise<IUserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.userRepository.findByEmail(updateData.email);
      if (emailExists) {
        throw new CustomError('Email is already in use by another user', 400);
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new CustomError('Failed to update user', 500);
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    await this.userRepository.delete(id);
  }
}
