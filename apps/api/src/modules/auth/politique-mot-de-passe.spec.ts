import { validerMotDePasse, scoreMotDePasse, decrirePolitique } from './politique-mot-de-passe';

describe('politique de mot de passe', () => {
  it('accepte un mot de passe robuste', () => {
    for (const mdp of ['Kouassi!2026#Erp', 'Bl3u-Savane*Horizon', 'Zx9%Palmier&Lagune']) {
      const r = validerMotDePasse(mdp, { email: 'admin@espoir-afrique.org' });
      expect({ mdp, ...r }).toMatchObject({ valide: true });
      expect(r.score).toBeGreaterThanOrEqual(3);
    }
  });

  it('refuse un mot de passe trop court', () => {
    const r = validerMotDePasse('Ab1!cdX', {});
    expect(r.valide).toBe(false);
    expect(r.erreurs.join(' ')).toContain('12 caractères');
  });

  it('refuse un mot de passe sans mélange de classes', () => {
    const r = validerMotDePasse('abcdefghijklmnop', {});
    expect(r.valide).toBe(false);
  });

  it('refuse les mots de passe les plus courants', () => {
    for (const mdp of ['MotDePasse123', 'Password123!', 'azertyuiop']) {
      expect(validerMotDePasse(mdp, {}).valide).toBe(false);
    }
  });

  it('refuse les suites et les répétitions', () => {
    expect(validerMotDePasse('Xk!q1234Lmzp', {}).valide).toBe(false);
    expect(validerMotDePasse('Xk!qaaaaLmzp', {}).valide).toBe(false);
  });

  it('refuse un mot de passe reprenant le nom ou l’email', () => {
    const r = validerMotDePasse('Kouakou!98Xyz', {
      email: 'patrice@espoir-afrique.org',
      nom: 'Kouakou',
      prenom: 'Patrice',
    });
    expect(r.valide).toBe(false);
    expect(r.erreurs.join(' ')).toContain('nom');
  });

  it('donne un score croissant avec la robustesse', () => {
    expect(scoreMotDePasse('')).toBe(0);
    expect(scoreMotDePasse('motdepasse')).toBeLessThan(2);
    expect(scoreMotDePasse('Zx9%Palmier&Lagune')).toBe(4);
  });

  it('décrit une politique alignée sur la validation', () => {
    const description = decrirePolitique();
    expect(description.longueurMinimale).toBe(12);
    expect(description.regles.length).toBeGreaterThan(0);
    expect(description.nonImplemente.length).toBeGreaterThan(0);
  });
});
