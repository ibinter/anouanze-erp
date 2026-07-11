import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { ChangerMotDePasseDto } from './dto/changer-mot-de-passe.dto';
import { RoleUtilisateur } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UtilisateursService {
  constructor(private readonly prisma: PrismaService) {}

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
