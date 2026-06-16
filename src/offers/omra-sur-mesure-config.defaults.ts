import type { Prisma } from '@prisma/client';

/** Valeurs par défaut — alignées sur le configurateur page publique (structure extensible). */
export function defaultOmraSurMesurePayload(): Prisma.InputJsonValue {
  return {
    step1_voyage: {
      toggles: {
        departureDate: true,
        returnDate: true,
        flexibilityPlusMinus2: true,
      },
      travelers: {
        adults: { min: 1, max: 10, default: 2 },
        seniors: { min: 0, max: 8, default: 0 },
        children: { enabled: true, ages: [8] as number[] },
      },
      helpText:
        'Choisissez vos dates de voyage. Vous pouvez indiquer une flexibilité si besoin.',
      infoText:
        'Les départs groupés sont en général au départ de Casablanca sauf mention contraire.',
    },
    step2_hebergement: {
      hotelLevel: [
        { id: 'hl-1', label: 'Confort (3★)', order: 0, active: true },
        { id: 'hl-2', label: 'Supérieur (4★)', order: 1, active: true },
        { id: 'hl-3', label: 'Luxe (5★)', order: 2, active: true },
      ],
      roomType: [
        { id: 'rt-1', label: 'Chambre double', order: 0, active: true },
        { id: 'rt-2', label: 'Twin', order: 1, active: true },
        { id: 'rt-3', label: 'Triple / quadruple', order: 2, active: true },
      ],
      proximity: [
        { id: 'px-1', label: 'Proche du Haram (5–10 min)', order: 0, active: true },
        { id: 'px-2', label: 'Navette régulière', order: 1, active: true },
      ],
      view: [
        { id: 'vw-1', label: 'Vue Haram', order: 0, active: true },
        { id: 'vw-2', label: 'Sans préférence', order: 1, active: true },
      ],
    },
    step3_accompagnement: {
      services: [
        {
          id: 'svc-1',
          title: 'Accompagnateur francophone',
          description: 'Guide expérimenté durant tout le séjour.',
          icon: '',
          active: true,
          order: 0,
        },
        {
          id: 'svc-2',
          title: 'Assistance visa & documents',
          description: 'Aide pour le dossier administratif.',
          icon: '',
          active: true,
          order: 1,
        },
      ],
    },
    step4_recap: {
      estimationPriceText:
        'Estimation indicative : le tarif final sera confirmé sur votre devis personnalisé.',
      quoteDelayText: 'Réponse sous 24 à 48 h ouvrées.',
      labels: {
        dates: 'Dates du voyage',
        travelers: 'Voyageurs',
        lodging: 'Hébergement & confort',
        support: 'Accompagnement',
        recap: 'Récapitulatif',
      },
    },
    step5_conversion: {
      whatsapp: {
        phone: '+212600000000',
        messageTemplate:
          'Bonjour INTISAR, je souhaite un devis Omra sur mesure. Voici ma configuration : {{RECAP}}',
      },
      email: {
        to: 'contact@intisar-voyages.ma',
        subject: 'Demande Omra sur mesure — {{CLIENT_NAME}}',
        bodyTemplate:
          'Bonjour,\n\nVoici les préférences saisies sur le configurateur :\n\n{{RECAP}}\n\nMerci de me recontacter.\n',
      },
      restartButtonText: 'Recommencer',
    },
  };
}
