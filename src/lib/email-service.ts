import { Resend } from 'resend';

/**
 * @fileOverview Branded Email Service for Kenya Land Trust.
 * Handles templating and delivery via Resend.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND_COLORS = {
  primary: '#0F3D2E',
  secondary: '#F4F1EC',
  accent: '#2F6F95',
  warning: '#C58B2E',
  risk: '#8C2F39',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
};

const FOOTER_HTML = (email: string) => `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: ${BRAND_COLORS.muted}; font-size: 12px; text-align: center;">
    <p>© ${new Date().getFullYear()} Kenya Land Trust. All rights reserved.</p>
    <p>Building transparency in the Kenyan land market.</p>
    <p style="margin-top: 10px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: ${BRAND_COLORS.primary}; text-decoration: underline;">Unsubscribe</a> from these updates.
    </p>
  </div>
`;

const LAYOUT = (content: string, email: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: ${BRAND_COLORS.secondary}; margin: 0; padding: 20px; color: ${BRAND_COLORS.text}; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: ${BRAND_COLORS.primary}; padding: 30px; text-align: center; }
        .content { padding: 40px; line-height: 1.6; }
        .button { display: inline-block; padding: 12px 24px; background-color: ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.white} !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: ${BRAND_COLORS.white}; margin: 0; font-size: 24px;">Kenya Land Trust</h1>
        </div>
        <div class="content">
          ${content}
          ${FOOTER_HTML(email)}
        </div>
      </div>
    </body>
  </html>
`;

export type EmailType = 
  | 'listing_submitted' 
  | 'badge_assigned' 
  | 'evidence_vaulted' 
  | 'suspicious_flag' 
  | 'contact_confirmation'
  | 'report_received';

export async function sendBrandedEmail(options: {
  to: string;
  type: EmailType;
  subject: string;
  payload: any;
}) {
  const { to, type, subject, payload } = options;
  let html = '';

  switch (type) {
    case 'listing_submitted':
      html = LAYOUT(`
        <h2 style="color: ${BRAND_COLORS.primary};">Listing Received</h2>
        <p>Hello ${payload.name},</p>
        <p>Your property listing <strong>"${payload.listingTitle}"</strong> has been successfully submitted to the property vault.</p>
        <p>Our trust team will now begin reviewing your documentation. You will receive an update once a trust signal has been assigned.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings" class="button">View My Vault</a>
      `, to);
      break;

    case 'badge_assigned':
      const badgeColors = {
        TrustedSignal: BRAND_COLORS.primary,
        EvidenceReviewed: BRAND_COLORS.accent,
        EvidenceSubmitted: BRAND_COLORS.warning,
        Suspicious: BRAND_COLORS.risk,
        None: BRAND_COLORS.muted
      };
      html = LAYOUT(`
        <h2 style="color: ${BRAND_COLORS.primary};">Trust Signal Updated</h2>
        <p>Hello ${payload.name},</p>
        <p>A new trust signal has been assigned to your listing: <strong>"${payload.listingTitle}"</strong>.</p>
        <div class="badge" style="background-color: ${badgeColors[payload.badge as keyof typeof badgeColors]}20; color: ${badgeColors[payload.badge as keyof typeof badgeColors]};">
          ${payload.badge}
        </div>
        <p><strong>Admin Feedback:</strong></p>
        <blockquote style="border-left: 4px solid #E5E7EB; padding-left: 15px; font-style: italic; color: ${BRAND_COLORS.muted};">
          "${payload.adminNotes || 'No specific notes provided.'}"
        </blockquote>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings/${payload.listingId}" class="button">View Live Listing</a>
      `, to);
      break;

    case 'evidence_vaulted':
      html = LAYOUT(`
        <h2 style="color: ${BRAND_COLORS.primary};">Evidence Vaulted</h2>
        <p>Hello ${payload.name},</p>
        <p>New evidence documents have been successfully added to your listing: <strong>"${payload.listingTitle}"</strong>.</p>
        <p>Documents added: ${payload.fileCount}</p>
        <p>This evidence is now queued for administrative verification.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
      `, to);
      break;

    case 'suspicious_flag':
      html = LAYOUT(`
        <h2 style="color: ${BRAND_COLORS.risk};">Security Alert: Suspicious Activity</h2>
        <p>Admin Team,</p>
        <p>A listing has been flagged as <strong>Suspicious</strong> by the AI Trust Engine.</p>
        <p><strong>Listing:</strong> ${payload.listingTitle}</p>
        <p><strong>Reason:</strong> ${payload.reason}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/listings/${payload.listingId}" class="button" style="background-color: ${BRAND_COLORS.risk};">Review Immediately</a>
      `, to);
      break;

    case 'contact_confirmation':
      html = LAYOUT(`
        <h2 style="color: ${BRAND_COLORS.primary};">We've Received Your Message</h2>
        <p>Hello ${payload.name},</p>
        <p>Thanks for contacting Kenya Land Trust. Our support team has received your request regarding <strong>"${payload.topic}"</strong>.</p>
        <p>Typical response time is within 24 hours. Reference ID: ${payload.messageId}</p>
      `, to);
      break;

    case 'report_received':
      html = LAYOUT(`
        <h2 style="color: ${BRAND_COLORS.risk};">Listing Report Captured</h2>
        <p>Hello ${payload.name},</p>
        <p>Thank you for flagging listing <strong>${payload.listingId}</strong>. We take community trust seriously.</p>
        <p>Our moderation team is investigating the report now.</p>
      `, to);
      break;

    default:
      html = LAYOUT(`<p>You have a new notification from Kenya Land Trust.</p>`, to);
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[EmailService] RESEND_API_KEY missing. Skipping delivery.');
      return { success: false, error: 'Config missing' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Kenya Land Trust <notifications@kenyalandtrust.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('[EmailService] Delivery failed:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EmailService] Unexpected error:', err);
    return { success: false, error: err };
  }
}
