import nodemailer, { Transporter } from 'nodemailer';

// Email service for sending transactional emails configured via SMTP environment variables

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using configured email service
 * TODO: Configure with Gmail SMTP or preferred transactional email service
 *
 * For Gmail SMTP, you'll need:
 * - SMTP_HOST=smtp.gmail.com
 * - SMTP_PORT=587
 * - SMTP_USER=your-email@gmail.com
 * - SMTP_PASS=your-app-specific-password
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    const missing = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'].filter(
      key => !process.env[key]
    );

    if (missing.length > 0) {
      throw new Error(`Missing required SMTP configuration: ${missing.join(', ')}`);
    }

    const portNumber = Number(SMTP_PORT);

    if (!Number.isInteger(portNumber) || portNumber <= 0) {
      throw new Error('SMTP_PORT must be a positive integer');
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: portNumber,
      secure: portNumber === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporterInstance = getTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!fromAddress) {
    throw new Error('SMTP_FROM or SMTP_USER must be defined to send email');
  }

  await transporterInstance.sendMail({
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? undefined,
  });
}

// Email templates
export const emailTemplates = {
  supplierPaymentConfirmation: (brandName: string, entryCount: number, amount: string) => ({
    subject: 'EU Hot Sauce Awards - Payment Confirmed',
    html: `
      <h1>Payment Confirmed!</h1>
      <p>Dear ${brandName},</p>
      <p>Thank you for your payment. Your ${entryCount} sauce ${entryCount > 1 ? 'entries have' : 'entry has'} been confirmed.</p>
      <p><strong>Amount paid:</strong> €${amount}</p>

      <h2>Next Steps:</h2>
      <ol>
        <li>Log in to your dashboard to submit tracking information</li>
        <li>Ship your sauce(s) to the judging location</li>
        <li>We'll notify you when your package is received</li>
      </ol>

      <p>You can log in anytime at: <a href="https://awards.heatawards.eu/login">https://awards.heatawards.eu/login</a></p>

      <p>Questions? Contact us at heataward@gmail.com</p>
    `,
    text: `Payment Confirmed! Dear ${brandName}, thank you for your payment. Your ${entryCount} sauce ${entryCount > 1 ? 'entries have' : 'entry has'} been confirmed.`,
  }),

  supplierTrackingConfirmation: (brandName: string, trackingNumber: string, postalService: string) => ({
    subject: 'EU Hot Sauce Awards - Tracking Information Received',
    html: `
      <h1>Tracking Information Received</h1>
      <p>Dear ${brandName},</p>
      <p>We've received your tracking information:</p>
      <ul>
        <li><strong>Tracking Number:</strong> ${trackingNumber}</li>
        <li><strong>Postal Service:</strong> ${postalService}</li>
      </ul>

      <p>We'll send you a confirmation email once your package arrives.</p>

      <p>Track your shipment status anytime at: <a href="https://awards.heatawards.eu/dashboard">https://awards.heatawards.eu/dashboard</a></p>
    `,
    text: `Tracking Information Received. Dear ${brandName}, we've received your tracking: ${trackingNumber} via ${postalService}.`,
  }),

  supplierPackageReceived: (brandName: string, sauceNames: string[]) => ({
    subject: 'EU Hot Sauce Awards - Package Received!',
    html: `
      <h1>Package Received!</h1>
      <p>Dear ${brandName},</p>
      <p>Great news! Your sauce package has been received and is being prepared for judging.</p>

      ${sauceNames.length > 0 ? `
      <p><strong>Sauces received:</strong></p>
      <ul>
        ${sauceNames.map(name => `<li>${name}</li>`).join('')}
      </ul>
      ` : ''}

      <p>Your sauces will be included in the blind judging process. We'll announce the results after the competition concludes.</p>

      <p>Thank you for participating in the EU Hot Sauce Awards!</p>
    `,
    text: `Package Received! Dear ${brandName}, your sauce package has been received and is being prepared for judging.`,
  }),

  judgeRegistrationConfirmation: (name: string, judgeType: 'pro' | 'community') => ({
    subject: 'EU Hot Sauce Awards - Judge Registration Received',
    html: `
      <h1>Welcome to the EU Hot Sauce Awards!</h1>
      <p>Dear ${name},</p>
      <p>Thank you for registering as a judge for the EU Hot Sauce Awards.</p>

      <p><strong>Judge Type:</strong> ${judgeType === 'pro' ? 'Professional Judge' : 'Community Judge'}</p>

      ${judgeType === 'community' ? `
      <h2>Next Steps:</h2>
      <ol>
        <li>Complete payment to confirm your judging spot</li>
        <li>Check your email for a login link</li>
        <li>Access your dashboard to view judging details</li>
      </ol>
      ` : `
      <h2>Next Steps:</h2>
      <ol>
        <li>We will review your registration</li>
        <li>Check your email for a login link</li>
        <li>Access your dashboard when judging begins</li>
      </ol>
      `}

      <p>You can log in anytime at: <a href="https://awards.heatawards.eu/login">https://awards.heatawards.eu/login</a></p>

      <p>Questions? Contact us at heataward@gmail.com</p>
    `,
    text: `Welcome to the EU Hot Sauce Awards! Thank you for registering as a ${judgeType === 'pro' ? 'Professional' : 'Community'} Judge.`,
  }),

  judgePaymentConfirmation: (name: string) => ({
    subject: 'EU Hot Sauce Awards - Payment Confirmed',
    html: `
      <h1>Payment Confirmed!</h1>
      <p>Dear ${name},</p>
      <p>Thank you for your payment. Your spot as a Community Judge has been confirmed!</p>

      <h2>Next Steps:</h2>
      <ol>
        <li>Log in to your dashboard</li>
        <li>Review judging guidelines and categories</li>
        <li>We'll notify you when judging begins</li>
      </ol>

      <p>You can log in anytime at: <a href="https://awards.heatawards.eu/login">https://awards.heatawards.eu/login</a></p>

      <p>Questions? Contact us at heataward@gmail.com</p>
    `,
    text: `Payment Confirmed! Thank you for your payment. Your spot as a Community Judge has been confirmed.`,
  }),
};
