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
      <div style="padding: 30px 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <h1 style="color: #ff4d00; margin-bottom: 20px;">We'd Love to See You Back in 2026!</h1>

        <p style="font-size: 16px; line-height: 1.6;">Dear ${brandName},</p>

        <p style="font-size: 16px; line-height: 1.6;">Thank you for being part of the European Hot Sauce Awards community. Your participation helps showcase the incredible diversity and quality of European hot sauce craftsmanship. We're thrilled to announce that entries for the 2026 competition are now open!</p>

        <h2 style="color: #ff4d00; margin-top: 30px; margin-bottom: 15px;">Why Enter Again?</h2>
        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
          <li>Showcase your latest creations to Europe's passionate spice-loving community</li>
          <li>Gain valuable feedback from expert professional and community judges</li>
          <li>Boost brand visibility and credibility in the competitive European market</li>
          <li>Award-winning sauces receive promotional support and media coverage</li>
          <li>Network with fellow hot sauce makers and industry professionals</li>
        </ul>

        <h2 style="color: #ff4d00; margin-top: 30px; margin-bottom: 15px;">What's New in 2026:</h2>
        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
          <li>Expanded judging panel with diverse flavor expertise</li>
          <li>Enhanced winner promotion across social media and partner channels</li>
          <li>New category options to better showcase your unique products</li>
        </ul>

        <div style="background-color: #fff3e0; padding: 20px; border-left: 4px solid #ff4d00; margin: 30px 0;">
          <p style="margin: 0; font-weight: bold; color: #ff4d00; font-size: 16px;">Important Dates:</p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px;">
            <li><strong>Registration Deadline:</strong> January 31, 2026</li>
            <li><strong>Samples Deadline:</strong> February 28, 2026</li>
            <li><strong>Judging Period:</strong> March 2026</li>
            <li><strong>Results Announcement:</strong> April 2026</li>
          </ul>
        </div>

        <p style="text-align: center; margin: 40px 0;">
          <a href="https://heatawards.eu/apply/supplier" style="background-color: #ff4d00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">Enter Your Sauces Now</a>
        </p>

        <h2 style="color: #ff4d00; margin-top: 30px; margin-bottom: 15px;">Need Help?</h2>
        <p style="font-size: 16px; line-height: 1.6;">Whether you have questions about categories, submission requirements, or shipping details, our team is ready to assist.</p>

        <p style="font-size: 16px; line-height: 1.6;">📧 <a href="mailto:heataward@gmail.com" style="color: #ff4d00;">heataward@gmail.com</a></p>

        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">We can't wait to taste what you've been creating!</p>

        <p style="font-size: 16px; line-height: 1.6;">Best regards,<br>
        <strong>The EU Hot Sauce Awards Team</strong></p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <div style="text-align: center; padding: 20px 0;">
          <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Proudly sponsored by</p>
          <a href="https://republicofheat.com/?utm_source=heatawards&utm_medium=email&utm_campaign=2026_supplier_invitation" target="_blank">
            <img src="https://heatawards.eu/sponsors/ROH_LOGO.png" alt="Republic of Heat" style="max-width: 180px; height: auto;" />
          </a>
          <p style="color: #666; font-size: 13px; margin-top: 8px; line-height: 1.4;">Discover Europe's best hot sauces delivered monthly</p>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #666; font-size: 12px; line-height: 1.5;">
          You're receiving this email because you participated in a previous EU Hot Sauce Awards competition. If you'd prefer not to receive future competition invitations, please <a href="mailto:heataward@gmail.com?subject=Unsubscribe from Supplier Invitations" style="color: #666;">let us know</a>.
        </p>
      </div>
    `,
    text: `Dear ${brandName}, entries for the EU Hot Sauce Awards 2026 are now open! Enter your sauces at https://heatawards.eu/apply/supplier. Registration deadline: January 31, 2026. Samples deadline: February 28, 2026.`,
  }),

  judge2026Invitation: (name: string, judgeType: string) => ({
    subject: 'Be a Judge Again - EU Hot Sauce Awards 2026!',
    html: `
      ${emailBanner}
      <div style="padding: 30px 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <h1 style="color: #ff4d00; margin-bottom: 20px;">Your Expertise is Needed in 2026!</h1>

        <p style="font-size: 16px; line-height: 1.6;">Dear ${name},</p>

        <p style="font-size: 16px; line-height: 1.6;">Thank you for your exceptional work as a ${judgeType === 'pro' ? 'Professional' : 'Community'} Judge in past EU Hot Sauce Awards competitions. Your expertise and palate helped make our event a success, and we'd be honored to have you return for 2026!</p>

        <h2 style="color: #ff4d00; margin-top: 30px; margin-bottom: 15px;">Why Judge Again?</h2>
        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
          <li>Be the first to taste and evaluate Europe's finest hot sauces</li>
          <li>Help shape the future of the European hot sauce industry</li>
          <li>Connect with fellow spice enthusiasts and industry professionals</li>
          <li>Gain recognition as part of Europe's most prestigious hot sauce competition</li>
          <li>Receive a complimentary judging kit and exclusive awards merchandise</li>
        </ul>

        <h2 style="color: #ff4d00; margin-top: 30px; margin-bottom: 15px;">What to Expect:</h2>
        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
          <li><strong>Judging Period:</strong> March 2026</li>
          <li><strong>Format:</strong> Blind tasting with standardized scoring criteria</li>
          <li><strong>Time Commitment:</strong> Approximately 2-4 hours</li>
          <li><strong>Location:</strong> Judge from the comfort of your own home</li>
        </ul>

        <p style="text-align: center; margin: 40px 0;">
          <a href="https://heatawards.eu/apply/judge" style="background-color: #ff4d00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">Register to Judge in 2026</a>
        </p>

        <div style="background-color: #fff3e0; padding: 20px; border-left: 4px solid #ff4d00; margin: 30px 0;">
          <p style="margin: 0; font-weight: bold; color: #ff4d00;">Important Dates:</p>
          <p style="margin: 10px 0 0 0;"><strong>Application Deadline:</strong> February 15, 2026<br>
          <strong>Judging Takes Place:</strong> March 2026</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">Have questions or need more information? We're here to help!</p>

        <p style="font-size: 16px; line-height: 1.6;">📧 <a href="mailto:heataward@gmail.com" style="color: #ff4d00;">heataward@gmail.com</a></p>

        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">We look forward to welcoming you back to the judges' panel!</p>

        <p style="font-size: 16px; line-height: 1.6;">Best regards,<br>
        <strong>The EU Hot Sauce Awards Team</strong></p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <div style="text-align: center; padding: 20px 0;">
          <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Proudly sponsored by</p>
          <a href="https://republicofheat.com/?utm_source=heatawards&utm_medium=email&utm_campaign=2026_judge_invitation" target="_blank">
            <img src="https://heatawards.eu/sponsors/ROH_LOGO.png" alt="Republic of Heat" style="max-width: 180px; height: auto;" />
          </a>
          <p style="color: #666; font-size: 13px; margin-top: 8px; line-height: 1.4;">Discover Europe's best hot sauces delivered monthly</p>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #666; font-size: 12px; line-height: 1.5;">
          You're receiving this email because you served as a judge in a previous EU Hot Sauce Awards competition. If you'd prefer not to receive future judging invitations, please <a href="mailto:heataward@gmail.com?subject=Unsubscribe from Judge Invitations" style="color: #666;">let us know</a>.
        </p>
      </div>
    `,
    text: `Dear ${name}, we'd love to have you back as a ${judgeType === 'pro' ? 'Professional' : 'Community'} Judge for the EU Hot Sauce Awards 2026! Register at https://heatawards.eu/apply/judge. Application deadline: February 15, 2026.`,
  }),
};
