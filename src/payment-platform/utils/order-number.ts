import { randomBytes } from 'crypto';

export function generatePaymentOrderNumber(): string {
  const y = new Date().getUTCFullYear();
  const r = randomBytes(4).toString('hex').toUpperCase();
  return `INT-PAY-${y}-${r}`;
}

export function generateInvoiceNumber(): string {
  const y = new Date().getUTCFullYear();
  const r = randomBytes(4).toString('hex').toUpperCase();
  return `INT-FAC-${y}-${r}`;
}
