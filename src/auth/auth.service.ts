// auth/services/auth.service.ts
import { 
  Injectable, 
  UnauthorizedException, 
  NotFoundException, 
  Logger,
  InternalServerErrorException 
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { TwoFactorService } from "./two-factor.service";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  /**
   * Login avec support 2FA
   * Retourne soit le token JWT, soit une demande de 2FA
   */
  async login(email: string, password: string) {
    try {
      // Validation des entrées
      if (!email || !password) {
        throw new UnauthorizedException("Email et mot de passe requis");
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      // Validation du format de l'email
      if (!this.isValidEmail(normalizedEmail)) {
        throw new UnauthorizedException("Format d'email invalide");
      }

      // Recherche de l'utilisateur
      const user = await this.findUserByEmail(normalizedEmail);
      
      // Vérification du mot de passe
      await this.validatePassword(normalizedPassword, user.passwordHash);

      // Vérifier si la 2FA est activée
      const is2FAEnabled = await this.twoFactorService.isTwoFactorEnabled(user.id);

      // Si 2FA activée → retourner userId pour la deuxième étape
      if (is2FAEnabled) {
        this.logger.log(`2FA required for user ${user.email}`);
        return {
          requiresTwoFactor: true,
          userId: user.id,
          message: "Code 2FA requis",
        };
      }

      // Pas de 2FA → générer le token directement
      const updatedUser = await this.updateLastLogin(user.id);

      // Génération du token JWT
      const payload: JwtPayload = {
        sub: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      };

      const accessToken = await this.jwt.signAsync(payload);

      this.logger.log(`User ${updatedUser.email} logged in successfully`);

      return {
        accessToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          avatar: updatedUser.avatar ?? undefined,
          phone: updatedUser.phone ?? undefined,
          twoFactorEnabled: updatedUser.twoFactorEnabled,
          createdAt: updatedUser.createdAt,
          lastLogin: updatedUser.lastLogin,
        },
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Login attempt failed for email: ${email}`, errorMessage);
      
      if (error instanceof UnauthorizedException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException("Erreur d'authentification");
    }
  }

  /**
   * Valide un utilisateur (email + mot de passe)
   * Utilisé par le contrôleur pour la première étape du login
   */
  async validateUser(email: string, password: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      const user = await this.prisma.adminUser.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          phone: true,
          status: true,
          twoFactorEnabled: true,
          passwordHash: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      if (!user) return null;
      if (user.status !== "active") return null;

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) return null;

      // Retourner l'utilisateur sans le mot de passe hashé
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(`Error validating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Génère un token JWT pour un utilisateur
   */
  async generateToken(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwt.signAsync(payload);
  }

  /**
   * Vérifie et valide un code 2FA
   */
  async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    return this.twoFactorService.verifyTwoFactor(userId, code);
  }

  /**
   * Vérifie si la 2FA est activée pour un utilisateur
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    return this.twoFactorService.isTwoFactorEnabled(userId);
  }

  private async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.adminUser.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException("Identifiants invalides");
      }

      if (user.status !== "active") {
        throw new UnauthorizedException("Compte désactivé");
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la récupération de l'utilisateur");
    }
  }

  private async validatePassword(plainPassword: string, hashedPassword: string) {
    try {
      const isPasswordValid = await bcrypt.compare(plainPassword, hashedPassword);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException("Identifiants invalides");
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur de validation du mot de passe");
    }
  }

  private async updateLastLogin(userId: string) {
    try {
      const now = new Date();
      return await this.prisma.adminUser.update({
        where: { id: userId },
        data: { lastLogin: now },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error(`Failed to update last login for user ${userId}`, errorMessage);
      throw new InternalServerErrorException("Erreur de mise à jour de la connexion");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}