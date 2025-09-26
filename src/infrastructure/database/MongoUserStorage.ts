import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserMetadata, UserEntity } from '../../domain/entities/UserEntity';
import { UserStoragePort } from '../../application/services/UserService';

const userSchema = new mongoose.Schema({
  type_id: { type: Number, required: true },
  number_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  second_name: { type: String },
  last_name: { type: String, required: true },
  second_last: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cellphone: { type: String, required: true },
  type_user: { type: String, required: false },
  locate_district: { type: String, required: true },
  gender: { type: String, required: true },
  birthday: { type: String, required: true },
  programa: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', userSchema);

export class MongoUserStorage implements UserStoragePort {
  async saveUser(metadata: UserMetadata): Promise<UserMetadata> {
    const hashedPassword = await bcrypt.hash(metadata.password, 10);
    const user = new UserModel({
      ...metadata,
      password: hashedPassword
    });
    const savedUser = await user.save();
    const userObject = savedUser.toObject() as Record<string, any>;
    if ('password' in userObject) {
      delete userObject.password;
    }
    return userObject as UserMetadata;
  }

  async findUserByEmail(email: string): Promise<UserMetadata | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    const userObject = user.toObject() as Record<string, any>;
    if ('password' in userObject) {
      delete userObject.password;
    }
    return userObject as UserMetadata;
  }

  async validateUserCredentials(email: string, password: string): Promise<UserMetadata | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    const userObject = user.toObject() as Record<string, any>;
    if ('password' in userObject) {
      delete userObject.password;
    }
    return userObject as UserMetadata;
  }

  async findUserByNumberId(numberId: string): Promise<UserMetadata | null> {
    const user = await UserModel.findOne({ number_id: numberId });
    return user ? user.toObject() as UserMetadata : null;
  }
}