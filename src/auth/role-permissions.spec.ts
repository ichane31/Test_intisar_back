import { ROLE_PERMISSIONS } from './role-permissions';

describe('ROLE_PERMISSIONS', () => {
  it('SUPER_ADMIN includes manage_users', () => {
    expect(ROLE_PERMISSIONS.SUPER_ADMIN).toContain('manage_users');
  });

  it('ADMIN does not include manage_users', () => {
    expect(ROLE_PERMISSIONS.ADMIN).not.toContain('manage_users');
  });

  it('ADMIN includes manage_offers', () => {
    expect(ROLE_PERMISSIONS.ADMIN).toContain('manage_offers');
  });
});
