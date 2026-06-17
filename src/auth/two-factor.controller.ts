// auth/controllers/two-factor.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFactorService } from './two-factor.service';
import { AuthService } from './auth.service';
import {
  EnableTwoFactorDto,
  VerifyTwoFactorDto,
  DisableTwoFactorDto,
  RegenerateBackupCodesDto,
  TwoFactorSetupResponseDto,
  TwoFactorEnableResponseDto,
  TwoFactorVerifyResponseDto,
  TwoFactorDisableResponseDto,
  TwoFactorStatusResponseDto,
} from './dto/two-factor.dto';
import { Public } from '../common/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth/2fa')
export class TwoFactorController {
  constructor(
    private readonly twoFactorService: TwoFactorService,
    private readonly authService: AuthService, // ✅ Injecter AuthService
  ) {}

  /**
   * POST /auth/2fa/setup
   * Génère la configuration 2FA (secret, QR code, codes de secours)
   */
  @UseGuards(JwtAuthGuard)
  @Post('setup')
  async setupTwoFactor(@Request() req: any): Promise<TwoFactorSetupResponseDto> {
    return this.twoFactorService.generateTwoFactorSetup(req.user.id);
  }

  /**
   * POST /auth/2fa/enable
   * Active la 2FA après vérification du code
   */
  @UseGuards(JwtAuthGuard)
  @Post('enable')
  async enableTwoFactor(
    @Request() req: any,
    @Body(ValidationPipe) body: { code: string; secret: string }
  ): Promise<TwoFactorEnableResponseDto> {
    return this.twoFactorService.enableTwoFactor(req.user.id, body.code, body.secret);
  }

  /**
   * POST /auth/2fa/verify
   * Vérifie un code 2FA et génère un token si valide
   */
  @Public()
  @Post('verify')
  async verifyTwoFactor(
    @Body(ValidationPipe) dto: VerifyTwoFactorDto
  ): Promise<TwoFactorVerifyResponseDto> {
    // 1. Vérifier le code 2FA
    const isValid = await this.twoFactorService.verifyTwoFactor(dto.userId, dto.code);
    
    if (!isValid) {
      return { 
        valid: false, 
        message: 'Code 2FA invalide' 
      };
    }

    // 2. Récupérer l'utilisateur
    const user = await this.twoFactorService['prisma'].adminUser.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      return { 
        valid: false, 
        message: 'Utilisateur non trouvé' 
      };
    }

    // 3. Générer le token JWT
    const accessToken = await this.authService.generateToken(user);

    // 4. Mettre à jour la dernière connexion
    await this.twoFactorService['prisma'].adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      valid: true,
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

  /**
   * POST /auth/2fa/disable
   * Désactive la 2FA après vérification du code
   */
  @UseGuards(JwtAuthGuard)
  @Post('disable')
  async disableTwoFactor(
    @Request() req: any,
    @Body(ValidationPipe) body: { code: string }
  ): Promise<TwoFactorDisableResponseDto> {
    return this.twoFactorService.disableTwoFactor(req.user.id, body.code);
  }

  /**
   * POST /auth/2fa/regenerate-backup-codes
   * Régénère les codes de secours
   */
  @UseGuards(JwtAuthGuard)
  @Post('regenerate-backup-codes')
  async regenerateBackupCodes(
    @Request() req: any,
    @Body(ValidationPipe) body: { code: string }
  ): Promise<{ success: boolean; message: string; backupCodes: string[] }> {
    return this.twoFactorService.regenerateBackupCodes(req.user.id, body.code);
  }

  /**
   * GET /auth/2fa/status
   * Vérifie si la 2FA est activée pour l'utilisateur courant
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getTwoFactorStatus(@Request() req: any): Promise<TwoFactorStatusResponseDto> {
    const enabled = await this.twoFactorService.isTwoFactorEnabled(req.user.id);
    return { enabled };
  }
}