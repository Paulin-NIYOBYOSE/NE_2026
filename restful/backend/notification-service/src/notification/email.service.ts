import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@fireextinguisher.com',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const subject = 'Welcome to Fire Extinguisher Management System';
    const html = `
      <h1>Welcome, ${firstName}!</h1>
      <p>Your account has been successfully created.</p>
      <p>You can now log in and manage fire extinguishers, schedule inspections, and more.</p>
      <p>Best regards,<br>Fire Extinguisher Management Team</p>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendInspectionReminder(email: string, inspectionDate: string, extinguisherId: string): Promise<boolean> {
    const subject = 'Inspection Reminder';
    const html = `
      <h1>Inspection Reminder</h1>
      <p>You have an inspection scheduled for <strong>${inspectionDate}</strong>.</p>
      <p>Extinguisher ID: ${extinguisherId}</p>
      <p>Please ensure you are prepared for the inspection.</p>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendExpiryAlert(email: string, serialNumber: string, expiryDate: string): Promise<boolean> {
    const subject = 'Fire Extinguisher Expiry Alert';
    const html = `
      <h1>Expiry Alert</h1>
      <p>Fire extinguisher <strong>${serialNumber}</strong> has expired or is about to expire.</p>
      <p>Expiry Date: ${expiryDate}</p>
      <p>Please schedule maintenance or replacement immediately.</p>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<boolean> {
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Use the following token to reset your password:</p>
      <p><strong>${resetToken}</strong></p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    return this.sendEmail(email, subject, html);
  }
}
