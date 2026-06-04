import { Injectable, UnauthorizedException, ConflictException, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RoleRequest, RoleRequestStatus } from '../entities/role-request.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(RoleRequest)
    private readonly roleRequestRepository: Repository<RoleRequest>,
    private readonly jwtService: JwtService,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('REPORTING_SERVICE')
    private readonly reportingClient: ClientProxy,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Security: Public registration can only create USER role
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.USER, // Always USER for public signup
    });

    const savedUser = await this.userRepository.save(user);

    // Audit log
    this.emitAuditEvent('audit.user_created', {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      performedBy: 'self-registration',
      performedByEmail: savedUser.email,
    });

    // Emit user.created event
    this.notificationClient.emit('user.created', {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
    });

    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User account does not exist');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been disabled. Contact administrator.');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: storedToken.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old refresh token
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiresAt = expiresAt;
    await this.userRepository.save(user);

    // Emit password reset event
    this.notificationClient.emit('password.reset.requested', {
      userId: user.id,
      email: user.email,
      resetToken,
      firstName: user.firstName,
    });

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { resetToken: token } });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    if (newPassword.length < 6) {
      throw new ConflictException('Password must be at least 6 characters');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null as any;
    user.resetTokenExpiresAt = null as any;
    await this.userRepository.save(user);

    // Audit log
    this.emitAuditEvent('audit.password_reset', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      performedBy: user.id,
      performedByEmail: user.email,
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new ConflictException('New password must be at least 6 characters');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    // Audit log
    this.emitAuditEvent('audit.password_changed', {
      userId,
      email: user.email,
      firstName: user.firstName,
      performedBy: user.id,
      performedByEmail: user.email,
    });

    return { message: 'Password updated successfully' };
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; department?: string; address?: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, data);
    const saved = await this.userRepository.save(user);

    // Audit log
    this.emitAuditEvent('audit.user_updated', {
      userId,
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      performedBy: user.id,
      performedByEmail: user.email,
    });

    return this.sanitizeUser(saved);
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async createPrivilegedUser(createDto: RegisterDto, creatorRole: string) {
    // Only admins can create admins/inspectors/technicians
    if (!['admin'].includes(creatorRole)) {
      throw new UnauthorizedException('Only admins can create privileged users');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: createDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const user = this.userRepository.create({
      ...createDto,
      password: hashedPassword,
      role: createDto.role || UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);

    // Audit log
    this.emitAuditEvent('audit.user_created', {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      performedBy: 'admin-privileged',
      performedByEmail: 'admin@system',
    });

    this.notificationClient.emit('user.created', {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
    });

    return this.sanitizeUser(savedUser);
  }

  async getInspectors() {
    return this.userRepository.find({
      where: [
        { role: UserRole.INSPECTOR, isActive: true },
      ],
      select: ['id', 'firstName', 'lastName', 'email', 'role'],
      order: { firstName: 'ASC' },
    });
  }

  async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('u');

    if (search) {
      queryBuilder.where(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .select(['u.id', 'u.email', 'u.firstName', 'u.lastName', 'u.role', 'u.isActive', 'u.createdAt', 'u.updatedAt'])
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async changeRole(userId: string, newRole: UserRole, reason?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldRole = user.role;
    user.role = newRole;
    const saved = await this.userRepository.save(user);

    // Audit log
    this.emitAuditEvent('audit.role_changed', {
      userId: saved.id,
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      oldRole,
      newRole,
      reason,
      performedBy: 'admin',
      performedByEmail: 'admin@system',
    });

    // Emit role changed event for notification service
    this.notificationClient.emit('user.role_changed', {
      userId: saved.id,
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      oldRole,
      newRole,
      reason,
    });

    return this.sanitizeUser(saved);
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = isActive;
    await this.userRepository.save(user);

    // Audit log
    this.emitAuditEvent('audit.user_status_changed', {
      userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive,
      performedBy: 'admin',
      performedByEmail: 'admin@system',
    });

    return this.sanitizeUser(user);
  }

  // ── Role Requests ────────────────────────────────────────────────

  async createRoleRequest(userId: string, requestedRole: UserRole, reason?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check for existing pending request
    const existing = await this.roleRequestRepository.findOne({
      where: { userId, status: RoleRequestStatus.PENDING },
    });
    if (existing) {
      throw new ConflictException('You already have a pending role request');
    }

    const request = this.roleRequestRepository.create({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currentRole: user.role,
      requestedRole,
      reason,
      status: RoleRequestStatus.PENDING,
    });

    const saved = await this.roleRequestRepository.save(request);

    // Notify admins
    this.notificationClient.emit('role.request.created', {
      requestId: saved.id,
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currentRole: user.role,
      requestedRole,
      reason,
    });

    return saved;
  }

  async getRoleRequests(status?: RoleRequestStatus) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.roleRequestRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
    });

    return { data, meta: { total } };
  }

  async getMyRoleRequests(userId: string) {
    const [data, total] = await this.roleRequestRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return { data, meta: { total } };
  }

  async approveRoleRequest(requestId: string, adminId: string, reviewNote?: string) {
    const request = await this.roleRequestRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Role request not found');
    if (request.status !== RoleRequestStatus.PENDING) {
      throw new ConflictException('Request is already processed');
    }

    request.status = RoleRequestStatus.APPROVED;
    request.reviewedBy = adminId;
    request.reviewNote = reviewNote;
    const saved = await this.roleRequestRepository.save(request);

    // Update user role
    await this.changeRole(request.userId, request.requestedRole as UserRole, `Approved via role request ${requestId}`);

    // Notify user
    this.notificationClient.emit('role.request.approved', {
      requestId: saved.id,
      userId: request.userId,
      email: request.email,
      firstName: request.firstName,
      newRole: request.requestedRole,
      reviewNote,
    });

    return saved;
  }

  async rejectRoleRequest(requestId: string, adminId: string, reviewNote?: string) {
    const request = await this.roleRequestRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Role request not found');
    if (request.status !== RoleRequestStatus.PENDING) {
      throw new ConflictException('Request is already processed');
    }

    request.status = RoleRequestStatus.REJECTED;
    request.reviewedBy = adminId;
    request.reviewNote = reviewNote;
    const saved = await this.roleRequestRepository.save(request);

    // Notify user
    this.notificationClient.emit('role.request.rejected', {
      requestId: saved.id,
      userId: request.userId,
      email: request.email,
      firstName: request.firstName,
      requestedRole: request.requestedRole,
      reviewNote,
    });

    return saved;
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) return null;
      return this.sanitizeUser(user);
    } catch {
      return null;
    }
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.save({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private emitAuditEvent(eventPattern: string, data: any) {
    try {
      this.reportingClient.emit(eventPattern, data);
    } catch {
      // Silent fail — audit logging should not break main operations
    }
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
