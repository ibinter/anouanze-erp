import { ImageResponse } from 'next/og';
import { BRAND, PUBLISHER, SITE_NAME } from '@/lib/seo';

/**
 * Image sociale générée dynamiquement (`next/og`), aux couleurs ANOUANZÊ.
 *
 * Générée plutôt que livrée en binaire : pas d'asset à régénérer à la main, et
 * aucune ressource externe (police système par défaut de `next/og`, aucun
 * appel réseau) — l'image reste produisible sur un VPS sans accès sortant.
 */
export const alt = `${SITE_NAME} — L'ERP des associations et ONG d'Afrique`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Générée à la demande, pas au build.
 *
 * `next/og` échoue au prérendu statique dans ce projet (« Invalid URL » lors du
 * chargement de sa police par défaut, en sortie `standalone`). L'image est donc
 * produite au premier appel puis mise en cache par le CDN / le navigateur —
 * elle n'est demandée que par les robots d'aperçu social, le coût est nul.
 */
export const dynamic = 'force-dynamic';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.primary} 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Bandeau supérieur : marque */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 20,
              background: BRAND.accent,
              color: '#FFFFFF',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            ERP
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#FFFFFF', letterSpacing: -1 }}>
              {SITE_NAME}
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>
              par {PUBLISHER.name}
            </div>
          </div>
        </div>

        {/* Promesse */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              letterSpacing: -2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Pilotez votre impact.</span>
            <span style={{ color: BRAND.accent }}>Gérez avec excellence.</span>
          </div>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.85)', lineHeight: 1.35 }}>
            L&apos;ERP tout-en-un des associations, ONG et organisations à but non lucratif
            d&apos;Afrique francophone.
          </div>
        </div>

        {/* Pied : repères de conformité */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {['Conforme SYCEBNL', 'Norme OHADA', '12 modules intégrés'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                fontSize: 22,
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
