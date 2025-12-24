import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sends credentials to a new user.
   * @param user The user's basic info.
   * @param credentials The user's credentials.
   */
  async sendUserCredentials(
    user: { email: string; name: string },
    credentials: { email: string; password?: string },
  ) {
    const platformUrl = this.configService.get('FRONTEND_URL');
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Vos identifiants de connexion pour JOBS 2026',
      template: './credentials',
      context: {
        name: user.name,
        email: credentials.email,
        password: credentials.password,
        platformUrl,
      },
    });
  }

  /**
   * Sends a formation confirmation email.
   * @param user The user's basic info.
   * @param details The formation details.
   */
  async sendFormationConfirmation(
    user: { email: string; name: string },
    details: {
      formationName: string;
      formateurName: string;
      dateTime: string;
    },
  ) {
    const platformUrl = this.configService.get('FRONTEND_URL');
    await this.mailerService.sendMail({
      to: user.email,
      subject: `Confirmation de votre formation : ${details.formationName}`,
      template: './formation-confirmed',
      context: {
        name: user.name,
        formationName: details.formationName,
        formateurName: details.formateurName,
        dateTime: details.dateTime,
        platformUrl,
      },
    });
  }

  /**
   * Sends a formation confirmation email.
   * @param user The user's basic info.
   * @param details The formation details.
   */
  async sendFormationAssigned(
    user: { email: string; name: string },
    details: {
      formationName: string;
      formateurName: string;
      startDate: string;
    },
  ) {
    const platformUrl = this.configService.get('FRONTEND_URL');
    await this.mailerService.sendMail({
      to: user.email,
      subject: `Nouvelle formation assignée : ${details.formationName}`,
      template: './formateur-assigned', 
      context: {
        name: user.name,
        formationName: details.formationName,
        formateurName: details.formateurName,
        startDate: details.startDate,
        platformUrl,
      },
    });
  }
  

  /**
   * Sends an invitation to a JE to set up their account.
   * @param je The JE's info.
   * @param token The invitation token.
   */
  async sendJeInvitation(je: { email: string; name: string }, token: string) {
    const platformUrl = this.configService.get('FRONTEND_URL');
    const url = `${platformUrl}/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: je.email,
      subject: 'Invitation à rejoindre l\'espace JE - JOBS 2026',
      template: './invitation',
      context: {
        name: je.name,
        url,
        platformUrl,
      },
    });
  }

  /**
   * Sends a verification email to a new participant.
   * @param user The user's info.
   * @param token The verification token.
   */
  async sendVerificationEmail(user: { email: string; name: string }, token: string) {
    const platformUrl = this.configService.get('FRONTEND_URL');
    const url = `${platformUrl}/auth/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Vérifiez votre adresse email - JOBS 2026',
      template: './verification',
      context: {
        name: user.name,
        url,
        platformUrl,
      },
    });
  }

  /**
   * Sends an email to a JE when zoning is open.
   * @param je The JE's info.
   */
  async sendZoningOpenEmail(je: { email: string; name: string }) {
    const platformUrl = this.configService.get('FRONTEND_URL');

    await this.mailerService.sendMail({
      to: je.email,
      subject: 'Ouverture du Zoning - JOBS 2026',
      template: './zoning-open',
      context: {
        jeName: je.name,
        platformUrl,
      },
    });
  }

  /**
   * Sends an invoice email to a JE.
   * @param je The JE's info.
   * @param invoicePath Path to the invoice file (optional if attachment logic is handled differently).
   */
  async sendInvoiceEmail(je: { email: string; name: string }, invoicePath?: string) {
    const platformUrl = this.configService.get('FRONTEND_URL');

    await this.mailerService.sendMail({
      to: je.email,
      subject: 'Votre Facture - JOBS 2026',
      template: './invoice',
      context: {
        jeName: je.name,
        platformUrl,
      },
      attachments: invoicePath ? [{
        path: invoicePath,
        filename: 'Facture_JOBS_2026.pdf',
      }] : [],
    });
  }

  /**
   * Sends a password reset email.
   * @param user The user's basic info.
   * @param token The password reset token.
   */
  async sendPasswordResetEmail(user: { email: string; name: string }, token: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe - JOBS 2026',
      template: './password-reset',
      context: {
        name: user.name,
        resetUrl,
      },
    });
  }

  /**
   * Sends a contact form submission to the admin.
   * @param contactData The contact form data
   */
  async sendContactEmail(contactData: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    userRole?: string;
    organization?: string;
  }) {

    console.log('Sending contact email with data:', contactData);
    // const adminEmail = this.configService.get('ADMIN_EMAIL') || 'admin@jobs2026.com';
    
    const adminEmail = 'belgacemyassin46@gmail.com';
    await this.mailerService.sendMail({
      to: adminEmail,
      subject: contactData.subject || 'Nouveau message de contact - JOBS 2026',
      template: './contact',
      context: {
        ...contactData,
      },
    });
  }

  async sendGenericEmail(to: string, subject: string, text: string, html: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
      html,
    });
  }
}