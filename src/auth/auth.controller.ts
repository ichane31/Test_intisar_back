// auth/controllers/auth.controller.ts
import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, type JwtUser } from '../common/current-user.decorator';
import { Public } from '../common/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ROLE_PERMISSIONS } from './role-permissions';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-2fa')
  async verifyTwoFactor(@Body() body: { userId: string; code: string }) {
    const { userId, code } = body;

    if (!userId || !code) {
      throw new UnauthorizedException('UserId et code requis');
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new UnauthorizedException('Le code doit contenir 6 chiffres');
    }

    // Vérifier le code 2FA
    const isValid = await this.auth.verifyTwoFactorCode(userId, code);
    if (!isValid) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    // Récupérer l'utilisateur
    const user = await this.auth['prisma'].adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Générer le token
    const accessToken = await this.auth.generateToken(user);

    // Mettre à jour la dernière connexion
    await this.auth['prisma'].adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar ?? undefined,
        phone: user.phone ?? undefined,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  // @Get('me')
  // me(@CurrentUser() user: JwtUser | undefined) {
  //   if (!user) return { user: null };
  //   return {
  //     user: {
  //       ...user,
  //       permissions: [...(ROLE_PERMISSIONS[user.role] ?? [])],
  //     },
  //   };
  // }

  @Get('me')
  async me(@CurrentUser() user: JwtUser | undefined) {
    if (!user) return { user: null };
    
    // Récupérer l'utilisateur complet avec toutes les informations
    const fullUser = await this.auth['prisma'].adminUser.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        twoFactorEnabled: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        updatedAt: true,
      },
    });

    if (!fullUser) {
      return { user: null };
    }

    return {
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        avatar: fullUser.avatar ?? undefined,
        phone: fullUser.phone ?? undefined,
        twoFactorEnabled: fullUser.twoFactorEnabled,
        status: fullUser.status,
        createdAt: fullUser.createdAt,
        lastLogin: fullUser.lastLogin,
        updatedAt: fullUser.updatedAt,
        permissions: [...(ROLE_PERMISSIONS[fullUser.role] ?? [])],
      },
    };
  }
}