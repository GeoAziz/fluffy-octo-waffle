import { Resend } from 'resend';

/**
 * @fileOverview Branded Email Service for Kenya Land Trust.
 * Handles templating and delivery via Resend with professional branding and responsive layouts.
 */

// Lazily instantiated so the module can be imported at build time without an API key.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('Missing RESEND_API_KEY environment variable.');
    _resend = new Resend(key);
  }
  return _resend;
}

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
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: ${BRAND_COLORS.muted}; font-size: 12px; text-align: center; line-height: 1.5;">
    <p>© ${new Date().getFullYear()} Kenya Land Trust. All rights reserved.</p>
    <p>High-Trust Ecosystem for Verified Land Transactions in Kenya.</p>
    <p style="margin-top: 10px;">
      This is an automated security pulse. <br/>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: ${BRAND_COLORS.primary}; text-decoration: underline; font-weight: bold;">Unsubscribe from alerts</a>
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
        body { font-family: 'Inter', -apple-system, sans-serif; background-color: ${BRAND_COLORS.secondary}; margin: 0; padding: 20px; color: ${BRAND_COLORS.text}; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .header { background-color: ${BRAND_COLORS.primary}; padding: 40px 30px; text-align: center; }
        .content { padding: 40px; line-height: 1.6; }
        .button { display: inline-block; padding: 14px 28px; background-color: ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.white} !important; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border: 1px solid rgba(0,0,0,0.1); }
        h2 { color: ${BRAND_COLORS.primary}; font-weight: 900; font-size: 22px; margin-top: 0; letter-spacing: -0.02em; }
        p { margin-bottom: 16px; font-size: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: ${BRAND_COLORS.white}; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.03em; text-transform: uppercase;">Kenya Land Trust</h1>
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
  let htmlContent = '';

  switch (type) {
    case 'listing_submitted':
      htmlContent = `
        <div class="badge" style="background-color: ${BRAND_COLORS.primary}10; color: ${BRAND_COLORS.primary};">Vault Transmission Successful</div>
        <h2>Listing Received & Secured</h2>
        <p>Hello ${payload.name},</p>
        <p>Your property listing <strong>"${payload.listingTitle}"</strong> has been successfully committed to the property vault and assigned a unique registry ID.</p>
        <p>Our trust team will now begin the document integrity review. You will receive an automated pulse once a trust signal has been assigned.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings" class="button">Access My Registry</a>
      `;
      break;

    case 'badge_assigned':
      const badgeColors = {
        TrustedSignal: BRAND_COLORS.primary,
        EvidenceReviewed: BRAND_COLORS.accent,
        EvidenceSubmitted: BRAND_COLORS.warning,
        Suspicious: BRAND_COLORS.risk,
        None: BRAND_COLORS.muted
      };
      const badgeColor = badgeColors[payload.badge as keyof typeof badgeColors] || BRAND_COLORS.muted;
      htmlContent = `
        <div class="badge" style="background-color: ${badgeColor}15; color: ${badgeColor}; border-color: ${badgeColor}30;">Signal Update</div>
        <h2>Trust Signal Assigned</h2>
        <p>Hello ${payload.name},</p>
        <p>A new trust signal has been assigned to your property vault: <strong>"${payload.listingTitle}"</strong>.</p>
        <div style="padding: 20px; background-color: ${BRAND_COLORS.secondary}; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(0,0,0,0.05);">
          <div style="font-weight: 900; color: ${badgeColor}; font-size: 18px; margin-bottom: 8px;">${payload.badge}</div>
          <p style="font-style: italic; color: ${BRAND_COLORS.muted}; font-size: 13px; margin: 0;">"${payload.adminNotes || 'Documentation review complete. Visual assets verified.'}"</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings/${payload.listingId}" class="button">View Live Profile</a>
      `;
      break;

    case 'evidence_vaulted':
      htmlContent = `
        <div class="badge" style="background-color: ${BRAND_COLORS.primary}10; color: ${BRAND_COLORS.primary};">Asset Sync Complete</div>
        <h2>New Proof Vaulted</h2>
        <p>Hello ${payload.name},</p>
        <p>New verification assets have been added to your listing: <strong>"${payload.listingTitle}"</strong>.</p>
        <p>Total documents synced: <strong>${payload.fileCount}</strong></p>
        <p>This update has been logged in the audit trail and is now pending administrative verification.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Monitor Progress</a>
      `;
      break;

    case 'suspicious_flag':
      htmlContent = `
        <div class="badge" style="background-color: ${BRAND_COLORS.risk}15; color: ${BRAND_COLORS.risk};">Security Triage Alert</div>
        <h2>Risk Pulse Detected</h2>
        <p>Admin Team,</p>
        <p>The AI Trust Engine has flagged a potential documentation mismatch.</p>
        <div style="border-left: 4px solid ${BRAND_COLORS.risk}; padding-left: 20px; margin: 24px 0;">
          <p style="margin: 0;"><strong>Listing:</strong> ${payload.listingTitle}</p>
          <p style="margin: 4px 0 0 0; color: ${BRAND_COLORS.risk};"><strong>Risk Reason:</strong> ${payload.reason}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/listings/${payload.listingId}" class="button" style="background-color: ${BRAND_COLORS.risk};">Review Immediately</a>
      `;
      break;

    case 'contact_confirmation':
      htmlContent = `
        <div class="badge" style="background-color: ${BRAND_COLORS.accent}15; color: ${BRAND_COLORS.accent};">Transmission Received</div>
        <h2>We Have Your Inquiry</h2>
        <p>Hello ${payload.name},</p>
        <p>Thank you for contacting Kenya Land Trust. Our support team has received your request regarding <strong>"${payload.topic}"</strong>.</p>
        <p>Our current moderation SLA ensures a response within 24 hours.</p>
        <div style="font-size: 11px; font-weight: 800; color: ${BRAND_COLORS.muted}; margin-top: 20px; text-transform: uppercase;">Ref ID: ${payload.messageId}</div>
      `;
      break;

    case 'report_received':
      htmlContent = `
        <div class="badge" style="background-color: ${BRAND_COLORS.risk}15; color: ${BRAND_COLORS.risk};">Community Signal</div>
        <h2>Risk Report Captured</h2>
        <p>Hello ${payload.name},</p>
        <p>Thank you for flagging listing <strong>${payload.listingId}</strong>. Community vigilance is the foundation of our trust ecosystem.</p>
        <p>Our moderation team is investigating your report now. Action will be taken if documentation discrepancies are confirmed.</p>
      `;
      break;

    default:
      htmlContent = `<h2>Notification Alert</h2><p>You have a new update from Kenya Land Trust.</p>`;
  }

  const html = LAYOUT(htmlContent, to);

  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[EmailService] RESEND_API_KEY missing. Skipping delivery pulse.');
      return { success: false, error: 'Config missing' };
    }

    const { data, error } = await getResend().emails.send({
      from: 'Kenya Land Trust <notifications@kenyalandtrust.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('[EmailService] Transmission failed:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EmailService] Unexpected logic error:', err);
    return { success: false, error: err };
  }
}
