import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { GenererFichePaieDto } from './dto/generer-fiche-paie.dto';
import { DemanderCongeDto } from './dto/demander-conge.dto';
import { CreateVolontaireDto } from './dto/create-volontaire.dto';

@Injectable()
export class RhService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Garde-fous d'isolation ───────────────────────────────

  /**
   * Contrôle non négociable : l'employé ciblé doit appartenir à
   * l'organisation portée par le jeton. Sans ce filtre, un `:id` arbitraire
   * permet de lire ou d'écrire les données RH d'une autre organisation.
   * On renvoie systématiquement 404 (jamais 403) pour ne pas révéler
   * l'existence d'une fiche appartenant à un autre tenant.
   */
  private async assertEmployeDansOrganisation(employeId: string, organisationId: string) {
    const employe = await this.prisma.employe.findFirst({
      where: { id: employeId, organisationId },
    });
    if (!employe) throw new NotFoundException(`Employé ${employeId} introuvable`);
    return employe;
  }

  /**
   * Résout la fiche employé de l'utilisateur connecté.
   *
   * LIMITE CONNUE : le modèle `Employe` ne porte aucune relation vers
   * `Utilisateur`. Le rapprochement se fait donc par e-mail (insensible à la
   * casse) et reste borné à l'organisation du jeton. À remplacer par un champ
   * `utilisateurId` sur `Employe` dès qu'une migration sera possible.
   */
  async resoudreEmployeCourant(user: { email?: string; organisationId: string }) {
    const email = user?.email?.trim();
    if (!email) {
      throw new ForbiddenException(
        "Votre compte ne porte aucune adresse e-mail : impossible de le rattacher à une fiche employé.",
      );
    }

    const employes = await this.prisma.employe.findMany({
      where: {
        organisationId: user.organisationId,
        email: { equals: email, mode: 'insensitive' },
      },
    });

    if (employes.length === 0) {
      throw new NotFoundException(
        "Aucune fiche employé n'est rattachée à votre compte. Contactez le service RH pour qu'il renseigne votre adresse e-mail sur votre fiche.",
      );
    }
    if (employes.length > 1) {
      throw new BadRequestException(
        'Plusieurs fiches employé partagent votre adresse e-mail. Contactez le service RH pour lever l’ambiguïté.',
      );
    }

    return employes[0];
  }

  async findAllEmployes(
    organisationId: string,
    params: { page?: number; limit?: number; search?: string; actif?: boolean },
  ) {
    const { page = 1, limit = 20, search, actif } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { organisationId };

    if (actif !== undefined) where['actif'] = actif;

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { matricule: { contains: search, mode: 'insensitive' } },
        { poste: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employe.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneEmploye(id: string, organisationId: string) {
    const employe = await this.prisma.employe.findFirst({
      where: { id, organisationId },
      include: {
        fiches: { orderBy: { createdAt: 'desc' }, take: 12 },
        conges: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!employe) throw new NotFoundException(`Employé ${id} introuvable`);
    return employe;
  }

  async createEmploye(organisationId: string, dto: CreateEmployeDto) {
    if (dto.matricule) {
      const exists = await this.prisma.employe.findUnique({
        where: { organisationId_matricule: { organisationId, matricule: dto.matricule } },
      });
      if (exists) {
        throw new BadRequestException(`Le matricule ${dto.matricule} existe déjà`);
      }
    } else {
      const count = await this.prisma.employe.count({ where: { organisationId } });
      dto.matricule = `EMP-${String(count + 1).padStart(5, '0')}`;
    }

    return this.prisma.employe.create({
      data: {
        ...dto,
        organisationId,
        dateEmbauche: new Date(dto.dateEmbauche),
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        dateFinContrat: dto.dateFinContrat ? new Date(dto.dateFinContrat) : undefined,
      } as any,
    });
  }

  async updateEmploye(id: string, organisationId: string, dto: Partial<CreateEmployeDto>) {
    await this.findOneEmploye(id, organisationId);

    return this.prisma.employe.update({
      where: { id },
      data: {
        ...dto,
        dateEmbauche: dto.dateEmbauche ? new Date(dto.dateEmbauche) : undefined,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        dateFinContrat: dto.dateFinContrat ? new Date(dto.dateFinContrat) : undefined,
      } as any,
    });
  }

  async deleteEmploye(id: string, organisationId: string) {
    await this.findOneEmploye(id, organisationId);
    await this.prisma.employe.delete({ where: { id } });
    return { message: 'Employé supprimé avec succès' };
  }

  async getFichesPaie(employeId: string, organisationId: string) {
    await this.assertEmployeDansOrganisation(employeId, organisationId);

    return this.prisma.fichePaie.findMany({
      where: { employeId },
      orderBy: { periode: 'desc' },
    });
  }

  async genererFichePaie(
    employeId: string,
    organisationId: string,
    periode: string,
    dto: GenererFichePaieDto,
  ) {
    const employe = await this.assertEmployeDansOrganisation(employeId, organisationId);

    const existing = await this.prisma.fichePaie.findUnique({
      where: { employeId_periode: { employeId, periode } },
    });
    if (existing) {
      throw new BadRequestException(`Une fiche de paie pour la période ${periode} existe déjà`);
    }

    const salaireBase = Number(employe.salaireBase ?? 0);
    const primes = dto.primes ?? 0;
    const deductions = dto.deductions ?? 0;
    const cotisationsSociales = dto.cotisationsSociales ?? 0;
    const impots = dto.impots ?? 0;

    const salaireBrut = salaireBase + primes - deductions;
    const salaireNet = salaireBrut - cotisationsSociales - impots;

    return this.prisma.fichePaie.create({
      data: {
        employeId,
        periode,
        salaireBase,
        primes,
        deductions,
        salaireBrut,
        cotisationsSociales,
        impots,
        salaireNet,
        datePaiement: dto.datePaiement ? new Date(dto.datePaiement) : undefined,
        statut: 'BROUILLON',
      },
    });
  }

  async validerFichePaie(id: string, organisationId: string) {
    const fiche = await this.prisma.fichePaie.findFirst({
      where: { id, employe: { organisationId } },
    });
    if (!fiche) throw new NotFoundException(`Fiche de paie ${id} introuvable`);
    if (fiche.statut === 'VALIDE') {
      throw new BadRequestException('Cette fiche de paie est déjà validée');
    }

    return this.prisma.fichePaie.update({
      where: { id },
      data: { statut: 'VALIDE' },
    });
  }

  async getConges(employeId: string, organisationId: string) {
    await this.assertEmployeDansOrganisation(employeId, organisationId);

    return this.prisma.conge.findMany({
      where: { employeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Congés de l'utilisateur connecté, déduits du jeton (aucun `:id` accepté). */
  async getMesConges(user: { email?: string; organisationId: string }) {
    const employe = await this.resoudreEmployeCourant(user);

    const conges = await this.prisma.conge.findMany({
      where: { employeId: employe.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      employe: {
        id: employe.id,
        matricule: employe.matricule,
        nom: employe.nom,
        prenom: employe.prenom,
        poste: employe.poste,
      },
      conges,
    };
  }

  /**
   * Dépôt d'une demande pour un tiers : réservé aux RH côté contrôleur.
   * L'appartenance de l'employé à l'organisation du jeton est vérifiée ici.
   */
  async demanderConge(employeId: string, organisationId: string, dto: DemanderCongeDto) {
    await this.assertEmployeDansOrganisation(employeId, organisationId);
    return this.creerDemandeConge(employeId, dto);
  }

  /** Self-service : l'employé est déduit du jeton, jamais du corps de requête. */
  async demanderMonConge(
    user: { email?: string; organisationId: string },
    dto: DemanderCongeDto,
  ) {
    const employe = await this.resoudreEmployeCourant(user);
    return this.creerDemandeConge(employe.id, dto);
  }

  /** Validation métier commune aux deux points d'entrée. */
  private async creerDemandeConge(employeId: string, dto: DemanderCongeDto) {
    const dateDebut = new Date(dto.dateDebut);
    const dateFin = new Date(dto.dateFin);

    if (Number.isNaN(dateDebut.getTime()) || Number.isNaN(dateFin.getTime())) {
      throw new BadRequestException('Dates de congé invalides');
    }
    if (dateFin.getTime() < dateDebut.getTime()) {
      throw new BadRequestException(
        'La date de fin doit être postérieure ou égale à la date de début',
      );
    }

    // Chevauchement avec un congé DÉJÀ APPROUVÉ (deux intervalles se croisent
    // si debutA <= finB et finA >= debutB).
    const chevauchement = await this.prisma.conge.findFirst({
      where: {
        employeId,
        statut: 'APPROUVE',
        dateDebut: { lte: dateFin },
        dateFin: { gte: dateDebut },
      },
    });
    if (chevauchement) {
      throw new BadRequestException(
        'Un congé déjà approuvé chevauche la période demandée',
      );
    }

    const jours =
      dto.nombreJours != null && dto.nombreJours > 0
        ? dto.nombreJours
        : Math.floor((dateFin.getTime() - dateDebut.getTime()) / 86_400_000) + 1;

    return this.prisma.conge.create({
      data: {
        employeId,
        type: dto.type,
        dateDebut,
        dateFin,
        nombreJours: jours,
        motif: dto.motif,
        // Statut initial imposé côté serveur : une demande ne peut pas
        // s'auto-approuver, quel que soit le corps envoyé.
        statut: 'EN_ATTENTE',
      },
    });
  }

  async approuverConge(id: string, organisationId: string) {
    const conge = await this.getCongeDansOrganisation(id, organisationId);
    if (conge.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Ce congé ne peut plus être approuvé');
    }

    return this.prisma.conge.update({ where: { id }, data: { statut: 'APPROUVE' } });
  }

  async rejeterConge(id: string, organisationId: string) {
    const conge = await this.getCongeDansOrganisation(id, organisationId);
    if (conge.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Ce congé ne peut plus être rejeté');
    }

    return this.prisma.conge.update({ where: { id }, data: { statut: 'REJETE' } });
  }

  private async getCongeDansOrganisation(id: string, organisationId: string) {
    const conge = await this.prisma.conge.findFirst({
      where: { id, employe: { organisationId } },
    });
    if (!conge) throw new NotFoundException(`Congé ${id} introuvable`);
    return conge;
  }

  async findAllVolontaires(
    organisationId: string,
    params: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { organisationId };

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.volontaire.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.volontaire.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createVolontaire(organisationId: string, dto: CreateVolontaireDto) {
    return this.prisma.volontaire.create({ data: { ...dto, organisationId } as any });
  }

  async getStats(organisationId: string) {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalEmployes, enConge, totalVolontaires, employes] = await Promise.all([
      this.prisma.employe.count({ where: { organisationId, actif: true } }),
      this.prisma.conge.count({
        where: {
          employe: { organisationId },
          statut: 'APPROUVE',
          dateDebut: { lte: now },
          dateFin: { gte: now },
        },
      }),
      this.prisma.volontaire.count({ where: { organisationId, actif: true } }),
      this.prisma.employe.findMany({
        where: { organisationId, actif: true },
        select: { salaireBase: true },
      }),
    ]);

    const masseSalariale = employes.reduce((sum, e) => sum + Number(e.salaireBase ?? 0), 0);

    return { totalEmployes, enConge, totalVolontaires, masseSalariale };
  }
}
