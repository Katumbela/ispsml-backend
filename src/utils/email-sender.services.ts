/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { env } from '../config/env';


function sanitizeUrl(url: string): string {
  return url.startsWith('https://') ? url : '#';
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${env.frontBaseUrl}/password-reset/confirm?token=${token}`;
    const safeResetUrl = sanitizeUrl(resetUrl); // 🔥 Aplica a sanitização

    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperação de Senha',
      template: 'reset-password',
      context: {
        resetUrl: safeResetUrl,
      },
    });
  }

  async sendAdminInviteEmail(email: string, adminName: string, adminEmail: string) {
    const inviteUrl = `${env.frontBaseUrl}/admin-dashboard`;
    const safeInviteUrl = sanitizeUrl(inviteUrl); // 🔥 Aplica a sanitização

    await this.mailerService.sendMail({
      to: email,
      subject: 'Convite para ser Admin',
      template: 'admin-invite',
      context: {
        adminName,
        inviteUrl: safeInviteUrl,
        adminEmail,
      },
    });
  }
}
