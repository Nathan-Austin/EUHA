// Email service for sending transactional emails
// This is a placeholder implementation - configure with your preferred email service

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
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Placeholder implementation
  // Replace with actual email service (nodemailer, Resend, SendGrid, etc.)

  console.log('📧 Email would be sent:', {
    to: options.to,
    subject: options.subject,
    // Don't log full HTML for security
  });

  // TODO: Implement actual email sending
  // Example with nodemailer:
  /*
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  */
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

      <p>Questions? Contact us at support@heatawards.eu</p>
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
};
