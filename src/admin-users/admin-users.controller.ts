// admin-users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { CreateAdminUserDto, UpdateAdminUserDto, UpdateProfileDto, ChangePasswordDto } from './dto/admin-user.dto';
import { AdminUsersService } from './admin-users.service';

@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  // Profile routes (spécifiques)
  @Get('profile/me')
  getProfile(@Request() req: any) {
    return this.service.findOne(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.service.updateProfile(req.user.id, dto);
  }

  @Post('profile/change-password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.service.changePassword(req.user.id, dto);
  }
  
  @Patch('profile/email')
async updateEmail(@Request() req: any, @Body() body: { newEmail: string; password: string }) {
  return this.service.updateEmail(req.user.id, body.newEmail, body.password);
}
  @Get()
  @Permissions('manage_users')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('manage_users')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('manage_users')
  create(@Body() dto: CreateAdminUserDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Permissions('manage_users')
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('manage_users')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}