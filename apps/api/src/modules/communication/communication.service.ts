import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsGateway } from '../../common/notifications/notifications.gateway';
import { EmailService } from '../../common/email/email.service';
import { EnvoyerNotificationDto } from './dto/envoyer-notification.dto';
import { EnvoyerEmailMasseDto } from './dto/envoyer-email-masse.dto';
import { v4 as uuidv4 } from 'uuid';

interface NotificationRow {
  id: string;
  organisation_id: string;
  utilisateur_id: string;
  titre: string;
  message: string;
  type: string | null;
  lien: string | null;
  lue: boolean;
  created_at: Date;
}

@Injectable()
export class CommunicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly emailService: EmailService,
  ) {}

  private async ensureTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        organisation_id TEXT NOT NULL,
        utilisateur_id TEXT NOT NULL,
        titre TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT,
        lien TEXT,
        lue BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
  }

  async envoyerNotification(orgId: string, dto: EnvoyerNotificationDto) {
    await this.ensureTable();

    let utilisateurIds = dto.destinatairesIds ?? [];

    if (!utilisateurIds.length) {
      const membres = await this.prisma.utilisateurOrganisation.findMany({
        where: { organisationId: orgId, actif: true },
        select: { utilisateurId: true },
      });
      utilisateurIds = membres.map((m) => m.utilisateurId);
    }

    const ids: string[] = [];
    for (const uid of utilisateurIds) {
      const id = uuidv4();
      ids.push(id);
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO notifications (id, organisation_id, utilisateur_id, titre, message, type, lien)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        id,
        orgId,
        uid,
        dto.titre,
        dto.message,
        dto.type ?? null,
        dto.lien ?? null,
      );
      this.notificationsGateway.sendToUser(uid, 'notification', {
        id,
        titre: dto.titre,
        message: dto.message,
        type: dto.type,
        lien: dto.lien,
      });
    }

    return { sent: ids.length };
  }

  async envoyerEmailMasse(orgId: string, dto: EnvoyerEmailMasseDto) {
    const results = await Promise.allSettled(
      dto.destinataires.map((to) =>
        this.emailService.sendEmail({ to, subject: dto.sujet, html: dto.contenuHtml }),
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { sent, failed, total: dto.destinataires.length };
  }

  async getNotifications(userId: string, orgId: string) {
    await this.ensureTable();
    const rows = await this.prisma.$queryRawUnsafe<NotificationRow[]>(
      `SELECT * FROM notifications
       WHERE utilisateur_id = $1 AND organisation_id = $2
       ORDER BY lue ASC, created_at DESC
       LIMIT 100`,
      userId,
      orgId,
    );
    return rows;
  }

  async marquerLue(notificationId: string, userId: string) {
    await this.ensureTable();
    await this.prisma.$executeRawUnsafe(
      `UPDATE notifications SET lue = true WHERE id = $1 AND utilisateur_id = $2`,
      notificationId,
      userId,
    );
    return { success: true };
  }

  async getAnnonces(orgId: string) {
    const evenements = await this.prisma.evenement.findMany({
      where: { organisationId: orgId, statut: 'PLANIFIE', inscription: true },
      orderBy: { dateDebut: 'asc' },
      take: 10,
    });
    return evenements;
  }
}
