'use client';

import { useEffect } from 'react';

/**
 * Écosystème IBIG SOFT — monte le script universel (carrousel « Nos solutions »).
 *
 * Pourquoi pas `next/script` : React insère la balise <script> d'une manière qui
 * ne déclenche pas son exécution (scripts injectés via innerHTML). On crée donc
 * l'élément explicitement — cela garantit l'exécution ET renseigne correctement
 * `document.currentScript`, dont le script universel a besoin pour lire ses
 * attributs `data-*` (solution courante, rendu, couleur d'accent).
 */
const SCRIPT_ID = 'ibigsoft-universal';

export default function IbigSolutions() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = '/ibigsoft-universal.js';
    script.async = false; // exécution ordonnée → document.currentScript fiable
    script.setAttribute('data-solution', 'anouanze');
    script.setAttribute('data-render', 'solutions'); // footer ANOUANZÊ conservé
    script.setAttribute('data-accent', '#146C43');
    document.body.appendChild(script);
  }, []);

  return <div data-ibig="solutions" />;
}
