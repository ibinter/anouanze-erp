import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('EMAIL_FROM', 'no-reply@anouanze.org');

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (err) {
      this.logger.error(`Échec envoi email à ${options.to}: ${(err as Error).message}`);
      throw new InternalServerErrorException(`Échec envoi email : ${(err as Error).message}`);
    }
  }

  async sendWelcome(to: string, nom: string, organisationNom: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Bienvenue dans ${organisationNom}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#146C43">Bienvenue, ${nom} !</h2>
          <p>Votre compte a été créé avec succès sur la plateforme <strong>${organisationNom}</strong>.</p>
          <p>Vous pouvez désormais vous connecter et accéder à toutes les fonctionnalités disponibles.</p>
          <hr style="border:1px solid #eee"/>
          <p style="color:#888;font-size:12px">ANOUANZÊ ERP — Plateforme de gestion pour ONG et associations africaines</p>
        </div>
      `,
    });
  }

  async sendPasswordReset(to: string, nom: string, resetUrl: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#146C43">Réinitialisation du mot de passe</h2>
          <p>Bonjour <strong>${nom}</strong>,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${resetUrl}" style="background:#146C43;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color:#888;font-size:12px">Ce lien expire dans 1 heure. Si vous n'avez pas effectué cette demande, ignorez cet email.</p>
        </div>
      `,
    });
  }

  async sendCotisationReminder(
    to: string,
    nom: string,
    montant: number,
    echeance: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Rappel de cotisation',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#F28C25">Rappel de cotisation</h2>
          <p>Bonjour <strong>${nom}</strong>,</p>
          <p>Nous vous rappelons que votre cotisation de <strong>${montant.toLocaleString('fr-FR')} FCFA</strong> est due le <strong>${echeance}</strong>.</p>
          <p>Merci de procéder au règlement dans les meilleurs délais.</p>
          <hr style="border:1px solid #eee"/>
          <p style="color:#888;font-size:12px">ANOUANZÊ ERP</p>
        </div>
      `,
    });
  }

  async sendRecuDon(
    to: string,
    donateur: { nom: string; prenom?: string },
    don: { montant?: number; dateDon: Date; numeroRecu?: string; type: string },
  ): Promise<void> {
    const nomComplet = [donateur.prenom, donateur.nom].filter(Boolean).join(' ');

    await this.sendEmail({
      to,
      subject: `Reçu de don ${don.numeroRecu ?? ''}`.trim(),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#146C43">Reçu de don</h2>
          <p>Cher/Chère <strong>${nomComplet}</strong>,</p>
          <p>Nous avons bien reçu votre don et vous en remercions sincèrement.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr style="background:#f5f5f5">
              <td style="padding:10px;border:1px solid #ddd">Numéro de reçu</td>
              <td style="padding:10px;border:1px solid #ddd"><strong>${don.numeroRecu ?? 'N/A'}</strong></td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #ddd">Type de don</td>
              <td style="padding:10px;border:1px solid #ddd">${don.type}</td>
            </tr>
            <tr style="background:#f5f5f5">
              <td style="padding:10px;border:1px solid #ddd">Montant</td>
              <td style="padding:10px;border:1px solid #ddd">${don.montant != null ? don.montant.toLocaleString('fr-FR') + ' FCFA' : 'Don en nature'}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #ddd">Date</td>
              <td style="padding:10px;border:1px solid #ddd">${new Date(don.dateDon).toLocaleDateString('fr-FR')}</td>
            </tr>
          </table>
          <p>Merci pour votre générosité !</p>
          <hr style="border:1px solid #eee"/>
          <p style="color:#888;font-size:12px">ANOUANZÊ ERP</p>
        </div>
      `,
    });
  }
}
