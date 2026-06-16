import { BadRequestException } from '@nestjs/common';
import {
  assertContentLifecycleTransition,
  assertLeadStatusTransition,
  assertOrderStatusTransition,
} from './status-transitions';

describe('status-transitions', () => {
  it('allows no-op status', () => {
    expect(() =>
      assertLeadStatusTransition('new', undefined),
    ).not.toThrow();
    expect(() => assertLeadStatusTransition('new', 'new')).not.toThrow();
  });

  it('rejects invalid lead transition', () => {
    expect(() => assertLeadStatusTransition('new', 'converted')).toThrow(
      BadRequestException,
    );
  });

  it('allows valid lead transition', () => {
    expect(() =>
      assertLeadStatusTransition('new', 'contacted'),
    ).not.toThrow();
  });

  it('rejects invalid content lifecycle', () => {
    expect(() =>
      assertContentLifecycleTransition('archived', 'published'),
    ).toThrow(BadRequestException);
  });

  it('allows archived -> draft', () => {
    expect(() =>
      assertContentLifecycleTransition('archived', 'draft'),
    ).not.toThrow();
  });

  it('rejects invalid order status', () => {
    expect(() =>
      assertOrderStatusTransition('cancelled', 'pending'),
    ).toThrow(BadRequestException);
  });
});
