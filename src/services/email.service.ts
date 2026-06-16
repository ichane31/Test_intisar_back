// services/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendContactNotification(data: {
    name: string;
    email?: string;
    phone: string;
    subject: string;
    message: string;
  }) {
    // Email à l'admin
    const adminMail = await this.transporter.sendMail({
      from: `"Site Intisar" <${process.env.SMTP_FROM}>`,
      to: process.env.ADMIN_EMAIL || 'admin@intisar.fr',
      subject: `[Contact] Nouvelle demande : ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #D4AF37; padding: 20px; text-align: center; color: white; }
            .content { padding: 20px; background: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #D4AF37; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nouvelle demande de contact</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nom complet :</div>
                <div>${data.name}</div>
              </div>
              ${
                data.email
                  ? `
              <div class="field">
                <div class="label">Email :</div>
                <div>${data.email}</div>
              </div>
              `
                  : ''
              }
              <div class="field">
                <div class="label">Téléphone :</div>
                <div>${data.phone}</div>
              </div>
              <div class="field">
                <div class="label">Sujet :</div>
                <div>${data.subject}</div>
              </div>
              <div class="field">
                <div class="label">Message :</div>
                <div style="white-space: pre-wrap;">${data.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé depuis le formulaire de contact du site Intisar.</p>
              <p>Pour répondre, utilisez les coordonnées ci-dessus.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Email de confirmation au client (si email fourni)
    if (data.email) {
      await this.transporter.sendMail({
        from: `"Intisar" <${process.env.SMTP_FROM}>`,
        to: data.email,
        subject: 'Confirmation de votre demande',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #D4AF37; padding: 20px; text-align: center; color: white; }
              .content { padding: 20px; background: #f9f9f9; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Confirmation de votre demande</h1>
              </div>
              <div class="content">
                <p>Bonjour ${data.name},</p>
                <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
                <p>Notre équipe va prendre connaissance de votre demande et vous répondra dans les plus brefs délais.</p>
                <hr style="margin: 20px 0;" />
                <p><strong>Récapitulatif de votre message :</strong></p>
                <p><strong>Sujet :</strong> ${data.subject}</p>
                <p><strong>Message :</strong></p>
                <p style="background: white; padding: 10px; border-radius: 5px;">${data.message}</p>
                <hr style="margin: 20px 0;" />
                <p>Pour toute urgence, vous pouvez nous contacter directement par téléphone au <strong>+33 1 23 45 67 89</strong>.</p>
                <p>Cordialement,<br />L'équipe Intisar</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Intisar - Tous droits réservés</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    return { success: true, messageId: adminMail.messageId };
  }

  async sendSupportReply(data: {
    to: string;
    clientName: string;
    subject: string;
    reply: string;
    requestId: string;
  }) {
    const replyDate = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Email au client
    await this.transporter.sendMail({
      from: `"Service Client Intisar" <${process.env.SMTP_FROM}>`,
      to: data.to,
      subject: `[Intisar] Réponse à votre demande : ${data.subject}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #D4AF37; padding: 20px; text-align: center; color: white; }
          .content { padding: 20px; background: #f9f9f9; }
          .reply-box { background: white; padding: 15px; border-left: 4px solid #D4AF37; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background: #D4AF37; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réponse à votre demande</h1>
          </div>
          <div class="content">
            <p>Bonjour ${data.clientName},</p>
            <p>Nous faisons suite à votre demande concernant :</p>
            <p><strong>Sujet :</strong> ${data.subject}</p>
            
            <div class="reply-box">
              <p><strong>Notre réponse :</strong></p>
              <p style="white-space: pre-wrap;">${data.reply}</p>
            </div>
            
            <p>Nous restons à votre disposition pour toute information complémentaire.</p>
            
            <p>
              <a href="${process.env.FRONTEND_URL}/suivi-demande?id=${data.requestId}" class="button">
                Suivre ma demande
              </a>
            </p>
            
            <hr style="margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Intisar - Tous droits réservés</p>
            <p>${process.env.COMPANY_ADDRESS || '123 Avenue de la République, 75011 Paris'}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });

    // Copie à l'admin pour archivage
    await this.transporter.sendMail({
      from: `"Intisar Support" <${process.env.SMTP_FROM}>`,
      to: process.env.ADMIN_EMAIL || 'admin@intisar.fr',
      subject: `[COPIE] Réponse envoyée à ${data.clientName}`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Copie de la réponse envoyée</h2>
        <p><strong>Client :</strong> ${data.clientName} (${data.to})</p>
        <p><strong>Sujet :</strong> ${data.subject}</p>
        <p><strong>Date :</strong> ${replyDate}</p>
        <div style="background: #f4f4f4; padding: 15px; margin: 15px 0;">
          <strong>Réponse :</strong>
          <p>${data.reply}</p>
        </div>
      </div>
    `,
    });

    return { success: true, messageId: data.requestId };
  }
}
