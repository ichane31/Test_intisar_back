import type { Prisma } from '@prisma/client';

const PACK_IDS = ['p-essentiel', 'p-confort', 'p-premium'] as const;

export function defaultComparateurMatrixPayload(): Prisma.InputJsonValue {
  const categories = [
    { id: 'c-log', label: 'Logistique & préparation', order: 0, active: true },
    { id: 'c-heb', label: 'Hébergement', order: 1, active: true },
    { id: 'c-trn', label: 'Transport', order: 2, active: true },
    { id: 'c-spi', label: 'Accompagnement spirituel', order: 3, active: true },
    { id: 'c-btq', label: 'Boutique & matériels', order: 4, active: true },
    { id: 'c-add', label: 'Services additionnels', order: 5, active: true },
  ];

  const services = [
    {
      id: 's-visa',
      label: 'Assistance documents & visa',
      categoryId: 'c-log',
      order: 0,
      active: true,
    },
    {
      id: 's-check',
      label: 'Checklist personnalisée',
      categoryId: 'c-log',
      order: 1,
      active: true,
    },
    {
      id: 's-hotel',
      label: 'Catégorie hôtel',
      categoryId: 'c-heb',
      order: 2,
      active: true,
    },
    {
      id: 's-haram',
      label: 'Proximité Haram',
      categoryId: 'c-heb',
      order: 3,
      active: true,
    },
    {
      id: 's-vol',
      label: 'Vol inclus',
      categoryId: 'c-trn',
      order: 4,
      active: true,
    },
    {
      id: 's-transfert',
      label: 'Transferts aéroport',
      categoryId: 'c-trn',
      order: 5,
      active: true,
    },
    {
      id: 's-guide',
      label: 'Guide francophone',
      categoryId: 'c-spi',
      order: 6,
      active: true,
    },
    {
      id: 's-ihram',
      label: 'Kit Ihram offert',
      categoryId: 'c-btq',
      order: 7,
      active: true,
    },
    {
      id: 's-concierge',
      label: 'Concierge 24/7',
      categoryId: 'c-add',
      order: 8,
      active: true,
    },
  ];

  const packs = [
    {
      id: PACK_IDS[0],
      name: 'Pack Essentiel',
      order: 0,
      active: true,
      price: 2990,
    },
    {
      id: PACK_IDS[1],
      name: 'Pack Confort',
      order: 1,
      active: true,
      price: 3990,
    },
    {
      id: PACK_IDS[2],
      name: 'Pack Premium',
      order: 2,
      active: true,
      price: 5490,
    },
  ];

  const matrix: Record<string, Record<string, string>> = {};
  const preset: Record<string, Record<string, string>> = {
    's-visa': { 'p-essentiel': 'yes', 'p-confort': 'yes', 'p-premium': 'yes' },
    's-check': { 'p-essentiel': 'no', 'p-confort': 'yes', 'p-premium': 'yes' },
    's-hotel': {
      'p-essentiel': '3★',
      'p-confort': '4★',
      'p-premium': '5★',
    },
    's-haram': {
      'p-essentiel': '15–20 min',
      'p-confort': '10 min',
      'p-premium': '5 min',
    },
    's-vol': { 'p-essentiel': 'yes', 'p-confort': 'yes', 'p-premium': 'yes' },
    's-transfert': { 'p-essentiel': 'yes', 'p-confort': 'yes', 'p-premium': 'yes' },
    's-guide': { 'p-essentiel': 'na', 'p-confort': 'yes', 'p-premium': 'yes' },
    's-ihram': { 'p-essentiel': 'no', 'p-confort': 'yes', 'p-premium': 'yes' },
    's-concierge': { 'p-essentiel': 'no', 'p-confort': 'no', 'p-premium': 'yes' },
  };

  for (const s of services) {
    matrix[s.id] = {};
    for (const p of PACK_IDS) {
      matrix[s.id][p] = preset[s.id]?.[p] ?? 'na';
    }
  }

  return {
    active: true,
    categories,
    services,
    packs,
    matrix,
  };
}
