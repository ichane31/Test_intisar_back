// auth/controllers/two-factor.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import {
  VerifyTwoFactorDto,
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
  constructor(private readonly twoFactorService: TwoFactorService) {}

  /**
   * POST /auth/2fa/setup
   * Génère la configuration 2FA (secret, QR code, codes de secours)
   * Nécessite une authentification JWT
   */
  @UseGuards(JwtAuthGuard)
  @Post('setup')
  async setupTwoFactor(@Request() req: any): Promise<TwoFactorSetupResponseDto> {
    return this.twoFactorService.generateTwoFactorSetup(req.user.id);
  }

  /**
   * POST /auth/2fa/enable
   * Active la 2FA après vérification du code
   * Nécessite une authentification JWT
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
   * Vérifie un code 2FA (pour login)
   * Accessible publiquement
   */
  @Public()
  @Post('verify')
  async verifyTwoFactor(
    @Body(ValidationPipe) dto: VerifyTwoFactorDto
  ): Promise<TwoFactorVerifyResponseDto> {
    const valid = await this.twoFactorService.verifyTwoFactor(dto.userId, dto.code);
    return { valid };
  }

  /**
   * POST /auth/2fa/disable
   * Désactive la 2FA après vérification du code
   * Nécessite une authentification JWT
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
   * Nécessite une authentification JWT
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
   * Nécessite une authentification JWT
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getTwoFactorStatus(@Request() req: any): Promise<TwoFactorStatusResponseDto> {
    const enabled = await this.twoFactorService.isTwoFactorEnabled(req.user.id);
    return { enabled };
  }
}