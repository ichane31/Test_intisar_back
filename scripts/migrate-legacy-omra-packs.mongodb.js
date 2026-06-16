/**
 * Script mongosh — migration indicative des anciens documents `omra_packs`
 * (champs `price`, `hotel`, `availableSpots`) vers le modèle canonique.
 *
 * Usage : mongosh "mongodb://..." intisar_admin migrate-legacy-omra-packs.mongodb.js
 *
 * Adapter le nom de base. Toujours sauvegarder la base avant exécution.
 */

const col = db.getCollection('omra_packs');

const res = col.updateMany(
  { basePrice: { $exists: false }, price: { $exists: true } },
  [
    {
      $set: {
        basePrice: '$price',
        promoPrice: null,
        hotelSummary: { $ifNull: ['$hotel', ''] },
        totalSeats: { $ifNull: ['$availableSpots', 0] },
        availableSeats: { $ifNull: ['$availableSpots', 0] },
        slug: {
          $ifNull: [
            '$slug',
            {
              $concat: [
                {
                  $replaceAll: {
                    input: { $toLower: '$title' },
                    find: ' ',
                    replacement: '-',
                  },
                },
                '-',
                { $toString: '$_id' },
              ],
            },
          ],
        },
        tripType: { $ifNull: ['$tripType', 'omra'] },
        inclusions: { $ifNull: ['$inclusions', []] },
        exclusions: { $ifNull: ['$exclusions', []] },
        services: { $ifNull: ['$services', []] },
        images: { $ifNull: ['$images', []] },
        featured: { $ifNull: ['$featured', false] },
        hotelRating: { $ifNull: ['$hotelRating', 0] },
      },
    },
  ],
);

printjson(res);
