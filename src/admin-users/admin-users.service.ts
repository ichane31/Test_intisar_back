// admin-users.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dto/admin-user.dto';

function toPublic(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  status: string;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar ?? undefined,
    phone: user.phone ?? undefined,
    status: user.status,
    lastLogin: user.lastLogin ?? undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async findAll() {
    const rows = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toPublic);
  }

  async findOne(id: string) {
    const row = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('User not found');
    return toPublic(row);
  }

  async findByEmail(email: string) {
    return this.prisma.adminUser.findUnique({ where: { email } });
  }

  async create(dto: CreateAdminUserDto) {
    try {
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const row = await this.prisma.adminUser.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.name,
          role: dto.role,
          avatar: dto.avatar,
          phone: dto.phone,
          status: dto.status ?? 'active',
        },
      });
      return toPublic(row);
    } catch {
      throw new ConflictException('Email already in use');
    }
  }

  async update(id: string, dto: UpdateAdminUserDto) {
    await this.findOne(id);
    const { password, ...rest } = dto;
    try {
      const data: {
        email?: string;
        name?: string;
        role?: string;
        avatar?: string | null;
        phone?: string | null;
        status?: string;
        passwordHash?: string;
      } = { ...rest };
      if (password) {
        data.passwordHash = await bcrypt.hash(password, 12);
      }
      const row = await this.prisma.adminUser.update({
        where: { id },
        data,
      });
      return toPublic(row);
    } catch {
      throw new ConflictException('Email already in use');
    }
  }

async updateProfile(userId: string, dto: UpdateProfileDto) {
  const user = await this.prisma.adminUser.findUnique({ 
    where: { id: userId } 
  });
  
  if (!user) throw new NotFoundException('User not found');

  const row = await this.prisma.adminUser.update({
    where: { id: userId },
    data: {
      name: dto.name !== undefined ? dto.name : user.name,
      phone: dto.phone !== undefined ? dto.phone : user.phone,
      avatar: dto.avatar !== undefined ? dto.avatar : user.avatar,
    },
  });
  return toPublic(row);
}
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true, message: 'Mot de passe mis à jour' };
  }

  // admin-users.service.ts
async updateEmail(userId: string, newEmail: string, password: string) {
  const user = await this.prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Mot de passe incorrect');
  }

  // Vérifier que l'email n'est pas déjà utilisé
  const existingUser = await this.prisma.adminUser.findUnique({
    where: { email: newEmail },
  });
  if (existingUser) {
    throw new ConflictException('Cet email est déjà utilisé');
  }

  const updated = await this.prisma.adminUser.update({
    where: { id: userId },
    data: { email: newEmail },
  });

  return toPublic(updated);
}

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.adminUser.delete({ where: { id } });
    return { success: true };
  }
}
