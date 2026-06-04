import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.userProfileRepository.createQueryBuilder('u');

    if (search) {
      queryBuilder.where(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.userProfileRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userProfileRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userProfileRepository.remove(user);
    return { message: `User ${id} deleted successfully` };
  }

  async createProfile(data: Partial<UserProfile>) {
    // Upsert — if profile exists, update; otherwise create
    const existing = await this.userProfileRepository.findOne({ where: { id: data.id } });
    if (existing) {
      Object.assign(existing, data);
      return this.userProfileRepository.save(existing);
    }
    const profile = this.userProfileRepository.create(data);
    return this.userProfileRepository.save(profile);
  }

  async deactivate(id: string) {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.userProfileRepository.save(user);
  }

  async activate(id: string) {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.userProfileRepository.save(user);
  }

  async getInspectors() {
    return this.userProfileRepository.find({
      where: { role: 'inspector', isActive: true },
      select: ['id', 'firstName', 'lastName', 'email', 'role'],
      order: { firstName: 'ASC' },
    });
  }
}
