import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  await prisma.$transaction([
    prisma.historyEntry.deleteMany(),
    prisma.systemLog.deleteMany(),
    prisma.document.deleteMany(),
    prisma.libraryDocument.deleteMany(),
    prisma.mediaFile.deleteMany(),
    prisma.supportRequest.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.referral.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.omraReservation.deleteMany(),
    prisma.shopOrder.deleteMany(),
    prisma.stockMovement.deleteMany(),
    prisma.product.deleteMany(),
    prisma.specialOffer.deleteMany(),
    prisma.customOffer.deleteMany(),
    prisma.comparatorConfig.deleteMany(),
    prisma.omraPack.deleteMany(),
    prisma.productCategory.deleteMany(),
    prisma.section.deleteMany(),
    prisma.page.deleteMany(),
    prisma.faq.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.guide.deleteMany(),
    prisma.legalContent.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.client.deleteMany(),
    prisma.adminUser.deleteMany(),
    prisma.globalSettings.deleteMany(),
  ]);

  const adminHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@intisar.com',
      passwordHash: adminHash,
      name: 'Ahmed Benali',
      role: 'SUPER_ADMIN',
      avatar: '/placeholder-user.jpg',
      status: 'active',
    },
  });
  await prisma.adminUser.create({
    data: {
      email: 'manager@intisar.com',
      passwordHash: managerHash,
      name: 'Fatima Zahra',
      role: 'ADMIN',
      avatar: '/placeholder-user.jpg',
      status: 'active',
    },
  });

  await prisma.globalSettings.create({
    data: {
      siteName: 'INTISAR Voyages',
      siteEmail: 'contact@intisar-voyages.ma',
      sitePhone: '+212 5 22 33 44 55',
      currency: 'MAD',
      timezone: 'Africa/Casablanca',
      maintenanceMode: false,
      siteDescription:
        'Agence marocaine — Omra, Hajj et voyages spirituels. Paiement en MAD.',
      companyAddress: 'Boulevard Zerktouni, Casablanca, Maroc',
      defaultLanguage: 'fr',
    },
  });

  await prisma.productCategory.createMany({
    data: [
      {
        name: 'Vêtements Ihram',
        slug: 'vetements-ihram',
        description: 'Tenues pour le pèlerinage',
        order: 1,
        status: 'published',
      },
      {
        name: 'Accessoires de prière',
        slug: 'accessoires-priere',
        order: 2,
        status: 'published',
      },
      {
        name: 'Parfums & encens',
        slug: 'parfums-encens',
        order: 3,
        status: 'published',
      },
      {
        name: 'Sacs & bagagerie',
        slug: 'sacs-bagagerie',
        order: 4,
        status: 'published',
      },
      {
        name: 'Livres & guides',
        slug: 'livres-guides',
        order: 5,
        status: 'published',
      },
    ],
  });
  const cats = await prisma.productCategory.findMany({ orderBy: { order: 'asc' } });

  await prisma.product.createMany({
    data: [
      {
        name: 'Ensemble Ihram Premium Homme',
        slug: 'ensemble-ihram-premium-homme',
        description: 'Ihram blanc qualité supérieure.',
        price: 350,
        stock: 150,
        minStock: 10,
        maxStock: 500,
        categoryId: cats[0]!.id,
        categoryName: cats[0]!.name,
        images: ['/placeholder.jpg'],
        status: 'published',
        sku: 'IHR-001',
        weight: 0.5,
      },
      {
        name: 'Tapis de prière de voyage',
        slug: 'tapis-priere-voyage',
        description: 'Léger, pliable.',
        price: 120,
        stock: 200,
        minStock: 15,
        maxStock: 400,
        categoryId: cats[1]!.id,
        categoryName: cats[1]!.name,
        images: ['/placeholder.jpg'],
        status: 'published',
        sku: 'PRI-002',
        weight: 0.2,
      },
      {
        name: 'Encens Oud Casablanca',
        slug: 'encens-oud-casa',
        description: 'Parfum traditionnel.',
        price: 89,
        stock: 80,
        minStock: 8,
        maxStock: 200,
        categoryId: cats[2]!.id,
        categoryName: cats[2]!.name,
        images: ['/placeholder.jpg'],
        status: 'published',
        sku: 'ENC-003',
        weight: 0.15,
      },
      {
        name: 'Sac à dos cabine 40L',
        slug: 'sac-dos-cabine-40l',
        description: 'Conforme compagnies MAR/EU.',
        price: 420,
        stock: 45,
        minStock: 5,
        maxStock: 120,
        categoryId: cats[3]!.id,
        categoryName: cats[3]!.name,
        images: ['/placeholder.jpg'],
        status: 'published',
        sku: 'BAG-004',
        weight: 0.9,
      },
      {
        name: 'Guide du pèlerin (FR)',
        slug: 'guide-pelerin-fr',
        description: 'Rituels et conseils pratiques.',
        price: 65,
        stock: 300,
        minStock: 20,
        maxStock: 600,
        categoryId: cats[4]!.id,
        categoryName: cats[4]!.name,
        images: ['/placeholder.jpg'],
        status: 'published',
        sku: 'LIV-005',
        weight: 0.35,
      },
    ],
  });

  const packDefs = [
    {
      title: 'Pack Omra Premium Ramadan 2026',
      tripType: 'omra',
      basePrice: 12500,
      seats: 25,
      city: 'Casablanca',
      dep: '2026-03-01',
      ret: '2026-03-15',
    },
    {
      title: 'Pack Omra Économique Printemps 2026',
      tripType: 'omra',
      basePrice: 8900,
      seats: 40,
      city: 'Rabat',
      dep: '2026-04-10',
      ret: '2026-04-22',
    },
    {
      title: 'Pack Omra Confort Été 2026',
      tripType: 'omra',
      basePrice: 10200,
      seats: 32,
      city: 'Marrakech',
      dep: '2026-06-05',
      ret: '2026-06-18',
    },
    {
      title: 'Pack Omra Famille Automne 2026',
      tripType: 'omra',
      basePrice: 11800,
      seats: 28,
      city: 'Fès',
      dep: '2026-09-12',
      ret: '2026-09-26',
    },
    {
      title: 'Pack Omra VIP Décembre 2026',
      tripType: 'omra',
      basePrice: 18500,
      seats: 16,
      city: 'Tanger',
      dep: '2026-12-01',
      ret: '2026-12-14',
    },
  ];

  for (const p of packDefs) {
    await prisma.omraPack.create({
      data: {
        slug: `${slugify(p.title)}-seed`,
        title: p.title,
        tripType: p.tripType,
        description: `Départ ${p.city} — formule tout inclus (vol, hôtel, transferts, visa).`,
        shortDescription: `Omra depuis ${p.city} avec accompagnement INTISAR.`,
        status: 'published',
        duration: 12,
        departureCity: p.city,
        basePrice: p.basePrice,
        promoPrice: null,
        totalSeats: 45,
        availableSeats: p.seats,
        featured: p.title.includes('Premium'),
        hotelSummary: 'Hôtels 4★ proches des Haramayn',
        hotelRating: 4,
        services: ['Vol', 'Transferts', 'Visa Omra', 'Accompagnateur'],
        images: ['/placeholder.jpg'],
        inclusions: ['Petit-déjeuner', 'Ziyarat guidées'],
        exclusions: ['Dépenses personnelles'],
        program: [],
        departureDate: new Date(p.dep),
        returnDate: new Date(p.ret),
        seoTitle: p.title,
        seoDescription: `Réservez ${p.title} avec INTISAR Voyages.`,
      },
    });
  }

  const pack = await prisma.omraPack.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (pack) {
    await prisma.specialOffer.create({
      data: {
        title: 'Offre Ramadan -12%',
        description: 'Réduction sur le pack Premium.',
        originalPrice: 12500,
        discountedPrice: 11000,
        discountPercentage: 12,
        packId: pack.id,
        validFrom: new Date('2026-02-01'),
        validTo: new Date('2026-04-15'),
        status: 'published',
      },
    });
  }

  await prisma.comparatorConfig.create({
    data: {
      key: 'default',
      features: [
        { id: '1', name: 'Prix (MAD)', category: 'Tarif', isVisible: true, order: 1 },
        { id: '2', name: 'Durée', category: 'Voyage', isVisible: true, order: 2 },
        { id: '3', name: 'Hôtel', category: 'Hébergement', isVisible: true, order: 3 },
      ],
    },
  });

  await prisma.libraryDocument.create({
    data: {
      title: 'Contrat type Omra',
      description: 'Modèle de contrat pour réservations Omra',
      slug: 'contrat-type-omra',
      category: 'contract_template',
      fileName: 'contrat-omra-standard.pdf',
      url: '/documents/contrat-omra.pdf',
      mimeType: 'application/pdf',
      fileSize: 245000,
      version: '1.0',
      status: 'active',
      uploadedBy: admin.name,
    },
  });

  const clientMohammed = await prisma.client.create({
    data: {
      firstName: 'Mohammed',
      lastName: 'Alami',
      email: 'mohammed.alami@example.ma',
      phone: '+212 6 12 34 56 78',
      city: 'Casablanca',
      country: 'Maroc',
      referralCode: 'INTISAR-MOHAMMED-5001',
      totalOrders: 3,
      totalSpent: 38500,
    },
  });
  const clientFatima = await prisma.client.create({
    data: {
      firstName: 'Fatima',
      lastName: 'Benkirane',
      email: 'fatima.benkirane@example.ma',
      phone: '+212 6 61 22 33 44',
      city: 'Rabat',
      country: 'Maroc',
      totalOrders: 1,
      totalSpent: 10200,
    },
  });
  const clientOmar = await prisma.client.create({
    data: {
      firstName: 'Omar',
      lastName: 'Tazi',
      email: 'omar.tazi@example.ma',
      phone: '+212 6 71 88 99 00',
      city: 'Marrakech',
      country: 'Maroc',
      referralCode: 'INTISAR-OMAR-6002',
      totalOrders: 2,
      totalSpent: 22000,
    },
  });
  await prisma.client.create({
    data: {
      firstName: 'Khadija',
      lastName: 'El Idrissi',
      email: 'khadija.elidrissi@example.ma',
      phone: '+212 6 55 11 22 33',
      city: 'Fès',
      country: 'Maroc',
      totalOrders: 0,
      totalSpent: 0,
    },
  });
  await prisma.client.create({
    data: {
      firstName: 'Youssef',
      lastName: 'Amrani',
      email: 'youssef.amrani@example.ma',
      phone: '+212 6 44 77 88 99',
      city: 'Tanger',
      country: 'Maroc',
      totalOrders: 4,
      totalSpent: 45200,
    },
  });

  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  await prisma.lead.create({
    data: {
      firstName: 'Hassan',
      lastName: 'Tazi',
      email: 'hassan.tazi.lead@example.ma',
      phone: '+212 6 33 44 55 66',
      source: 'website',
      interest: 'Pack Omra Premium',
      status: 'new',
      score: 72,
      createdAt: tenDaysAgo,
    },
  });
  const leadHamza = await prisma.lead.create({
    data: {
      firstName: 'Hamza',
      lastName: 'Ouali',
      email: 'hamza.ouali@example.ma',
      phone: '+212 6 20 30 40 50',
      source: 'social',
      interest: 'Omra Ramadan 2026 (vu sur Instagram)',
      status: 'new',
      score: 81,
    },
  });
  await prisma.lead.create({
    data: {
      firstName: 'Sara',
      lastName: 'Idrissi',
      email: 'sara.idrissi@example.ma',
      phone: '+212 6 98 76 54 32',
      source: 'whatsapp',
      interest: 'Hajj 2027',
      status: 'contacted',
      score: 88,
      lastContactAt: new Date(),
    },
  });
  await prisma.lead.create({
    data: {
      firstName: 'Mehdi',
      lastName: 'Cherkaoui',
      email: 'mehdi.cherkaoui@example.ma',
      phone: '+212 6 11 22 33 44',
      source: 'phone',
      interest: 'Pack famille automne',
      status: 'qualified',
      score: 65,
    },
  });
  await prisma.lead.create({
    data: {
      firstName: 'Nadia',
      lastName: 'Fassi',
      email: 'nadia.fassi@example.ma',
      phone: '+212 6 77 66 55 44',
      source: 'referral',
      interest: 'Omra confort',
      status: 'converted',
      score: 92,
    },
  });

  const firstPack = await prisma.omraPack.findFirst({ orderBy: { createdAt: 'asc' } });
  const secondPack = await prisma.omraPack.findFirst({ orderBy: { basePrice: 'asc' } });
  if (firstPack) {
    await prisma.quote.create({
      data: {
        numero: 'DEV-2026-0001',
        clientNom: `${leadHamza.firstName} ${leadHamza.lastName}`,
        clientEmail: leadHamza.email,
        clientTel: leadHamza.phone ?? '+212 6 00 00 00 00',
        clientVille: 'Casablanca',
        packId: firstPack.id,
        packTitle: firstPack.title,
        nbPersonnes: 2,
        dateDepart: firstPack.departureDate,
        montantTotal: firstPack.basePrice * 2,
        remise: 500,
        montantFinal: firstPack.basePrice * 2 - 500,
        statut: 'en_attente',
        leadId: leadHamza.id,
        validiteJours: 7,
      },
    });
    await prisma.quote.create({
      data: {
        numero: 'DEV-2026-0002',
        clientNom: 'SARL Voyages Atlas',
        clientEmail: 'contact@atlas-voyages.ma',
        clientTel: '+212 5 24 11 22 33',
        clientVille: 'Marrakech',
        packId: firstPack.id,
        packTitle: firstPack.title,
        nbPersonnes: 8,
        montantTotal: firstPack.basePrice * 8,
        remise: 2000,
        montantFinal: firstPack.basePrice * 8 - 2000,
        statut: 'envoye',
        validiteJours: 14,
      },
    });
  }
  if (secondPack) {
    await prisma.quote.create({
      data: {
        numero: 'DEV-2026-0003',
        clientNom: `${clientFatima.firstName} ${clientFatima.lastName}`,
        clientEmail: clientFatima.email,
        clientTel: clientFatima.phone,
        clientVille: 'Rabat',
        packId: secondPack.id,
        packTitle: secondPack.title,
        nbPersonnes: 1,
        montantTotal: secondPack.basePrice,
        remise: 0,
        montantFinal: secondPack.basePrice,
        statut: 'accepte',
        validiteJours: 7,
      },
    });
  }

  const resWithRef = await prisma.omraReservation.create({
    data: {
      reservationNumber: 'OMR-2026-1001',
      clientId: clientFatima.id,
      clientName: `${clientFatima.firstName} ${clientFatima.lastName}`,
      clientEmail: clientFatima.email,
      clientPhone: clientFatima.phone,
      packId: firstPack!.id,
      packTitle: firstPack!.title,
      numberOfPeople: 2,
      totalAmount: firstPack!.basePrice * 2 - 500,
      status: 'confirmed',
      paymentStatus: 'paid',
      paidAmount: firstPack!.basePrice * 2 - 500,
      departureDate: firstPack!.departureDate ?? new Date(),
      notes: 'Réservation seed avec code parrain Mohammed.',
      referralCodeUsed: 'INTISAR-MOHAMMED-5001',
      referralDiscountMAD: 500,
    },
  });

  await prisma.referral.create({
    data: {
      parrainId: clientMohammed.id,
      parrainCode: 'INTISAR-MOHAMMED-5001',
      filleulNom: `${clientFatima.firstName} ${clientFatima.lastName}`,
      filleulEmail: clientFatima.email,
      filleulTel: clientFatima.phone,
      reservationId: resWithRef.id,
      statut: 'recompense',
      reductionMAD: 500,
      reductionUtilisee: false,
      dateValidation: new Date(),
    },
  });

  await prisma.referral.create({
    data: {
      parrainId: clientOmar.id,
      parrainCode: 'INTISAR-OMAR-6002',
      filleulNom: 'Prospect WhatsApp',
      filleulTel: '+212 6 99 88 77 66',
      statut: 'en_attente',
      reductionMAD: 500,
    },
  });

  await prisma.omraReservation.create({
    data: {
      reservationNumber: 'OMR-2026-1002',
      clientId: clientMohammed.id,
      clientName: `${clientMohammed.firstName} ${clientMohammed.lastName}`,
      clientEmail: clientMohammed.email,
      clientPhone: clientMohammed.phone,
      packId: firstPack!.id,
      packTitle: firstPack!.title,
      numberOfPeople: 1,
      totalAmount: firstPack!.basePrice,
      status: 'pending',
      paymentStatus: 'partial',
      paidAmount: 3000,
      departureDate: firstPack!.departureDate ?? new Date(),
    },
  });

  await prisma.supportRequest.create({
    data: {
      type: 'whatsapp',
      clientName: 'Hassan Tazi',
      clientPhone: '+212 6 33 44 55 66',
      subject: 'Demande info Pack Ramadan',
      message: 'Bonjour, je souhaite plus de détails sur le pack Ramadan 2026.',
      status: 'new',
    },
  });

  const seedProductForOrder = await prisma.product.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (seedProductForOrder) {
    await prisma.shopOrder.create({
      data: {
        orderNumber: 'SHOP-2026-E2E-001',
        clientId: clientMohammed.id,
        clientName: `${clientMohammed.firstName} ${clientMohammed.lastName}`,
        clientEmail: clientMohammed.email,
        items: [
          {
            productId: seedProductForOrder.id,
            productName: seedProductForOrder.name,
            quantity: 1,
            unitPrice: seedProductForOrder.price,
            totalPrice: seedProductForOrder.price,
          },
        ],
        totalAmount: seedProductForOrder.price,
        status: 'pending',
        shippingAddress: 'Casablanca, Maroc',
        paymentMethod: 'card',
        paymentStatus: 'pending',
        notes: 'Commande seed E2E — recette',
      },
    });
  }

  await prisma.historyEntry.create({
    data: {
      userId: admin.id,
      userName: 'Ahmed Benali',
      action: 'login',
      entityType: 'User',
      entityId: admin.id,
      entityName: 'Ahmed Benali',
    },
  });

  await prisma.page.create({
    data: {
      title: 'Accueil',
      slug: 'accueil',
      content: 'Bienvenue sur INTISAR Voyages — votre agence Omra au Maroc.',
      images: ['/placeholder.jpg'],
      seoTitle: 'INTISAR - Voyages Omra Maroc',
      status: 'published',
    },
  });

  await prisma.faq.create({
    data: {
      question: 'Comment réserver un pack Omra ?',
      answer: 'En ligne, WhatsApp (+212) ou téléphone depuis nos bureaux à Casablanca.',
      category: 'Réservation',
      order: 1,
      status: 'published',
    },
  });

  const blogSeeds = [
    {
      title: 'Préparer son Omra depuis le Maroc',
      slug: 'preparer-omra-maroc',
      excerpt: 'Visa, vols et conseils pratiques pour les résidents MAR.',
      tags: ['omra', 'maroc', 'conseils'],
    },
    {
      title: 'Les meilleures périodes pour l’Omra',
      slug: 'periodes-omra',
      excerpt: 'Ramadan, vacances scolaires : calendrier et disponibilités.',
      tags: ['omra', 'calendrier'],
    },
    {
      title: 'Paiement en dirhams (MAD) chez INTISAR',
      slug: 'paiement-mad-intisar',
      excerpt: 'Virement, espèces et options de versement échelonné.',
      tags: ['paiement', 'mad'],
    },
    {
      title: 'Ziyarat à Médine : incontournables',
      slug: 'ziyarat-medine',
      excerpt: 'Sites visités avec nos groupes accompagnés.',
      tags: ['medine', 'ziyarat'],
    },
    {
      title: 'Hajj 2027 : premières informations',
      slug: 'hajj-2027-infos',
      excerpt: 'Dossiers, quotas et accompagnement INTISAR.',
      tags: ['hajj', '2027'],
    },
  ];
  for (const b of blogSeeds) {
    await prisma.blogPost.create({
      data: {
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: `<p>${b.excerpt}</p><p>Article de démonstration — seed INTISAR.</p>`,
        author: 'INTISAR Editorial',
        tags: b.tags,
        status: 'published',
        publishedAt: new Date(),
        coverImage: '/placeholder.jpg',
      },
    });
  }

  const testimonialSeeds = [
    {
      clientName: 'Aïcha B., Casablanca',
      tripType: 'omra',
      rating: 5,
      content: 'Accompagnement impeccable du départ à Médine. Merci INTISAR.',
    },
    {
      clientName: 'Karim L., Rabat',
      tripType: 'omra',
      rating: 5,
      content: 'Prix clairs en MAD, équipe réactive sur WhatsApp.',
    },
    {
      clientName: 'Samira K., Fès',
      tripType: 'omra',
      rating: 4,
      content: 'Hôtel proche du Haram, guides à l’écoute.',
    },
    {
      clientName: 'Driss M., Tanger',
      tripType: 'hajj',
      rating: 5,
      content: 'Organisation sérieuse pour notre premier Hajj.',
    },
    {
      clientName: 'Latifa R., Marrakech',
      tripType: 'omra',
      rating: 5,
      content: 'Je recommande pour les familles.',
    },
  ];
  for (const t of testimonialSeeds) {
    await prisma.testimonial.create({
      data: {
        clientName: t.clientName,
        clientPhoto: '/placeholder-user.jpg',
        tripType: t.tripType,
        rating: t.rating,
        content: t.content,
        status: 'published',
      },
    });
  }

  console.log(
    'Seed OK — admin@intisar.com / admin123, manager@intisar.com / manager123',
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
