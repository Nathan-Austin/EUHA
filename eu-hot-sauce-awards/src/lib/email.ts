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
const emailBanner = '<div style="background-color: #fabf14; padding: 20px 0; text-align: center;"><img src="https://heatawards.eu/cropped-banner-website.png" alt="European Hot Sauce Awards" style="max-width: 600px; width: 100%; height: auto;" /></div>';

export const emailTemplates = {
  supplierPaymentConfirmation: (brandName: string, entryCount: number, amount: string) => ({
    subject: 'EU Hot Sauce Awards - Payment Confirmed',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Payment Confirmed!</h1>
        <p>Dear ${brandName},</p>
        <p>Thank you for your payment. Your ${entryCount} sauce ${entryCount > 1 ? 'entries have' : 'entry has'} been confirmed.</p>
        <p><strong>Amount paid:</strong> €${amount}</p>

        <div style="background-color: #fff3cd; border: 2px solid #ff4d00; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #ff4d00; margin-top: 0;">📦 Shipping Requirements</h3>
          <ul style="margin: 10px 0;">
            <li><strong>Required:</strong> 2 bottles of each sauce for judging</li>
            <li><strong>Optional:</strong> Promotional stickers (we'll hand them out at Chili Fest)</li>
            <li><strong>Optional:</strong> 3rd bottle (we'll sell it at Chili Fest for charity)</li>
          </ul>
        </div>

        <div style="background-color: #f8f9fa; border-left: 4px solid #ff4d00; padding: 15px; margin: 20px 0;">
          <h3 style="color: #ff4d00; margin-top: 0;">📍 Shipping Address</h3>
          <p style="margin: 5px 0; font-weight: bold;">EUROPEAN HOT SAUCE AWARDS</p>
          <p style="margin: 5px 0;">CBS Foods GmbH</p>
          <p style="margin: 5px 0;">Ossastr 21A</p>
          <p style="margin: 5px 0;">12045 Berlin, Neukölln</p>
          <p style="margin: 5px 0;">Germany</p>
        </div>

        <h2 style="color: #ff4d00;">Next Steps:</h2>
        <ol>
          <li><strong>Download the packing sheet:</strong> <a href="https://heatawards.eu/shipping-form.pdf" style="color: #ff4d00;">Download PDF</a></li>
          <li>Complete the packing sheet and include it with your shipment</li>
          <li>Ship 2 bottles of each sauce to the address above</li>
          <li>Log in to your dashboard to submit tracking information</li>
          <li>We'll notify you when your package is received</li>
        </ol>

        <p><strong>Important:</strong> Samples must arrive by 28 February 2026</p>

        <p>You can log in anytime at: <a href="https://heatawards.eu/login" style="color: #ff4d00;">https://heatawards.eu/login</a></p>

        <p>Questions? Contact us at heataward@gmail.com</p>
      </div>
    `,
    text: `Payment Confirmed! Dear ${brandName}, thank you for your payment. Your ${entryCount} sauce ${entryCount > 1 ? 'entries have' : 'entry has'} been confirmed. IMPORTANT: Ship 2 bottles of each sauce to: EUROPEAN HOT SAUCE AWARDS, CBS Foods GmbH, Ossastr 21A, 12045 Berlin, Neukölln, Germany. Download packing sheet at https://heatawards.eu/shipping-form.pdf`,
  }),

  supplierTrackingConfirmation: (brandName: string, trackingNumber: string, postalService: string) => ({
    subject: 'EU Hot Sauce Awards - Tracking Information Received',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Tracking Information Received</h1>
        <p>Dear ${brandName},</p>
        <p>We've received your tracking information:</p>
        <ul>
          <li><strong>Tracking Number:</strong> ${trackingNumber}</li>
          <li><strong>Postal Service:</strong> ${postalService}</li>
        </ul>

        <p>We'll send you a confirmation email once your package arrives.</p>

        <p>Track your shipment status anytime at: <a href="https://heatawards.eu/dashboard" style="color: #ff4d00;">https://heatawards.eu/dashboard</a></p>
      </div>
    `,
    text: `Tracking Information Received. Dear ${brandName}, we've received your tracking: ${trackingNumber} via ${postalService}.`,
  }),

  supplierPackageReceived: (brandName: string, sauceNames: string[]) => ({
    subject: 'EU Hot Sauce Awards - Package Received!',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Package Received!</h1>
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
      </div>
    `,
    text: `Package Received! Dear ${brandName}, your sauce package has been received and is being prepared for judging.`,
  }),

  judgeRegistrationConfirmation: (name: string, judgeType: 'pro' | 'community') => ({
    subject: 'EU Hot Sauce Awards - Judge Registration Received',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Welcome to the EU Hot Sauce Awards!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for registering as a judge for the EU Hot Sauce Awards.</p>

        <p><strong>Judge Type:</strong> ${judgeType === 'pro' ? 'Professional Judge' : 'Community Judge'}</p>

        ${judgeType === 'community' ? `
        <h2 style="color: #ff4d00;">Next Steps:</h2>
        <ol>
          <li>Complete payment to confirm your judging spot</li>
          <li>Check your email for a login link</li>
          <li>Access your dashboard to view judging details</li>
        </ol>
        ` : `
        <h2 style="color: #ff4d00;">Next Steps:</h2>
        <ol>
          <li>We will review your registration</li>
          <li>Check your email for a login link</li>
          <li>Access your dashboard when judging begins</li>
        </ol>
        `}

        <p>You can log in anytime at: <a href="https://heatawards.eu/login" style="color: #ff4d00;">https://heatawards.eu/login</a></p>

        <p>Questions? Contact us at heataward@gmail.com</p>
      </div>
    `,
    text: `Welcome to the EU Hot Sauce Awards! Thank you for registering as a ${judgeType === 'pro' ? 'Professional' : 'Community'} Judge.`,
  }),

  judgePaymentConfirmation: (name: string) => ({
    subject: 'EU Hot Sauce Awards - Payment Confirmed',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Payment Confirmed!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for your payment. Your spot as a Community Judge has been confirmed!</p>

        <h2 style="color: #ff4d00;">Next Steps:</h2>
        <ol>
          <li>Log in to your dashboard</li>
          <li>Review judging guidelines and categories</li>
          <li>We'll notify you when judging begins</li>
        </ol>

        <p>You can log in anytime at: <a href="https://heatawards.eu/login" style="color: #ff4d00;">https://heatawards.eu/login</a></p>

        <p>Questions? Contact us at heataward@gmail.com</p>
      </div>
    `,
    text: `Payment Confirmed! Thank you for your payment. Your spot as a Community Judge has been confirmed.`,
  }),

  supplier2026Invitation: (brandName: string) => ({
    subject: 'Join Us Again - EU Hot Sauce Awards 2026 Now Open!',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">We'd Love to See You Back in 2026!</h1>
        <p>Dear ${brandName},</p>
        <p>Thank you for being part of the European Hot Sauce Awards community. We're excited to announce that entries for the 2026 competition are now open!</p>

        <h2 style="color: #ff4d00;">Why Enter Again?</h2>
        <ul>
          <li>Showcase your latest creations to Europe's spice-loving community</li>
          <li>Gain valuable feedback from professional and community judges</li>
          <li>Increase brand visibility and credibility in the European market</li>
          <li>Network with fellow hot sauce makers and industry professionals</li>
        </ul>

        <h2 style="color: #ff4d00;">Important Dates:</h2>
        <ul>
          <li><strong>Registration Deadline:</strong> January 31, 2026</li>
          <li><strong>Samples Deadline:</strong> February 28, 2026</li>
          <li><strong>Judging Period:</strong> March 2026</li>
          <li><strong>Results Announcement:</strong> April 2026</li>
        </ul>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://heatawards.eu/apply/supplier" style="background-color: #ff4d00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Enter Your Sauces Now</a>
        </p>

        <p>Have questions? We're here to help at heataward@gmail.com</p>

        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
          You're receiving this email because you participated in a previous EU Hot Sauce Awards competition. If you'd prefer not to receive these invitations, please reply and let us know.
        </p>
      </div>
    `,
    text: `Dear ${brandName}, entries for the EU Hot Sauce Awards 2026 are now open! Enter your sauces at https://heatawards.eu/apply/supplier. Registration deadline: January 31, 2026. Samples deadline: February 28, 2026.`,
  }),

  judge2026Invitation: (name: string, judgeType: string) => ({
    subject: 'Be a Judge Again - EU Hot Sauce Awards 2026!',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Your Expertise is Needed in 2026!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for your valuable contribution as a ${judgeType === 'pro' ? 'Professional' : 'Community'} Judge in past EU Hot Sauce Awards competitions. We'd be honored to have you back for the 2026 awards!</p>

        <h2 style="color: #ff4d00;">Why Judge Again?</h2>
        <ul>
          <li>Taste and evaluate Europe's finest hot sauces before anyone else</li>
          <li>Help shape the future of the European hot sauce industry</li>
          <li>Connect with fellow spice enthusiasts and industry professionals</li>
          <li>Be part of the most prestigious hot sauce competition in Europe</li>
        </ul>

        <h2 style="color: #ff4d00;">What to Expect:</h2>
        <ul>
          <li><strong>Judging Period:</strong> March 2026</li>
          <li><strong>Format:</strong> Blind tasting with standardized scoring criteria</li>
          <li><strong>Commitment:</strong> Approximately 2-4 hours of your time</li>
          ${judgeType === 'community' ? '<li><strong>Entry Fee:</strong> Small contribution to cover logistics and samples</li>' : '<li><strong>No fees</strong> for professional judges</li>'}
        </ul>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://heatawards.eu/apply/judge" style="background-color: #ff4d00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Register to Judge in 2026</a>
        </p>

        <p><strong>Application Deadline:</strong> February 15, 2026</p>

        <p>Questions? Contact us at heataward@gmail.com</p>

        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
          You're receiving this email because you judged in a previous EU Hot Sauce Awards competition. If you'd prefer not to receive these invitations, please reply and let us know.
        </p>
      </div>
    `,
    text: `Dear ${name}, we'd love to have you back as a ${judgeType === 'pro' ? 'Professional' : 'Community'} Judge for the EU Hot Sauce Awards 2026! Register at https://heatawards.eu/apply/judge. Application deadline: February 15, 2026.`,
  }),
};
