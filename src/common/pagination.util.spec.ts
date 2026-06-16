import { listMeta, normalizePagination } from './pagination.util';

describe('pagination.util', () => {
  it('normalizePagination defaults page and limit', () => {
    expect(normalizePagination(undefined, undefined)).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
    });
  });

  it('normalizePagination caps limit at 100', () => {
    expect(normalizePagination(1, 500)).toEqual({
      page: 1,
      limit: 100,
      skip: 0,
    });
  });

  it('listMeta computes totalPages', () => {
    expect(listMeta(25, 1, 10)).toEqual({
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    });
  });

  it('listMeta zero total', () => {
    expect(listMeta(0, 1, 20).totalPages).toBe(0);
  });
});
