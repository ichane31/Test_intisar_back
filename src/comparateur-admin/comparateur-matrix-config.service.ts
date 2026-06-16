import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { defaultComparateurMatrixPayload } from './comparateur-matrix-config.defaults';
import type {
  PatchComparateurMatrixConfigDto,
  ReplaceComparateurMatrixConfigDto,
} from './dto/comparateur-matrix-config.dto';

const DEFAULT_KEY = 'default';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function deepMerge(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const cv = out[key];
    if (isPlainObject(pv) && isPlainObject(cv)) {
      out[key] = deepMerge(cv, pv);
    } else {
      out[key] = pv;
    }
  }
  return out;
}

@Injectable()
export class ComparateurMatrixConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let row = await this.prisma.comparateurMatrixConfig.findUnique({
      where: { key: DEFAULT_KEY },
    });
    if (!row) {
      row = await this.prisma.comparateurMatrixConfig.create({
        data: {
          key: DEFAULT_KEY,
          payload: defaultComparateurMatrixPayload(),
        },
      });
    }
    return row;
  }

  async replace(dto: ReplaceComparateurMatrixConfigDto, updatedBy?: string) {
    const current = await this.get();
    return this.prisma.comparateurMatrixConfig.update({
      where: { id: current.id },
      data: {
        payload: dto.payload as Prisma.InputJsonValue,
        updatedBy: updatedBy ?? null,
      },
    });
  }

  async merge(dto: PatchComparateurMatrixConfigDto, updatedBy?: string) {
    const current = await this.get();
    const base = current.payload as Record<string, unknown>;
    const merged = deepMerge(base, dto.payload);
    return this.prisma.comparateurMatrixConfig.update({
      where: { id: current.id },
      data: {
        payload: merged as Prisma.InputJsonValue,
        updatedBy: updatedBy ?? null,
      },
    });
  }
}
