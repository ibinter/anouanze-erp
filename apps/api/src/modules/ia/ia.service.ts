import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly openai: OpenAI | null;
  private readonly model: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    this.model = this.config.get<string>('OPENAI_MODEL', 'gpt-4o');
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  private async callGPT(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.openai) return '';
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });
    return response.choices[0]?.message?.content ?? '{}';
  }

  async analyserTableauBord(orgId: string) {
    if (!this.openai) {
      return {
        insights: [
          'Le taux de réalisation budgétaire est de 78%, dans la norme pour cette période.',
          '3 projets sur 5 sont en cours avec des indicateurs positifs.',
          'La trésorerie couvre 4 mois de fonctionnement.',
        ],
        recommandations: [
          'Accélérer la mise en œuvre du projet WASH pour rattraper le retard.',
          'Envisager une diversification des sources de financement.',
        ],
        alertes: [
          'La convention avec le bailleur USAID expire dans 30 jours.',
        ],
      };
    }

    const [membres, projets, budgets, tresorerie] = await Promise.all([
      this.prisma.membre.count({ where: { organisationId: orgId } }),
      this.prisma.projet.findMany({
        where: { organisationId: orgId },
        select: { statut: true, budgetTotal: true, nom: true },
      }),
      this.prisma.budget.findMany({
        where: { organisationId: orgId },
        select: { nom: true, exercice: true, statut: true },
        take: 1,
        orderBy: { exercice: 'desc' },
      }),
      this.prisma.mouvementBancaire.aggregate({
        where: { compte: { organisationId: orgId } },
        _sum: { credit: true, debit: true },
      }),
    ]);

    const contextuel = JSON.stringify({ membres, projets, budgets, tresoreirie: tresorerie });

    const systemPrompt = `Tu es un expert en gestion d'ONG en Afrique de l'Ouest.
    Réponds uniquement en JSON avec la structure : {"insights":[],"recommandations":[],"alertes":[]}`;

    const userPrompt = `Analyse ce tableau de bord d'une organisation à but non lucratif et génère des insights pertinents :
    ${contextuel}
    Fournis 3 insights, 2 recommandations et les alertes critiques en français.`;

    const result = JSON.parse(await this.callGPT(systemPrompt, userPrompt));
    return result as { insights: string[]; recommandations: string[]; alertes: string[] };
  }

  async genererRapportNarratif(
    orgId: string,
    type: 'annuel' | 'trimestriel' | 'bailleur',
    params: Record<string, unknown>,
  ) {
    if (!this.openai) {
      return {
        resume: 'L\'organisation a réalisé des progrès significatifs au cours de la période.',
        bilanActivites: 'Les activités planifiées ont été exécutées à hauteur de 85%.',
        perspectives: 'L\'exercice suivant verra le lancement de deux nouveaux projets structurants.',
      };
    }

    const [org, projets] = await Promise.all([
      this.prisma.organisation.findUnique({ where: { id: orgId }, select: { nom: true, mission: true } }),
      this.prisma.projet.findMany({
        where: { organisationId: orgId, statut: 'EN_COURS' as any },
        select: { nom: true, budgetTotal: true, statut: true },
        take: 10,
      }),
    ]);

    const systemPrompt = `Tu es un expert rédacteur de rapports pour ONG.
    Réponds uniquement en JSON avec la structure : {"resume":"","bilanActivites":"","perspectives":""}`;

    const userPrompt = `Rédige un rapport de type "${type}" pour l'organisation "${org?.nom}" (mission : ${org?.mission}).
    Projets actifs : ${JSON.stringify(projets)}
    Paramètres supplémentaires : ${JSON.stringify(params)}
    Réponse en français, style professionnel et concis.`;

    const result = JSON.parse(await this.callGPT(systemPrompt, userPrompt));
    return result as { resume: string; bilanActivites: string; perspectives: string };
  }

  async proposerBudget(orgId: string, exercice: number) {
    if (!this.openai) {
      return {
        exercice,
        totalPropose: 150000000,
        lignes: [
          { poste: 'Charges de personnel', montant: 60000000, justification: 'Basé sur effectif actuel + 5% augmentation' },
          { poste: 'Fonctionnement', montant: 30000000, justification: 'Moyenne des 3 derniers exercices' },
          { poste: 'Activités projets', montant: 60000000, justification: 'Pipeline de projets identifiés' },
        ],
      };
    }

    const historique = await this.prisma.budget.findMany({
      where: { organisationId: orgId, exercice: { gte: exercice - 3, lt: exercice } },
      include: { lignes: true },
      orderBy: { exercice: 'desc' },
    });

    const systemPrompt = `Tu es un expert en planification budgétaire pour ONG.
    Réponds uniquement en JSON avec la structure : {"exercice":0,"totalPropose":0,"lignes":[{"poste":"","montant":0,"justification":""}]}`;

    const userPrompt = `Sur base de cet historique budgétaire sur ${historique.length} exercices :
    ${JSON.stringify(historique)}
    Propose un budget prévisionnel pour l'exercice ${exercice} en XOF. Justifie chaque ligne budgétaire principale.`;

    const result = JSON.parse(await this.callGPT(systemPrompt, userPrompt));
    return result;
  }

  async detecterAnomalies(orgId: string) {
    if (!this.openai) {
      return [
        { id: 'mock-1', libelle: 'Écriture sans pièce justificative — compte 6321', montant: 450000, risque: 'MOYEN', date: new Date().toISOString() },
        { id: 'mock-2', libelle: 'Montant inhabituel sur compte 57', montant: 12500000, risque: 'ELEVE', date: new Date().toISOString() },
      ];
    }

    const ecritures = await this.prisma.ecritureComptable.findMany({
      where: { organisationId: orgId },
      include: { lignes: { include: { compte: true } } },
      orderBy: { dateEcriture: 'desc' },
      take: 200,
    });

    const systemPrompt = `Tu es un auditeur comptable spécialisé ONG en Afrique.
    Réponds uniquement en JSON avec la structure : {"anomalies":[{"id":"","libelle":"","montant":0,"risque":"FAIBLE|MOYEN|ELEVE","date":""}]}`;

    const userPrompt = `Analyse ces ${ecritures.length} écritures comptables et détecte les anomalies :
    ${JSON.stringify(ecritures.slice(0, 50))}
    Cherche : montants anormaux, doublons potentiels, écritures sans pièce, patterns inhabituels.`;

    const result = JSON.parse(await this.callGPT(systemPrompt, userPrompt));
    return result.anomalies ?? [];
  }

  async chatAssistant(
    orgId: string,
    userId: string,
    message: string,
    historique: { role: 'user' | 'assistant'; content: string }[],
  ) {
    if (!this.openai) {
      return {
        reponse: `Je suis l'assistant ANOUANZÊ en mode démo. Vous avez demandé : "${message}". Configurez OPENAI_API_KEY pour activer l'IA complète.`,
      };
    }

    const [org, membres, projets] = await Promise.all([
      this.prisma.organisation.findUnique({ where: { id: orgId }, select: { nom: true, mission: true, deviseDefaut: true } }),
      this.prisma.membre.count({ where: { organisationId: orgId } }),
      this.prisma.projet.count({ where: { organisationId: orgId, statut: 'EN_COURS' as any } }),
    ]);

    const systemContent = `Tu es l'assistant intelligent d'ANOUANZÊ ERP pour l'organisation "${org?.nom}".
Mission : ${org?.mission ?? 'non définie'}. Membres actifs : ${membres}. Projets en cours : ${projets}. Devise : ${org?.deviseDefaut ?? 'XOF'}.
Réponds toujours en français de manière concise et professionnelle.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemContent },
      ...(historique ?? []).map((h) => ({ role: h.role, content: h.content } as OpenAI.Chat.Completions.ChatCompletionMessageParam)),
      { role: 'user', content: message },
    ];

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages,
    });

    return { reponse: response.choices[0]?.message?.content ?? '' };
  }

  async traduireDocument(texte: string, langueSource: string, langueCible: string) {
    if (!this.openai) {
      return { traduction: `[Traduction ${langueSource}→${langueCible} non disponible en mode démo]`, langueSource, langueCible };
    }

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `Tu es un traducteur professionnel spécialisé dans les documents ONG et humanitaires. Traduis uniquement le texte, sans explication.`,
        },
        {
          role: 'user',
          content: `Traduis ce texte de ${langueSource} vers ${langueCible} :\n\n${texte}`,
        },
      ],
    });

    return {
      traduction: response.choices[0]?.message?.content ?? '',
      langueSource,
      langueCible,
    };
  }
}
