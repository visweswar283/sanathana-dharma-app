import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import type { User } from '../../models/User';
import { AppError } from '../../utils/errors';

class UserStore {
  private readonly byId = new Map<string, User>();
  private readonly byEmail = new Map<string, User>();

  async create(email: string, displayName: string, password: string): Promise<User> {
    if (this.byEmail.has(email.toLowerCase())) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      displayName,
      passwordHash,
      createdAt: new Date(),
      preferredDeityId: 'hanuma',
    };

    this.byId.set(user.id, user);
    this.byEmail.set(user.email, user);
    return user;
  }

  async verifyCredentials(email: string, password: string): Promise<User> {
    const user = this.byEmail.get(email.toLowerCase());
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    return user;
  }

  getById(id: string): User | undefined {
    return this.byId.get(id);
  }
}

export const userStore = new UserStore();
