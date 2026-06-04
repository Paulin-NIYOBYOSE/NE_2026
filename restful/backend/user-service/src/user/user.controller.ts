import { Controller, Get, Put, Delete, Param, Body, Query, Patch } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.userService.findAll(page || 1, limit || 10, search);
  }

  @Get('inspectors')
  @ApiOperation({ summary: 'Get all active inspectors for dropdown' })
  async getInspectors() {
    return this.userService.getInspectors();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  async activate(@Param('id') id: string) {
    return this.userService.activate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // RabbitMQ Event — create profile when user registers
  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: any) {
    await this.userService.createProfile({
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'user',
      isActive: true,
    });
  }

  // RabbitMQ Message patterns
  @MessagePattern('user.find_one')
  async handleFindOne(@Payload() data: { id: string }) {
    return this.userService.findOne(data.id);
  }

  @MessagePattern('user.get_inspectors')
  async handleGetInspectors() {
    return this.userService.getInspectors();
  }
}
