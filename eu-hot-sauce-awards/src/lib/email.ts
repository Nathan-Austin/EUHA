import nodemailer, { Transporter } from 'nodemailer';
import { COMPETITION_YEAR } from './config';
import { formatShippingAddressHtml, formatShippingAddressText } from './shipping';

// Email service for sending transactional emails configured via SMTP environment variables

export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer;
  contentType?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
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
      pool: true,        // reuse single authenticated connection across all sends
      maxConnections: 1, // one connection avoids concurrent auth issues with Gmail
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
    attachments: options.attachments,
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

        <div style="background-color: #f8f9fa; border-left: 4px solid #ff4d00; padding: 15px; margin: 20px 0;">
          <h3 style="color: #ff4d00; margin-top: 0;">📍 Shipping Address</h3>
          <p style="margin: 5px 0;">${formatShippingAddressHtml()}</p>
        </div>

        <h2 style="color: #ff4d00;">Next Steps:</h2>
        <ol>
          <li>See <a href="https://heatawards.eu/packing-sheet" style="color: #ff4d00;">heatawards.eu/packing-sheet</a> for full packing instructions and the packing sheet download</li>
          <li>Complete the packing sheet and include it with your shipment</li>
          <li>Ship your sauces to the address above</li>
          <li>Log in to your dashboard to submit tracking information</li>
          <li>We'll notify you when your package is received</li>
        </ol>

        <p>You can log in anytime at: <a href="https://heatawards.eu/login" style="color: #ff4d00;">https://heatawards.eu/login</a></p>

        <p>Questions? Contact us at heataward@gmail.com</p>
      </div>
    `,
    text: `Payment Confirmed! Dear ${brandName}, thank you for your payment. Your ${entryCount} sauce ${entryCount > 1 ? 'entries have' : 'entry has'} been confirmed. Ship your sauces to: ${formatShippingAddressText().replace(/\n/g, ', ')}. See https://heatawards.eu/packing-sheet for full packing instructions.`,
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
          <li>Log in at <a href="https://heatawards.eu/login" style="color: #ff4d00;">heatawards.eu/login</a> using your email</li>
          <li>Complete the €15 payment to confirm your judging spot</li>
          <li>After payment, you'll receive a dashboard access link via email</li>
          <li>Access your dashboard to view judging details and schedule</li>
        </ol>

        <div style="background-color: #fff3cd; border: 2px solid #ff4d00; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0;"><strong>Important:</strong> You'll need to complete payment before accessing your judge dashboard. Once payment is confirmed, we'll send you a secure login link.</p>
        </div>
        ` : `
        <h2 style="color: #ff4d00;">Next Steps:</h2>
        <ol>
          <li>We will review your professional credentials</li>
          <li>Once approved, you'll receive a login link via email</li>
          <li>Access your dashboard once the ${COMPETITION_YEAR} judging period is confirmed</li>
        </ol>

        <div style="background-color: #fff3cd; border: 2px solid #ff4d00; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0;"><strong>Note:</strong> Professional judge applications are reviewed on a rolling basis. We'll notify you of your approval status within 1-2 weeks.</p>
        </div>
        `}

        <p>Questions? Contact us at heataward@gmail.com</p>
      </div>
    `,
    text: `Welcome to the EU Hot Sauce Awards! Thank you for registering as a ${judgeType === 'pro' ? 'Professional' : 'Community'} Judge. ${judgeType === 'community' ? 'Log in at heatawards.eu/login to complete your €15 payment and confirm your spot.' : 'We will review your application and send you a login link once approved.'}`,
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

  supplierMagicLink: (brandName: string, magicLink: string) => ({
    subject: 'EU Hot Sauce Awards - Access Your Dashboard',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Welcome to Your Dashboard!</h1>
        <p>Dear ${brandName},</p>
        <p>Thank you for your payment! Your sauce entries have been confirmed and you can now access your supplier dashboard.</p>

        <div style="background-color: #fff3cd; border: 2px solid #ff4d00; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold;">Click the button below to securely access your dashboard:</p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="background-color: #ff4d00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Access Dashboard</a>
        </p>

        <p style="color: #666; font-size: 14px;"><em>This link will expire in 1 hour for security purposes.</em></p>

        <h2 style="color: #ff4d00;">What You Can Do:</h2>
        <ul>
          <li>View your submitted sauces and their status</li>
          <li>Submit shipping tracking information</li>
          <li>Track when your package is received</li>
          <li>View judging results when available</li>
        </ul>

        <p><strong>Important:</strong> Don't forget to ship your sauces — see <a href="https://heatawards.eu/packing-sheet" style="color: #ff4d00;">heatawards.eu/packing-sheet</a> for the address and packing instructions.</p>

        <p>Questions? Contact us at heataward@gmail.com</p>
      </div>
    `,
    text: `Welcome to your dashboard! Click this link to access: ${magicLink}. This link expires in 1 hour. Don't forget to ship your sauces — see https://heatawards.eu/packing-sheet for the address and packing instructions.`,
  }),

  proJudgeApproval: (name: string, magicLink: string) => ({
    subject: 'EU Hot Sauce Awards - Pro Judge Application Approved!',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Welcome to the Professional Judge Panel!</h1>
        <p>Dear ${name},</p>
        <p>Great news! Your application to serve as a Professional Judge for the EU Hot Sauce Awards 2026 has been approved.</p>

        <div style="background-color: #fff3cd; border: 2px solid #ff4d00; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold;">Click the button below to securely access your judge dashboard:</p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="background-color: #ff4d00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Access Judge Dashboard</a>
        </p>

        <p style="color: #666; font-size: 14px;"><em>This link will expire in 24 hours for security purposes.</em></p>
        <p style="color: #666; font-size: 14px;">Need another link later? Request a fresh one anytime at <a href="https://heatawards.eu/login" style="color: #ff4d00;">heatawards.eu/login</a>.</p>

        <h2 style="color: #ff4d00;">What's Next:</h2>
        <ul>
          <li>Review judging guidelines and scoring criteria in your dashboard</li>
          <li>Check for judging schedule updates and important announcements</li>
          <li>We'll confirm ${COMPETITION_YEAR} judging dates closer to the time</li>
        </ul>

        <p><strong>Important:</strong> As a professional judge, your expertise will help shape the future of the European hot sauce industry. We appreciate your participation!</p>

        <p>Questions? Contact us at heataward@gmail.com</p>
      </div>
    `,
    text: `Congratulations! Your Pro Judge application has been approved for the EU Hot Sauce Awards ${COMPETITION_YEAR}. Access your dashboard: ${magicLink}. This link expires in 24 hours. Need another link later? Visit https://heatawards.eu/login.`,
  }),
  judgeMagicLink: (name: string, magicLink: string) => ({
    subject: 'EU Hot Sauce Awards - Access Your Judge Dashboard',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Welcome to the Judge Panel!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for your payment! Your community judge seat has been confirmed and you can now access your judge dashboard.</p>

        <div style="background-color: #fff3cd; border: 2px solid #ff4d00; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold;">Click the button below to securely access your dashboard:</p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="background-color: #ff4d00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Access Judge Dashboard</a>
        </p>

        <p style="color: #666; font-size: 14px;"><em>This link will expire in 24 hours for security purposes.</em></p>
        <p style="color: #666; font-size: 14px;">Need another link later? Request a fresh one anytime at <a href="https://heatawards.eu/login" style="color: #ff4d00;">heatawards.eu/login</a>.</p>

        <h2 style="color: #ff4d00;">What's Next:</h2>
        <ul>
          <li>Review judging guidelines and scoring criteria</li>
          <li>Check your dashboard for judging schedule updates</li>
          <li>We'll notify you when the ${COMPETITION_YEAR} judging period is confirmed</li>
        </ul>

        <p><strong>Important:</strong> Keep an eye on your dashboard for exact dates and instructions.</p>

        <p>Questions? Contact us at heataward@gmail.com</p>
      </div>
    `,
    text: `Welcome to the judge panel! Click this link to access: ${magicLink}. This link expires in 24 hours. Need another link later? Visit https://heatawards.eu/login and enter your email for a fresh one.`,
  }),
  authOtpCode: (name: string, code: string, expiryHours: number) => ({
    subject: 'EU Hot Sauce Awards - Your Login Code',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Your Login Code</h1>
        <p>Hi ${name},</p>
        <p>Use the code below to sign in to your EU Hot Sauce Awards dashboard. Enter it on the login page where you requested it.</p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; border: 2px solid #ff4d00; border-radius: 8px; display: inline-block; padding: 20px 40px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ff4d00; font-family: monospace;">${code}</span>
          </div>
        </div>

        <p style="color: #666; font-size: 14px;">
          This code expires in ${expiryHours} hours. If you didn't request this, you can safely ignore it.
        </p>

        <p>Need help? Reach us at heataward@gmail.com.</p>
      </div>
    `,
    text: `Hi ${name}, your EU Hot Sauce Awards login code is: ${code}. Enter it on the login page. It expires in ${expiryHours} hours.`,
  }),

  authMagicLink: (name: string, magicLink: string, expiryHours: number) => ({
    subject: 'EU Hot Sauce Awards - Secure Login Link',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Here's Your Secure Login Link</h1>
        <p>Hi ${name},</p>
        <p>Use the button below to securely access your EU Hot Sauce Awards dashboard.</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="background-color: #ff4d00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Log In Now</a>
        </p>

        <p style="color: #666; font-size: 14px;">
          This link stays active for the next ${expiryHours} hours. If it expires, request another one anytime at
          <a href="https://heatawards.eu/login" style="color: #ff4d00;">heatawards.eu/login</a>.
        </p>

        <p>Need help? Reach us at heataward@gmail.com.</p>
      </div>
    `,
    text: `Hi ${name}, use this link to access your EU Hot Sauce Awards dashboard: ${magicLink}. It stays active for the next ${expiryHours} hours. Need another? Head to https://heatawards.eu/login.`,
  }),
  winnersAnnouncement: (name: string) => ({
    subject: 'The EU Hot Sauce Awards 2026 Winners Are In!',
    html: `
      ${emailBanner}
      <div style="padding: 30px 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <h1 style="color: #ff4d00; margin-bottom: 10px;">The Winners Are In!</h1>

        <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>

        <p style="font-size: 16px; line-height: 1.6;">
          The results of the <strong>European Hot Sauce Awards 2026</strong> are officially out — and we're kicking things off with the mild category winners announcement video on YouTube. Watch it now:
        </p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://www.youtube.com/watch?v=nQsGH0tPhZ8" target="_blank" style="display: inline-block; text-decoration: none;">
            <img src="https://img.youtube.com/vi/nQsGH0tPhZ8/maxresdefault.jpg" alt="EU Hot Sauce Awards 2026 Winners" style="max-width: 100%; width: 560px; border-radius: 8px; border: 3px solid #ff4d00;" />
            <br/>
            <span style="display: inline-block; margin-top: 12px; background-color: #ff0000; color: white; padding: 12px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">▶ Watch on YouTube</span>
          </a>
        </p>

        <div style="background-color: #fff3e0; padding: 20px; border-left: 4px solid #ff4d00; margin: 30px 0; border-radius: 0 5px 5px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ff4d00; font-size: 15px;">What's coming next:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #333;">
            <li><strong>Category winners</strong> — revealed on YouTube on the
              <a href="https://www.youtube.com/@RepublicofHeat" style="color: #ff4d00;">Republic of Heat channel</a>,
              then on Instagram over the next few days via
              <a href="https://www.instagram.com/republicofheat/" style="color: #ff4d00;">@republicofheat</a>
            </li>
            <li><strong>Full results</strong> — published at <a href="https://heatawards.eu/results" style="color: #ff4d00;">heatawards.eu/results</a> on <strong>20 May 2026</strong></li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Thank you for being part of this year's competition — whether you entered a sauce, lent your palate as a judge, or both. The standard of entries was exceptional and it made for some incredibly tight judging.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Follow us on Instagram to catch each category reveal as it drops:
        </p>

        <p style="text-align: center; margin: 20px 0;">
          <a href="https://www.instagram.com/republicofheat/" style="display: inline-block; background-color: #E1306C; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; margin: 5px;">@republicofheat</a>
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
          With fire,<br/>
          <strong>The EU Hot Sauce Awards Team</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <div style="text-align: center; padding: 20px 0;">
          <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Proudly sponsored by</p>
          <a href="https://republicofheat.com/?utm_source=heatawards&utm_medium=email&utm_campaign=2026_winners_announcement" target="_blank">
            <img src="https://heatawards.eu/sponsors/ROH_LOGO.png" alt="Republic of Heat" style="max-width: 180px; height: auto;" />
          </a>
          <p style="color: #666; font-size: 13px; margin-top: 8px; line-height: 1.4;">Discover Europe's best hot sauces delivered monthly</p>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #666; font-size: 12px; line-height: 1.5;">
          You're receiving this because you participated in the EU Hot Sauce Awards 2026.
          If you'd prefer not to receive future updates, <a href="mailto:heataward@gmail.com?subject=Unsubscribe" style="color: #666;">let us know</a>.
        </p>
      </div>
    `,
    text: `Hi ${name}, the EU Hot Sauce Awards 2026 winners are announced! Watch the mild category winners video: https://www.youtube.com/watch?v=nQsGH0tPhZ8. Category winners will be revealed on the Republic of Heat YouTube channel (https://www.youtube.com/@RepublicofHeat), then on Instagram via @republicofheat over the next few days. Full results go live at https://heatawards.eu/results on 20 May 2026.`,
  }),

  authConfirmationLink: (name: string, magicLink: string, expiryHours: number) => ({
    subject: 'Confirm Your Email - EU Hot Sauce Awards',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Confirm Your Email</h1>
        <p>Hi ${name},</p>
        <p>Thanks for registering with the EU Hot Sauce Awards. Click the button below to confirm your email and access your dashboard.</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="background-color: #ff4d00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirm &amp; Continue</a>
        </p>

        <p style="color: #666; font-size: 14px;">
          This link stays active for ${expiryHours} hours. If it expires, you can request a new confirmation email at
          <a href="https://heatawards.eu/login" style="color: #ff4d00;">heatawards.eu/login</a>.
        </p>

        <p>If you have any questions, contact us at heataward@gmail.com.</p>
      </div>
    `,
    text: `Hi ${name}, confirm your EU Hot Sauce Awards email with this link: ${magicLink}. It stays active for ${expiryHours} hours. Need another? Visit https://heatawards.eu/login.`,
  }),

  confirmEntriesReminder: (brandName: string, entryCount: number, daysSinceRegistration: number, magicLink?: string) => ({
    subject: 'EU Hot Sauce Awards - Please Confirm Your Entries',
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d00;">Confirm Your Entries</h1>
        <p>Dear ${brandName},</p>

        <p>We noticed your ${entryCount} sauce ${entryCount > 1 ? 'entries are' : 'entry is'} registered but not yet confirmed.</p>

        <div style="background-color: #fff3cd; border: 2px solid #ff4d00; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #ff4d00; margin-top: 0;">📋 Entry Summary</h3>
          <ul style="margin: 10px 0;">
            <li><strong>Entries:</strong> ${entryCount} sauce${entryCount > 1 ? 's' : ''}</li>
            <li><strong>Registered:</strong> ${daysSinceRegistration} day${daysSinceRegistration !== 1 ? 's' : ''} ago</li>
          </ul>
        </div>

        <h2 style="color: #ff4d00;">Confirm Your Entries</h2>
        <p>Click the button below to access your dashboard and confirm your entries — this locks in your total. You won't be charged now; payment is collected in January.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLink || 'https://heatawards.eu/login'}" style="background-color: #ff4d00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Access Dashboard & Confirm Entries</a>
        </div>

        <p style="font-size: 14px; color: #666;">Once you access your dashboard, click "Confirm Entries" for your sauces.</p>

        <div style="background-color: #f8f9fa; border-left: 4px solid #ff4d00; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏰ Important:</strong> Unconfirmed entries will not be included in the competition. Please confirm soon to secure your spot!</p>
        </div>

        <p>Questions? Contact us at heataward@gmail.com</p>

        <p>Best regards,<br>
        <strong>The EU Hot Sauce Awards Team</strong></p>
      </div>
    `,
    text: `Confirm Your Entries - Dear ${brandName}, your ${entryCount} sauce ${entryCount > 1 ? 'entries are' : 'entry is'} still unconfirmed. Access your dashboard to confirm: ${magicLink || 'https://heatawards.eu/login'}. You won't be charged now — payment is collected in January. Registered ${daysSinceRegistration} days ago.`,
  }),

  paymentReceipt: (params: {
    receiptNumber: string;
    receiptDate: string;
    year: number;
    supplierName: string;
    supplierContactName: string;
    supplierAddress: string;
    supplierVatNumber: string | null;
    entryCount: number;
    grossAmount: string;
    netAmount: string;
    vatAmount: string;
    vatRate: string;
    vatTreatment: 'standard' | 'reverse_charge' | 'outside_scope';
    companyName: string;
    companyAddress: string;
    companyVat: string;
  }) => {
    const vatNote = params.vatTreatment === 'reverse_charge'
      ? 'Reverse charge — VAT to be accounted for by the recipient (Art. 44/196 EU VAT Directive). No VAT charged.'
      : params.vatTreatment === 'outside_scope'
      ? 'Outside the scope of EU VAT (Art. 44 EU VAT Directive) — recipient established outside the EU. No VAT charged.'
      : null;
    return {
    subject: `Payment Receipt ${params.receiptNumber} - EU Hot Sauce Awards ${params.year}`,
    html: `
      ${emailBanner}
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">

        <div style="background-color: #fff8e1; border-left: 4px solid #ff4d00; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 5px 5px 0; font-size: 14px; color: #555;">
          <strong style="color: #ff4d00;">Please note:</strong> An earlier email sent in error described this document as a VAT invoice. This is the corrected version — it is a payment receipt confirming the amount you paid. We apologise for any confusion.
        </div>

        <div style="text-align: right; color: #666; margin-bottom: 20px;">
          <p style="margin: 2px 0;"><strong>Receipt Number:</strong> ${params.receiptNumber}</p>
          <p style="margin: 2px 0;"><strong>Receipt Date:</strong> ${params.receiptDate}</p>
        </div>

        <h1 style="color: #ff4d00; border-bottom: 3px solid #ff4d00; padding-bottom: 10px;">PAYMENT RECEIPT</h1>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
            <h3 style="color: #ff4d00; margin-top: 0;">From:</h3>
            <p style="margin: 5px 0; font-weight: bold;">${params.companyName}</p>
            <p style="margin: 2px 0; white-space: pre-line;">${params.companyAddress}</p>
            <p style="margin: 10px 0 0 0;"><strong>VAT Number:</strong> ${params.companyVat}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
            <h3 style="color: #ff4d00; margin-top: 0;">To:</h3>
            <p style="margin: 5px 0; font-weight: bold;">${params.supplierName}</p>
            ${params.supplierContactName ? `<p style="margin: 2px 0;">Attn: ${params.supplierContactName}</p>` : ''}
            <p style="margin: 2px 0; white-space: pre-line;">${params.supplierAddress}</p>
            ${params.supplierVatNumber ? `<p style="margin: 10px 0 0 0;"><strong>VAT Number:</strong> ${params.supplierVatNumber}</p>` : ''}
          </div>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="color: #ff4d00;">Description</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #ff4d00; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount (incl. VAT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">EU Hot Sauce Awards ${params.year} - Competition Entry</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${params.entryCount}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">€${params.grossAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin: 30px 0; background-color: #fff3cd; padding: 20px; border-radius: 5px; border-left: 4px solid #ff4d00;">
          <table style="width: 100%; max-width: 300px; margin-left: auto;">
            <tr>
              <td style="padding: 8px 0;"><strong>Net Amount:</strong></td>
              <td style="padding: 8px 0; text-align: right;">€${params.netAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>VAT (${params.vatRate}%):</strong></td>
              <td style="padding: 8px 0; text-align: right;">€${params.vatAmount}</td>
            </tr>
            <tr style="border-top: 2px solid #ff4d00;">
              <td style="padding: 12px 0;"><strong style="font-size: 18px;">Total Paid:</strong></td>
              <td style="padding: 12px 0; text-align: right;"><strong style="font-size: 18px; color: #ff4d00;">€${params.grossAmount}</strong></td>
            </tr>
          </table>
          ${vatNote ? `<p style="margin: 16px 0 0 0; font-size: 13px; color: #555;">${vatNote}</p>` : ''}
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #666;"><strong>Payment Status:</strong> Paid via Stripe</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Thank you for your participation in the EU Hot Sauce Awards ${params.year}!</p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p style="margin: 5px 0;">This is an automatically generated payment receipt.</p>
          <p style="margin: 5px 0;">For questions, please contact: heataward@gmail.com</p>
        </div>
      </div>
    `,
    text: `PAYMENT RECEIPT\n\nPlease note: An earlier email sent in error described this document as a VAT invoice. This is the corrected version — a payment receipt confirming the amount you paid. We apologise for any confusion.\n\nReceipt Number: ${params.receiptNumber}\nReceipt Date: ${params.receiptDate}\n\nFrom:\n${params.companyName}\n${params.companyAddress}\nVAT Number: ${params.companyVat}\n\nTo:\n${params.supplierName}\n${params.supplierContactName ? `Attn: ${params.supplierContactName}\n` : ''}${params.supplierAddress}${params.supplierVatNumber ? `\nVAT Number: ${params.supplierVatNumber}` : ''}\n\nDescription: EU Hot Sauce Awards ${params.year} - Competition Entry\nQuantity: ${params.entryCount}\n\nNet Amount: €${params.netAmount}\nVAT (${params.vatRate}%): €${params.vatAmount}\nTotal Paid: €${params.grossAmount}${vatNote ? `\n\n${vatNote}` : ''}\n\nPayment Status: Paid via Stripe\n\nThank you for your participation in the EU Hot Sauce Awards ${params.year}!`,
    };
  },
};
