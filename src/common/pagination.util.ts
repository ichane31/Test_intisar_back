export function normalizePagination(page?: number, limit?: number) {
  const p = Math.max(1, page ?? 1);
  const l = Math.min(100, Math.max(1, limit ?? 20));
  return { page: p, limit: l, skip: (p - 1) * l };
}

export function listMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}

/** Prisma `createdAt` bounds from optional ISO date strings (inclusive `createdTo` day). */
export function createdAtBounds(createdFrom?: string, createdTo?: string) {
  if (!createdFrom && !createdTo) return undefined;
  const bounds: { gte?: Date; lte?: Date } = {};
  if (createdFrom) bounds.gte = new Date(createdFrom);
  if (createdTo) {
    const end = new Date(createdTo);
    end.setUTCHours(23, 59, 59, 999);
    bounds.lte = end;
  }
  return bounds;
}
