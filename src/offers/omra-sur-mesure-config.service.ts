import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { defaultOmraSurMesurePayload } from './omra-sur-mesure-config.defaults';
import type {
  PatchOmraSurMesureConfigDto,
  ReplaceOmraSurMesureConfigDto,
} from './dto/omra-sur-mesure-config.dto';

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
export class OmraSurMesureConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let row = await this.prisma.omraSurMesureConfig.findUnique({
      where: { key: DEFAULT_KEY },
    });
    if (!row) {
      row = await this.prisma.omraSurMesureConfig.create({
        data: {
          key: DEFAULT_KEY,
          payload: defaultOmraSurMesurePayload(),
        },
      });
    }
    return row;
  }

  async replace(dto: ReplaceOmraSurMesureConfigDto, updatedBy?: string) {
    const current = await this.get();
    return this.prisma.omraSurMesureConfig.update({
      where: { id: current.id },
      data: {
        payload: dto.payload as Prisma.InputJsonValue,
        updatedBy: updatedBy ?? null,
      },
    });
  }

  async merge(dto: PatchOmraSurMesureConfigDto, updatedBy?: string) {
    const current = await this.get();
    const base = current.payload as Record<string, unknown>;
    const merged = deepMerge(base, dto.payload);
    return this.prisma.omraSurMesureConfig.update({
      where: { id: current.id },
      data: {
        payload: merged as Prisma.InputJsonValue,
        updatedBy: updatedBy ?? null,
      },
    });
  }
}
