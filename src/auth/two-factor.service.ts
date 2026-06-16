// auth/services/two-factor.service.ts
import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TwoFactorService {
  constructor(private readonly prisma: PrismaService) {}

  async generateTwoFactorSetup(userId: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (user.twoFactorEnabled) {
      throw new ConflictException('La 2FA est déjà activée');
    }

    // Générer le secret
    const secret = speakeasy.generateSecret({
      name: `Intisar (${user.email})`,
      length: 20,
    });

    // Générer le QR code
    const otpauthUrl = secret.otpauth_url!;
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Générer 10 codes de secours
    const backupCodes = Array.from({ length: 10 }, () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    });

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  async enableTwoFactor(userId: string, code: string, secret: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (user.twoFactorEnabled) {
      throw new ConflictException('La 2FA est déjà activée');
    }

    // Vérifier le code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Code invalide');
    }

    // Générer 10 codes de secours
    const backupCodes = Array.from({ length: 10 }, () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    });

    // Activer la 2FA
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      },
    });

    return {
      success: true,
      message: '2FA activée avec succès',
      backupCodes,
    };
  }

  async verifyTwoFactor(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      return false;
    }

    // Vérifier si c'est un code de secours
    if (user.twoFactorBackupCodes) {
      const backupCodes = JSON.parse(user.twoFactorBackupCodes);
      const codeIndex = backupCodes.indexOf(code);
      if (codeIndex !== -1) {
        // Supprimer le code utilisé
        backupCodes.splice(codeIndex, 1);
        await this.prisma.adminUser.update({
          where: { id: userId },
          data: {
            twoFactorBackupCodes: JSON.stringify(backupCodes),
          },
        });
        return true;
      }
    }

    // Vérifier le code TOTP
    return speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: code,
      window: 1,
    });
  }

  async disableTwoFactor(userId: string, code: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (!user.twoFactorEnabled) {
      throw new ConflictException('La 2FA n\'est pas activée');
    }

    // Vérifier le code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Code invalide');
    }

    await this.prisma.adminUser.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    });

    return {
      success: true,
      message: '2FA désactivée avec succès',
    };
  }

  async regenerateBackupCodes(userId: string, code: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (!user.twoFactorEnabled) {
      throw new ConflictException('La 2FA n\'est pas activée');
    }

    // Vérifier le code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Code invalide');
    }

    const backupCodes = Array.from({ length: 10 }, () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    });

    await this.prisma.adminUser.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      },
    });

    return {
      success: true,
      message: 'Codes de secours régénérés',
      backupCodes,
    };
  }

  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });
    return user?.twoFactorEnabled || false;
  }
}