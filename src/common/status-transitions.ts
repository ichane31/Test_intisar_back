import { BadRequestException } from '@nestjs/common';

/** doc/07 §5.1 ContentLifecycleStatus */
const CONTENT_LIFECYCLE: Record<string, readonly string[]> = {
  draft: ['published', 'archived'],
  published: ['draft', 'archived'],
  archived: ['draft'],
};

/** doc/07 §5.6 LeadStatus */
const LEAD_STATUS: Record<string, readonly string[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['converted', 'lost'],
  converted: [],
  lost: [],
};

/** doc/07 §5.3 CustomOfferStatus */
const CUSTOM_OFFER_STATUS: Record<string, readonly string[]> = {
  pending: ['quoted', 'rejected'],
  quoted: ['accepted', 'rejected', 'pending'],
  accepted: [],
  rejected: [],
};

/** doc/07 §5.4 OrderStatus (shop + omra logistics) */
const ORDER_STATUS: Record<string, readonly string[]> = {
  pending: ['confirmed', 'cancelled', 'refunded'],
  confirmed: ['cancelled', 'refunded'],
  cancelled: [],
  refunded: [],
};

/** doc/07 §5.4 ShopPaymentStatus */
const SHOP_PAYMENT_STATUS: Record<string, readonly string[]> = {
  pending: ['paid', 'failed', 'refunded'],
  paid: ['refunded'],
  failed: ['pending', 'refunded'],
  refunded: [],
};

/** doc/07 §5.5 OmraPaymentStatus */
const OMRA_PAYMENT_STATUS: Record<string, readonly string[]> = {
  pending: ['partial', 'paid', 'refunded'],
  partial: ['paid', 'refunded'],
  paid: ['refunded'],
  refunded: [],
};

/** doc/07 §5.7 RequestStatus */
const REQUEST_STATUS: Record<string, readonly string[]> = {
  new: ['in_progress', 'closed'],
  in_progress: ['completed', 'closed'],
  completed: ['closed'],
  closed: [],
};

/** doc/07 §5.8 OperationalDocumentStatus */
const OPERATIONAL_DOC_STATUS: Record<string, readonly string[]> = {
  pending: ['approved', 'rejected'],
  approved: [],
  rejected: [],
};

/** doc/07 §5.9 LibraryDocumentStatus */
const LIBRARY_DOC_STATUS: Record<string, readonly string[]> = {
  draft: ['active', 'archived'],
  active: ['draft', 'archived'],
  archived: ['draft'],
};

function assertTransition(
  domain: string,
  from: string,
  to: string | undefined,
  map: Record<string, readonly string[]>,
): void {
  if (to === undefined) return;
  if (from === to) return;
  const allowed = map[from];
  if (allowed === undefined) {
    return;
  }
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid ${domain} status transition: "${from}" → "${to}"`,
    );
  }
}

export function assertContentLifecycleTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('content lifecycle', from, to, CONTENT_LIFECYCLE);
}

export function assertLeadStatusTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('lead', from, to, LEAD_STATUS);
}

export function assertCustomOfferStatusTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('custom offer', from, to, CUSTOM_OFFER_STATUS);
}

export function assertOrderStatusTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('order', from, to, ORDER_STATUS);
}

export function assertShopPaymentStatusTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('shop payment', from, to, SHOP_PAYMENT_STATUS);
}

export function assertOmraPaymentStatusTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('Omra payment', from, to, OMRA_PAYMENT_STATUS);
}

export function assertRequestStatusTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('support request', from, to, REQUEST_STATUS);
}

export function assertOperationalDocumentStatusTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('operational document', from, to, OPERATIONAL_DOC_STATUS);
}

export function assertLibraryDocumentStatusTransition(
  from: string,
  to: string | undefined,
): void {
  assertTransition('library document', from, to, LIBRARY_DOC_STATUS);
}
