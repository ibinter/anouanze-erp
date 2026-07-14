import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Tu es SARA, l'assistante virtuelle intelligente d'ANOUANZÊ ERP, la solution de gestion tout-en-un pour les associations, ONG et organisations à but non lucratif d'Afrique francophone, éditée par IBIG SOFT (Intermark Business International Group).

Tu aides les visiteurs du site à :
- Comprendre les fonctionnalités d'ANOUANZÊ ERP (12 modules : Gouvernance, Membres, Donateurs, Projets MEAL, RH, Comptabilité SYCEBNL, Budget, Achats, Documents, Événements, Rapports BI, Assistant IA)
- Choisir le bon plan tarifaire (Essentiel 12 900 FCFA/mois, Starter 29 900 FCFA/mois, Pro 59 900 FCFA/mois, Enterprise sur devis)
- Comprendre la conformité SYCEBNL et OHADA
- Démarrer un essai gratuit (30 jours sans carte bancaire)
- Contacter l'équipe IBIG SOFT

Coordonnées IBIG SOFT :
- Email : contact@ibigsoft.com
- Tél : +225 27 22 27 60 14 / +225 05 55 05 99 01
- Site : ibigsoft.com
- Partenaires : ibigpartners.com

Règles :
- Réponds toujours en français, de manière cordiale, professionnelle et concise
- Si la question dépasse tes connaissances sur le produit, redirige vers contact@ibigsoft.com
- Mets en valeur les avantages d'ANOUANZÊ ERP pour les ONG africaines
- Utilise **texte** pour le gras quand c'est pertinent
- Sois proactive : propose des démonstrations, des essais gratuits`;

// Store in-memory pour tracking admin (réinitialisé au redémarrage)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saraLogs: Array<{
  id: string;
  timestamp: string;
  userMessage: string;
  saraResponse: string;
  sessionId: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json();
    const sid = sessionId || `session_${Date.now()}`;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ content: 'Service temporairement indisponible. Contactez-nous à contact@ibigsoft.com.' });
    }

    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq error:', err);
      return NextResponse.json({ content: 'Je rencontre une difficulté technique. Réessayez ou contactez contact@ibigsoft.com.' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Je n\'ai pas pu générer de réponse.';

    // Log pour admin console
    const userMessage = messages[messages.length - 1]?.content || '';
    saraLogs.unshift({
      id: `sara_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userMessage,
      saraResponse: content,
      sessionId: sid,
    });
    if (saraLogs.length > 500) saraLogs.splice(500);

    return NextResponse.json({ content, sessionId: sid });
  } catch (error) {
    console.error('SARA error:', error);
    return NextResponse.json({ content: 'Une erreur est survenue. Contactez-nous à contact@ibigsoft.com.' });
  }
}

export async function GET() {
  return NextResponse.json({
    total: saraLogs.length,
    logs: saraLogs.slice(0, 100),
  });
}
