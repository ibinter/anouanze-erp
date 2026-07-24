/**
 * Vecteurs de test officiels RFC 6238 (annexe B) — secret ASCII
 * « 12345678901234567890 », soit GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ en base32.
 * Les valeurs de la RFC sont à 8 chiffres ; l'ERP utilise 6 chiffres,
 * donc on compare les 6 derniers chiffres.
 */
import {
  decoderBase32,
  encoderBase32,
  genererSecretTotp,
  genererTotp,
  verifierTotp,
  construireOtpauthUrl,
} from './totp.util';

const SECRET_RFC = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('totp.util', () => {
  it('encode et décode en base32 (RFC 4648)', () => {
    expect(encoderBase32(Buffer.from('12345678901234567890'))).toBe(SECRET_RFC);
    expect(decoderBase32(SECRET_RFC).toString()).toBe('12345678901234567890');
    expect(decoderBase32('gezd gnbv gy3t qojq gezd gnbv gy3t qojq'.toUpperCase())).toHaveLength(20);
  });

  it('reproduit les vecteurs RFC 6238 (SHA1, 6 chiffres, 30 s)', () => {
    const attendus: [number, string][] = [
      [59, '287082'],
      [1111111109, '081804'],
      [1111111111, '050471'],
      [1234567890, '005924'],
      [2000000000, '279037'],
      [20000000000, '353130'],
    ];
    for (const [secondes, code] of attendus) {
      expect(genererTotp(SECRET_RFC, secondes * 1000)).toBe(code);
    }
  });

  it('accepte une dérive de ±30 s et refuse au-delà', () => {
    const base = 1111111109 * 1000;
    expect(verifierTotp(SECRET_RFC, '081804', base)).toBe(0);
    expect(verifierTotp(SECRET_RFC, '081804', base + 30_000)).toBe(-1);
    expect(verifierTotp(SECRET_RFC, '081804', base - 30_000)).toBe(1);
    expect(verifierTotp(SECRET_RFC, '081804', base + 120_000)).toBeNull();
    expect(verifierTotp(SECRET_RFC, '000000', base)).toBeNull();
    expect(verifierTotp(SECRET_RFC, 'abcdef', base)).toBeNull();
  });

  it('génère un secret de 160 bits en base32', () => {
    const secret = genererSecretTotp();
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(decoderBase32(secret)).toHaveLength(20);
  });

  it('construit une URL otpauth exploitable par les applications', () => {
    const url = construireOtpauthUrl({
      secret: SECRET_RFC,
      compte: 'admin@espoir-afrique.org',
      emetteur: 'ANOUANZE ERP',
    });
    expect(url.startsWith('otpauth://totp/ANOUANZE%20ERP:admin%40espoir-afrique.org?')).toBe(true);
    expect(url).toContain(`secret=${SECRET_RFC}`);
    expect(url).toContain('algorithm=SHA1');
    expect(url).toContain('digits=6');
    expect(url).toContain('period=30');
  });
});
