import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { UserRole } from '@cannaroute/shared';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: UserRole;
    state_code?: string;
  }): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = this.userRepo.create({
      email: data.email.toLowerCase().trim(),
      password_hash,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone ?? null,
      role: data.role,
      state_code: data.state_code ?? null,
    });

    return this.userRepo.save(user);
  }

  // ─── Find ─────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    // addSelect pulls password_hash back in — it's excluded from default selects
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .getOne();
  }

  // ─── Verify password ──────────────────────────────────────────────────────

  async verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, { last_login_at: new Date() });
  }

  async setAgeVerified(id: string, dob: Date): Promise<void> {
    await this.userRepo.update(id, {
      age_verified: true,
      age_verified_at: new Date(),
      dob,
    });
  }

  async setMedicalCard(
    id: string,
    data: {
      card_number: string;
      card_state: string;
      card_expiry: Date;
      verified: boolean;
    },
  ): Promise<void> {
    await this.userRepo.update(id, {
      is_medical: true,
      medical_card_number: data.card_number,
      medical_card_state: data.card_state,
      medical_card_expiry: data.card_expiry,
      medical_verified: data.verified,
    });
  }

  async updateProfile(
    id: string,
    data: Partial<Pick<User, 'first_name' | 'last_name' | 'phone'>>,
  ): Promise<User> {
    await this.userRepo.update(id, data);
    return this.findById(id);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.userRepo.update(id, { password_hash });
  }
}
