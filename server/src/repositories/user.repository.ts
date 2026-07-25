import { User } from '../models/user.model';
import { IUserDocument } from '../types/user.types';

export class UserRepository {
  async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return await User.findById(id);
  }

  async findAll(filter: any = {}): Promise<IUserDocument[]> {
    return await User.find(filter).sort({ createdAt: -1 });
  }

  async update(id: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IUserDocument | null> {
    return await User.findByIdAndDelete(id);
  }
}
