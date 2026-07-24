import { absoluteUrl, PUBLISHER, SITE_NAME, SITE_URL } from '@/lib/seo';

/**
 * Données structurées schema.org.
 *
 * Règle absolue : **aucune donnée inventée**. Pas d'`aggregateRating`, pas de
 * `userInteractionCount`, pas de nombre de clients — ces valeurs ne sont pas
 * mesurées et un balisage mensonger expose à une action manuelle Google.
 * On ne déclare que ce qui est vérifiable sur le site lui-même.
 */

type Json = Record<string, unknown>;

function Script({ id, data }: { id: string; data: Json }) {
  return (
    <script
      type="application/ld+json"
      // Sérialisation contrôlée (objets littéraux internes) ; `<` échappé par
      // sécurité pour ne jamais pouvoir fermer la balise script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
      // `id` stable : évite les doublons en cas de re-render.
      id={id}
    />
  );
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const SOFTWARE_ID = `${SITE_URL}/#software`;

/** Éditeur + site. Valable sur toutes les pages. */
export function SiteJsonLd() {
  const organization: Json = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: PUBLISHER.name,
    legalName: PUBLISHER.legalName,
    url: PUBLISHER.url,
    logo: absoluteUrl('/logo.svg'),
    address: { '@type': 'PostalAddress', addressCountry: PUBLISHER.country },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: PUBLISHER.phone,
        contactType: 'sales',
        availableLanguage: ['fr', 'en'],
        url: absoluteUrl('/contact'),
      },
    ],
  };

  const website: Json = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ['fr', 'en'],
    publisher: { '@id': ORGANIZATION_ID },
  };

  const software: Json = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'ERP',
    operatingSystem: 'Web (navigateur), installable en PWA',
    url: SITE_URL,
    image: absoluteUrl('/opengraph-image'),
    description:
      "ERP tout-en-un pour associations, ONG et organisations à but non lucratif d'Afrique francophone : gouvernance, membres, comptabilité SYCEBNL, projets MEAL, RH, donateurs, budget, achats, documents, événements, pilotage et assistant IA.",
    inLanguage: ['fr', 'en'],
    publisher: { '@id': ORGANIZATION_ID },
    author: { '@id': ORGANIZATION_ID },
    // Aucun prix n'est affirmé ici : la grille tarifaire vit sur la landing et
    // évolue. On se limite à l'existence d'un essai gratuit, elle, publiée.
    offers: {
      '@type': 'Offer',
      category: 'Abonnement SaaS',
      url: absoluteUrl('/demo'),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Script id="ld-organization" data={organization} />
      <Script id="ld-website" data={website} />
      <Script id="ld-software" data={software} />
    </>
  );
}

/**
 * FAQ de la landing. À ne rendre **que** sur la page qui affiche réellement
 * ces questions-réponses (exigence Google : le balisage doit refléter un
 * contenu visible).
 */
export function FaqJsonLd({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
  // Défensif : une clé de traduction absente ne doit pas casser le rendu.
  if (!Array.isArray(items) || items.length === 0) return null;

  const data: Json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return <Script id="ld-faq" data={data} />;
}
