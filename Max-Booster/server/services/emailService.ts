import sgMail from '@sendgrid/mail';
import { emailMonitor } from '../monitoring/emailMonitor';

interface InvitationEmailData {
  to: string;
  inviterName: string;
  inviterEmail: string;
  projectName?: string;
  role?: string;
  inviteLink?: string;
  inviteType: 'collaboration' | 'team' | 'general';
}

class EmailService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.isInitialized && process.env.SENDGRID_API_KEY) {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.isInitialized = true;
        console.log('✅ SendGrid EmailService initialized');
      } catch (error) {
        console.error('❌ Failed to initialize SendGrid EmailService:', error);
      }
    } else if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️  SendGrid API key not configured. Email features will be disabled.');
    }
  }

  async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('⚠️  SendGrid not initialized, skipping invitation email to:', data.to);
      return false;
    }

    const template = this.getInvitationTemplate(data);
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'invitations@maxbooster.ai';

    const emailData = {
      to: data.to,
      from: fromEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    const startTime = Date.now();
    try {
      await sgMail.send(emailData);
      const deliveryTime = Date.now() - startTime;
      
      emailMonitor.logEmail(emailData, 'sent', undefined, deliveryTime);
      console.log(`📧 Invitation email sent to ${data.to} from ${data.inviterName}`);
      return true;
    } catch (error: any) {
      const deliveryTime = Date.now() - startTime;
      const errorMessage = error?.response?.body?.errors?.[0]?.message || error.message || 'Unknown error';
      
      emailMonitor.logEmail(emailData, 'failed', errorMessage, deliveryTime);
      console.error('❌ SendGrid invitation email error:', error?.response?.body || error.message || error);
      return false;
    }
  }

  async sendCollaborationInvite(
    to: string,
    inviterName: string,
    inviterEmail: string,
    projectName: string,
    role: string
  ): Promise<boolean> {
    return this.sendInvitationEmail({
      to,
      inviterName,
      inviterEmail,
      projectName,
      role,
      inviteType: 'collaboration',
    });
  }

  async sendTeamInvite(
    to: string,
    inviterName: string,
    inviterEmail: string,
    role: string
  ): Promise<boolean> {
    return this.sendInvitationEmail({
      to,
      inviterName,
      inviterEmail,
      role,
      inviteType: 'team',
    });
  }

  async sendGeneralInvite(
    to: string,
    inviterName: string,
    inviterEmail: string,
    inviteLink?: string
  ): Promise<boolean> {
    return this.sendInvitationEmail({
      to,
      inviterName,
      inviterEmail,
      inviteLink,
      inviteType: 'general',
    });
  }

  private getInvitationTemplate(data: InvitationEmailData): {
    subject: string;
    html: string;
    text: string;
  } {
    const { inviterName, inviterEmail, projectName, role, inviteLink, inviteType } = data;

    let subject = '';
    let mainMessage = '';
    let actionButton = '';

    switch (inviteType) {
      case 'collaboration':
        subject = `${inviterName} invited you to collaborate on "${projectName}"`;
        mainMessage = `
          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            <strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate on the project <strong>"${projectName}"</strong>.
          </p>
          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your role: <strong>${role || 'Collaborator'}</strong>
          </p>
          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Log in to Max Booster to view the project and start collaborating!
          </p>
        `;
        actionButton = `<a href="https://maxbooster.ai/dashboard" style="display: inline-block; margin: 20px 0; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">View Project</a>`;
        break;

      case 'team':
        subject = `${inviterName} invited you to join their team on Max Booster`;
        mainMessage = `
          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join their team on Max Booster.
          </p>
          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your role: <strong>${role || 'Team Member'}</strong>
          </p>
          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Join their team to collaborate on music projects, manage releases, and grow together!
          </p>
        `;
        actionButton = `<a href="https://maxbooster.ai/dashboard" style="display: inline-block; margin: 20px 0; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Accept Invitation</a>`;
        break;

      case 'general':
        subject = `${inviterName} invited you to Max Booster`;
        mainMessage = `
          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join Max Booster, the AI-powered music career management platform.
          </p>
          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Max Booster helps artists distribute music, manage royalties, create AI-powered content, and grow their music career.
          </p>
        `;
        actionButton = inviteLink
          ? `<a href="${inviteLink}" style="display: inline-block; margin: 20px 0; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Accept Invitation</a>`
          : `<a href="https://maxbooster.ai/pricing" style="display: inline-block; margin: 20px 0; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Get Started</a>`;
        break;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Max Booster</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">AI-Powered Music Platform</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">🎵 You've Been Invited!</h2>
              ${mainMessage}
              <div style="text-align: center;">
                ${actionButton}
              </div>
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  If you have any questions, feel free to reply to this email or contact ${inviterName} directly at ${inviterEmail}.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} Max Booster. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                This invitation was sent by ${inviterName} via Max Booster.
                <br>If you did not expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const text = `
${subject}

${inviterName} (${inviterEmail}) has invited you ${inviteType === 'collaboration' ? `to collaborate on "${projectName}"` : 'to Max Booster'}.

${role ? `Your role: ${role}` : ''}

${inviteType === 'collaboration' ? 'Log in to Max Booster to view the project and start collaborating!' : ''}
${inviteType === 'team' ? 'Join their team to collaborate on music projects and grow together!' : ''}
${inviteType === 'general' ? 'Max Booster helps artists distribute music, manage royalties, create AI-powered content, and grow their music career.' : ''}

${inviteLink || 'https://maxbooster.ai/dashboard'}

If you have any questions, feel free to contact ${inviterName} at ${inviterEmail}.

---
Max Booster - AI-Powered Music Platform
© ${new Date().getFullYear()} Max Booster. All rights reserved.

This invitation was sent by ${inviterName} via Max Booster.
If you did not expect this invitation, you can safely ignore this email.
    `.trim();

    return {
      subject,
      html,
      text,
    };
  }
}

export const emailService = new EmailService();
