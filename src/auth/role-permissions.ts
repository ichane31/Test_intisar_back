/** Mirrors Intisar-admin `ROLE_PERMISSIONS` (types/admin.ts). */
export const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  SUPER_ADMIN: [
    'view_dashboard',
    'manage_content',
    'manage_offers',
    'edit_prices',
    'manage_shop',
    'manage_orders',
    'manage_clients',
    'manage_requests',
    'manage_media',
    'manage_documents',
    'view_history',
    'view_logs',
    'manage_settings',
    'manage_users',
    'manage_payments',
    'export_data',
  ],
  ADMIN: [
    'view_dashboard',
    'manage_content',
    'manage_offers',
    'manage_shop',
    'manage_orders',
    'manage_clients',
    'manage_requests',
    'manage_media',
    'view_history',
  ],
};

export type Permission =
  (typeof ROLE_PERMISSIONS)['SUPER_ADMIN'][number];
