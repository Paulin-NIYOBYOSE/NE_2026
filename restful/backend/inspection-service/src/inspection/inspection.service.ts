import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Inspection, InspectionStatus } from '../entities/inspection.entity';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  async create(createDto: CreateInspectionDto) {
    // Check for scheduling conflicts
    const scheduledDate = new Date(createDto.scheduledDate);
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingInspection = await this.inspectionRepository.findOne({
      where: {
        inspectorId: createDto.inspectorId,
        scheduledDate: Between(startOfDay, endOfDay),
        status: InspectionStatus.SCHEDULED,
      },
    });

    if (existingInspection) {
      throw new ConflictException('Inspector already has an inspection scheduled for this date');
    }

    const inspection = this.inspectionRepository.create({
      ...createDto,
      scheduledDate,
    });

    const saved = await this.inspectionRepository.save(inspection);

    // Emit event
    this.notificationClient.emit('inspection.scheduled', {
      inspectionId: saved.id,
      extinguisherId: saved.extinguisherId,
      inspectorId: saved.inspectorId,
      scheduledDate: saved.scheduledDate,
    });

    return saved;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.inspectionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { scheduledDate: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const inspection = await this.inspectionRepository.findOne({ where: { id } });
    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }
    return inspection;
  }

  async update(id: string, updateDto: UpdateInspectionDto) {
    const inspection = await this.findOne(id);
    Object.assign(inspection, updateDto);

    if (updateDto.status === InspectionStatus.COMPLETED) {
      inspection.completedDate = new Date();
      this.notificationClient.emit('inspection.completed', {
        inspectionId: inspection.id,
        extinguisherId: inspection.extinguisherId,
        result: inspection.result,
      });
    }

    return this.inspectionRepository.save(inspection);
  }

  async cancel(id: string) {
    const inspection = await this.findOne(id);
    inspection.status = InspectionStatus.CANCELLED;
    this.notificationClient.emit('inspection.cancelled', {
      inspectionId: inspection.id,
      inspectorId: inspection.inspectorId,
    });
    return this.inspectionRepository.save(inspection);
  }

  async findByInspector(inspectorId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.inspectionRepository.findAndCount({
      where: { inspectorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { scheduledDate: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByExtinguisher(extinguisherId: string) {
    return this.inspectionRepository.find({
      where: { extinguisherId },
      order: { scheduledDate: 'DESC' },
    });
  }

  async getUpcoming(days: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.inspectionRepository.find({
      where: {
        scheduledDate: Between(now, futureDate),
        status: InspectionStatus.SCHEDULED,
      },
      order: { scheduledDate: 'ASC' },
    });
  }
}
