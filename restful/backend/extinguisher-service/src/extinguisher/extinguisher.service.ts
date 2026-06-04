import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { FireExtinguisher, ExtinguisherStatus } from '../entities/fire-extinguisher.entity';
import { CreateExtinguisherDto } from './dto/create-extinguisher.dto';
import { UpdateExtinguisherDto } from './dto/update-extinguisher.dto';
import { FilterExtinguisherDto } from './dto/filter-extinguisher.dto';

@Injectable()
export class ExtinguisherService {
  constructor(
    @InjectRepository(FireExtinguisher)
    private readonly extinguisherRepository: Repository<FireExtinguisher>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('REPORTING_SERVICE')
    private readonly reportingClient: ClientProxy,
  ) {}

  async create(createDto: CreateExtinguisherDto) {
    const existing = await this.extinguisherRepository.findOne({
      where: { serialNumber: createDto.serialNumber },
    });

    if (existing) {
      throw new ConflictException('Extinguisher with this serial number already exists');
    }

    const extinguisher = this.extinguisherRepository.create(createDto);
    const saved = await this.extinguisherRepository.save(extinguisher);

    // Emit event
    this.notificationClient.emit('extinguisher.registered', {
      id: saved.id,
      serialNumber: saved.serialNumber,
      type: saved.type,
      location: saved.location,
    });

    return saved;
  }

  async findAll(filterDto: FilterExtinguisherDto) {
    const { type, status, location, building, search, sortBy, sortOrder, page, limit } = filterDto;

    const queryBuilder = this.extinguisherRepository.createQueryBuilder('ext');

    if (type) queryBuilder.andWhere('ext.type = :type', { type });
    if (status) queryBuilder.andWhere('ext.status = :status', { status });
    if (location) queryBuilder.andWhere('ext.location ILIKE :location', { location: `%${location}%` });
    if (building) queryBuilder.andWhere('ext.building ILIKE :building', { building: `%${building}%` });
    if (search) {
      queryBuilder.andWhere(
        '(ext.serialNumber ILIKE :search OR ext.location ILIKE :search OR ext.manufacturer ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const currentPage = page || 1;
    const currentLimit = limit || 10;

    queryBuilder
      .orderBy(`ext.${sortBy || 'createdAt'}`, sortOrder || 'DESC')
      .skip((currentPage - 1) * currentLimit)
      .take(currentLimit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async findOne(id: string) {
    const extinguisher = await this.extinguisherRepository.findOne({ where: { id } });
    if (!extinguisher) {
      throw new NotFoundException(`Extinguisher with ID ${id} not found`);
    }
    return extinguisher;
  }

  async update(id: string, updateDto: UpdateExtinguisherDto) {
    const extinguisher = await this.findOne(id);
    Object.assign(extinguisher, updateDto);

    if (updateDto.status) {
      this.notificationClient.emit('extinguisher.status_changed', {
        id: extinguisher.id,
        serialNumber: extinguisher.serialNumber,
        newStatus: updateDto.status,
      });
    }

    return this.extinguisherRepository.save(extinguisher);
  }

  async remove(id: string) {
    const extinguisher = await this.findOne(id);
    await this.extinguisherRepository.remove(extinguisher);
    return { message: `Extinguisher ${id} deleted successfully` };
  }

  async getExpired() {
    return this.extinguisherRepository.find({
      where: { expiryDate: LessThan(new Date()) },
      order: { expiryDate: 'ASC' },
    });
  }

  async getSelectOptions() {
    return this.extinguisherRepository.find({
      select: ['id', 'serialNumber', 'location', 'status', 'type'],
      where: { status: ExtinguisherStatus.ACTIVE },
      order: { serialNumber: 'ASC' },
    });
  }

  async getStats() {
    const total = await this.extinguisherRepository.count();
    const active = await this.extinguisherRepository.count({ where: { status: ExtinguisherStatus.ACTIVE } });
    const expired = await this.extinguisherRepository.count({ where: { status: ExtinguisherStatus.EXPIRED } });
    const maintenance = await this.extinguisherRepository.count({ where: { status: ExtinguisherStatus.MAINTENANCE } });

    return { total, active, expired, maintenance };
  }
}
