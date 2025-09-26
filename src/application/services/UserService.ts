import { UserEntity, UserMetadata } from '../../domain/entities/UserEntity';
import jwt from 'jsonwebtoken';

export interface UserStoragePort {
  saveUser(metadata: UserMetadata): Promise<UserMetadata>;
  findUserByEmail(email: string): Promise<UserMetadata | null>;
  findUserByNumberId(numberId: string): Promise<UserMetadata | null>;
  validateUserCredentials(email: string, password: string): Promise<UserMetadata | null>;
}

export class UserService {
  constructor(private readonly userStorage: UserStoragePort) {}

  async registerUser(userData: Omit<UserMetadata, 'createdAt'>): Promise<UserEntity> {
    // Create and validate user entity
    const userEntity = UserEntity.create(userData);
    if (!userEntity.validate()) {
      throw new Error('Invalid user data');
    }

    // Check if user already exists
    const existingUserByEmail = await this.userStorage.findUserByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('Email already registered');
    }

    const existingUserByNumberId = await this.userStorage.findUserByNumberId(userData.number_id);
    if (existingUserByNumberId) {
      throw new Error('ID number already registered');
    }

    // Save user
    const savedMetadata = await this.userStorage.saveUser(userEntity.getMetadata());
    return new UserEntity(savedMetadata);
  }

  async loginUser(email: string, password: string): Promise<{ user: UserMetadata; token: string }> {
    const user = await this.userStorage.validateUserCredentials(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.number_id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return { user, token };
  }
}