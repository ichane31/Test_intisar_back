/** Statut commande commerce (payment platform). */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Statut agrégé paiement sur la commande. */
export const ORDER_PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIAL: 'partial',
} as const;
export type OrderPaymentStatus =
  (typeof ORDER_PAYMENT_STATUS)[keyof typeof ORDER_PAYMENT_STATUS];

/** Statut d’un enregistrement Payment (tentative PSP). */
export const PAYMENT_RECORD_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIAL: 'partial',
} as const;

/** Mode de règlement demandé (acompte / total / solde). */
export const PAYABLE_MODE = {
  FULL: 'full',
  DEPOSIT: 'deposit',
  BALANCE: 'balance',
} as const;

export const PAYMENT_PROVIDER_CODE = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  CMI: 'cmi',
} as const;
export type PaymentProviderCode =
  (typeof PAYMENT_PROVIDER_CODE)[keyof typeof PAYMENT_PROVIDER_CODE];

export const TRANSACTION_TYPE = {
  AUTH: 'auth',
  CAPTURE: 'capture',
  REFUND: 'refund',
  VOID: 'void',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;
