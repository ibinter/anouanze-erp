import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { ChangerMotDePasseDto } from './dto/changer-mot-de-passe.dto';
import { InviterUtilisateurDto } from './dto/inviter-utilisateur.dto';
import { RoleUtilisateur } from '@prisma/client';
import { construireMatricePermissions } from './permissions.matrice';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class UtilisateursService {
  private readonly logger = new Logger(UtilisateursService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async findAll() {
    return this.prisma.utilisateur.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        avatar: true,
        langue: true,
        actif: true,
        emailVerifie: true,
        deuxFacteurs: true,
        dernierLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        avatar: true,
        langue: true,
        actif: true,
        emailVerifie: true,
        deuxFacteurs: true,
        dernierLogin: true,
        createdAt: true,
        updatedAt: true,
        organisations: {
          include: { organisation: true },
        },
      },
    });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);
    return user;
  }

  async update(id: string, dto: UpdateUtilisateurDto) {
    await this.findOne(id);
    return this.prisma.utilisateur.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        avatar: true,
        langue: true,
        actif: true,
        updatedAt: true,
      },
    });
  }

  async changerMotDePasse(id: string, dto: ChangerMotDePasseDto) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);

    const valid = await bcrypt.compare(dto.ancienMotDePasse, user.motDePasseHash);
    if (!valid) {
      throw new BadRequestException('Ancien mot de passe incorrect');
    }

    const motDePasseHash = await bcrypt.hash(dto.nouveauMotDePasse, 12);
    await this.prisma.utilisateur.update({
      where: { id },
      data: { motDePasseHash },
    });

    return { message: 'Mot de passe modifié avec succès' };
  }

  async getOrganisations(id: string) {
    await this.findOne(id);
    return this.prisma.utilisateurOrganisation.findMany({
      where: { utilisateurId: id },
      include: { organisation: true },
    });
  }

  // ───────────────────────────────────────────────────────────────
  // Administration des membres d'une organisation (RBAC)
  // Toutes ces méthodes sont cloisonnées par l'organisationId du jeton.
  // ───────────────────────────────────────────────────────────────

  private assertOrganisation(organisationId?: string): string {
    if (!organisationId) {
      throw new ForbiddenException('Aucune organisation associée à ce compte');
    }
    return organisationId;
  }

  /** Liste les membres de l'organisation courante avec rôle, statut et dernière connexion. */
  async listerMembresOrganisation(organisationId?: string) {
    const orgId = this.assertOrganisation(organisationId);

    const liens = await this.prisma.utilisateurOrganisation.findMany({
      where: { organisationId: orgId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        actif: true,
        permissions: true,
        createdAt: true,
        utilisateur: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
            telephone: true,
            avatar: true,
            actif: true,
            emailVerifie: true,
            deuxFacteurs: true,
            dernierLogin: true,
            createdAt: true,
          },
        },
      },
    });

    return liens.map((lien) => ({
      id: lien.utilisateur.id,
      lienId: lien.id,
      email: lien.utilisateur.email,
      nom: lien.utilisateur.nom,
      prenom: lien.utilisateur.prenom,
      telephone: lien.utilisateur.telephone,
      avatar: lien.utilisateur.avatar,
      role: lien.role,
      permissions: lien.permissions,
      // actif = accès à CETTE organisation ET compte global actif
      actif: lien.actif && lien.utilisateur.actif,
      actifOrganisation: lien.actif,
      compteActif: lien.utilisateur.actif,
      emailVerifie: lien.utilisateur.emailVerifie,
      deuxFacteurs: lien.utilisateur.deuxFacteurs,
      dernierLogin: lien.utilisateur.dernierLogin,
      membreDepuis: lien.createdAt,
    }));
  }

  private async getLienOrganisation(utilisateurId: string, organisationId: string) {
    const lien = await this.prisma.utilisateurOrganisation.findUnique({
      where: {
        utilisateurId_organisationId: { utilisateurId, organisationId },
      },
      include: { utilisateur: { select: { id: true, email: true, nom: true, prenom: true } } },
    });
    if (!lien) {
      throw new NotFoundException(
        "Cet utilisateur ne fait pas partie de votre organisation",
      );
    }
    return lien;
  }

  /** Change le rôle d'un membre dans l'organisation courante. */
  async changerRoleDansOrganisation(
    utilisateurId: string,
    role: RoleUtilisateur,
    auteur: { id?: string; role?: RoleUtilisateur; organisationId?: string },
  ) {
    const orgId = this.assertOrganisation(auteur.organisationId);

    if (auteur.id === utilisateurId) {
      throw new BadRequestException(
        'Vous ne pouvez pas modifier votre propre rôle. Demandez à un autre administrateur.',
      );
    }

    // Seul un SUPER_ADMIN peut accorder ou retirer le rôle SUPER_ADMIN
    const lien = await this.getLienOrganisation(utilisateurId, orgId);
    const toucheSuperAdmin =
      role === RoleUtilisateur.SUPER_ADMIN || lien.role === RoleUtilisateur.SUPER_ADMIN;
    if (toucheSuperAdmin && auteur.role !== RoleUtilisateur.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Seul un super administrateur peut attribuer ou retirer le rôle SUPER_ADMIN',
      );
    }

    // Ne jamais laisser l'organisation sans administrateur
    if (
      (lien.role === RoleUtilisateur.ADMIN_ORGANISATION ||
        lien.role === RoleUtilisateur.SUPER_ADMIN) &&
      role !== RoleUtilisateur.ADMIN_ORGANISATION &&
      role !== RoleUtilisateur.SUPER_ADMIN
    ) {
      const nbAdmins = await this.prisma.utilisateurOrganisation.count({
        where: {
          organisationId: orgId,
          actif: true,
          role: {
            in: [RoleUtilisateur.ADMIN_ORGANISATION, RoleUtilisateur.SUPER_ADMIN],
          },
        },
      });
      if (nbAdmins <= 1) {
        throw new BadRequestException(
          "L'organisation doit conserver au moins un administrateur actif",
        );
      }
    }

    const maj = await this.prisma.utilisateurOrganisation.update({
      where: {
        utilisateurId_organisationId: { utilisateurId, organisationId: orgId },
      },
      data: { role },
      select: { utilisateurId: true, organisationId: true, role: true, actif: true },
    });

    return { ...maj, message: 'Rôle mis à jour' };
  }

  /** Active ou désactive l'accès d'un membre à l'organisation courante. */
  async changerStatutDansOrganisation(
    utilisateurId: string,
    actif: boolean,
    auteur: { id?: string; role?: RoleUtilisateur; organisationId?: string },
  ) {
    const orgId = this.assertOrganisation(auteur.organisationId);

    if (auteur.id === utilisateurId) {
      throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte');
    }

    const lien = await this.getLienOrganisation(utilisateurId, orgId);

    if (
      lien.role === RoleUtilisateur.SUPER_ADMIN &&
      auteur.role !== RoleUtilisateur.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Seul un super administrateur peut désactiver un compte super administrateur',
      );
    }

    if (
      !actif &&
      (lien.role === RoleUtilisateur.ADMIN_ORGANISATION ||
        lien.role === RoleUtilisateur.SUPER_ADMIN)
    ) {
      const nbAdmins = await this.prisma.utilisateurOrganisation.count({
        where: {
          organisationId: orgId,
          actif: true,
          role: {
            in: [RoleUtilisateur.ADMIN_ORGANISATION, RoleUtilisateur.SUPER_ADMIN],
          },
        },
      });
      if (nbAdmins <= 1) {
        throw new BadRequestException(
          "L'organisation doit conserver au moins un administrateur actif",
        );
      }
    }

    const maj = await this.prisma.utilisateurOrganisation.update({
      where: {
        utilisateurId_organisationId: { utilisateurId, organisationId: orgId },
      },
      data: { actif },
      select: { utilisateurId: true, role: true, actif: true },
    });

    // Couper les sessions actives lors d'une désactivation
    if (!actif) {
      await this.prisma.session.deleteMany({ where: { utilisateurId } });
    }

    return { ...maj, message: actif ? 'Compte activé' : 'Compte désactivé' };
  }

  /**
   * Invite un utilisateur dans l'organisation courante.
   * - compte inexistant  : création + envoi d'un lien de définition de mot de passe (24 h)
   * - compte existant    : rattachement à l'organisation (ou réactivation du lien)
   */
  async inviterDansOrganisation(
    dto: InviterUtilisateurDto,
    auteur: { id?: string; role?: RoleUtilisateur; organisationId?: string },
  ) {
    const orgId = this.assertOrganisation(auteur.organisationId);
    const email = dto.email.trim().toLowerCase();

    if (
      dto.role === RoleUtilisateur.SUPER_ADMIN &&
      auteur.role !== RoleUtilisateur.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Seul un super administrateur peut attribuer le rôle SUPER_ADMIN',
      );
    }

    const organisation = await this.prisma.organisation.findUnique({
      where: { id: orgId },
      select: { id: true, nom: true },
    });
    if (!organisation) throw new NotFoundException('Organisation introuvable');

    let utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email },
      select: { id: true, email: true, nom: true, prenom: true },
    });

    let nouveauCompte = false;
    let lienDefinitionMotDePasse: string | null = null;

    if (!utilisateur) {
      nouveauCompte = true;
      const motDePasseProvisoire = crypto.randomBytes(24).toString('hex');
      const motDePasseHash = await bcrypt.hash(motDePasseProvisoire, 12);
      const token = crypto.randomBytes(32).toString('hex');
      const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);

      utilisateur = await this.prisma.utilisateur.create({
        data: {
          email,
          motDePasseHash,
          nom: dto.nom?.trim() || email.split('@')[0],
          prenom: dto.prenom?.trim() || '',
          tokenReinit: token,
          tokenReinitExpire: expire,
        },
        select: { id: true, email: true, nom: true, prenom: true },
      });

      const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
      lienDefinitionMotDePasse = `${appUrl}/reinitialiser-mot-de-passe?token=${token}`;
    } else {
      const existant = await this.prisma.utilisateurOrganisation.findUnique({
        where: {
          utilisateurId_organisationId: {
            utilisateurId: utilisateur.id,
            organisationId: orgId,
          },
        },
      });
      if (existant && existant.actif) {
        throw new BadRequestException(
          'Cet utilisateur fait déjà partie de votre organisation',
        );
      }
    }

    await this.prisma.utilisateurOrganisation.upsert({
      where: {
        utilisateurId_organisationId: {
          utilisateurId: utilisateur.id,
          organisationId: orgId,
        },
      },
      update: { role: dto.role, actif: true },
      create: {
        utilisateurId: utilisateur.id,
        organisationId: orgId,
        role: dto.role,
        actif: true,
      },
    });

    // Envoi non bloquant — une panne SMTP ne doit pas annuler l'invitation
    const prenomOuNom = utilisateur.prenom || utilisateur.nom || 'Utilisateur';
    const envoi = lienDefinitionMotDePasse
      ? this.email.sendPasswordReset(email, prenomOuNom, lienDefinitionMotDePasse)
      : this.email.sendWelcome(email, prenomOuNom, organisation.nom);
    let emailEnvoye = true;
    await envoi.catch((err: Error) => {
      emailEnvoye = false;
      this.logger.warn(`Invitation ${email} : email non envoyé — ${err.message}`);
    });

    return {
      utilisateurId: utilisateur.id,
      email,
      role: dto.role,
      nouveauCompte,
      emailEnvoye,
      message: nouveauCompte
        ? emailEnvoye
          ? "Invitation envoyée : l'utilisateur doit définir son mot de passe sous 24 h"
          : "Compte créé, mais l'email d'invitation n'a pas pu être envoyé"
        : "Utilisateur rattaché à l'organisation",
    };
  }

  /** Matrice rôle × permissions réellement appliquée par l'API. */
  getMatricePermissions() {
    return construireMatricePermissions();
  }

  async assignerOrganisation(id: string, orgId: string, role: RoleUtilisateur) {
    await this.findOne(id);
    return this.prisma.utilisateurOrganisation.upsert({
      where: {
        utilisateurId_organisationId: {
          utilisateurId: id,
          organisationId: orgId,
        },
      },
      update: { role },
      create: {
        utilisateurId: id,
        organisationId: orgId,
        role,
      },
    });
  }
}
