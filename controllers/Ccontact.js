const AppError = require('../utils/AppError');
const { sendEmail } = require('../utils/email');

exports.sendContact = async (req, res, next) => {
  const { name, email, message } = req.body;

  // ── Name Validation ──
  const trimmedName = name ? name.trim() : '';
  const nameRegex = /^[a-zA-Z\s'-]+$/;

  if (!trimmedName) {
    return next(new AppError('Please provide your name.', 400));
  }
  if (!nameRegex.test(trimmedName)) {
    return next(new AppError('Name can only contain letters, spaces, hyphens, or apostrophes.', 400));
  }

  const rawSiteEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER || 'hawleekservice@gmail.com';
  const siteEmail = rawSiteEmail.match(/<([^>]+)>/)?.[1] || rawSiteEmail;

  // Detect if this is a service request (message starts with "SERVICE REQUEST")
  const isServiceRequest = message && message.startsWith('SERVICE REQUEST');

  // ── Beautiful admin notification email ──
  const adminHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 20px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,${isServiceRequest ? '#d97706' : '#0f6e56'},${isServiceRequest ? '#f59e0b' : '#1a9b75'});padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">
                ${isServiceRequest ? '🔧 New Service Request' : '📬 New Contact Message'}
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Hawleek Notification</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f8fffe;border:2px solid #e0f5ee;border-radius:12px;">
                <tr><td style="padding:24px;">
                  <p style="margin:0 0 6px;font-size:13px;color:#888;font-weight:600;">From</p>
                  <p style="margin:0 0 16px;font-size:15px;color:#1a1a1a;font-weight:600;">${trimmedName} &lt;${email}&gt;</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#888;font-weight:600;">Message</p>
                  <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-line;">${message}</p>
                </td></tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;color:#888;">
                Reply directly to <a href="mailto:${email}" style="color:#0f6e56;">${email}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f8fffe;padding:20px 40px;text-align:center;border-top:1px solid #e0f5ee;">
              <p style="margin:0;font-size:12px;color:#bbb;">© ${new Date().getFullYear()} Hawleek · Neighborhood Guide</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  // ── Beautiful user confirmation email ──
  const userSubject = isServiceRequest
    ? '🔧 Service Request Received — Hawleek'
    : '✅ Message Received — Hawleek';

  const userHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 20px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#0f6e56,#1a9b75);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">🏘️ Hawleek</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Your Neighborhood Guide</p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:22px;">
                ${isServiceRequest ? '🔧 Service Request Received!' : '📬 Message Received!'}
              </h2>
              <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
                Hi <strong>${trimmedName}</strong>,
                ${isServiceRequest
                  ? 'thank you for submitting a service request through Hawleek. Our technician team has been notified and will contact you within <strong>24 hours</strong> to schedule your appointment.'
                  : 'thank you for reaching out to us. We have received your message and our team will get back to you shortly.'}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f8fffe;border:2px solid #e0f5ee;border-radius:12px;margin-bottom:20px;">
                <tr><td style="padding:20px 24px;">
                  <p style="margin:0 0 6px;font-size:13px;color:#888;font-weight:600;">Your Message</p>
                  <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-line;">${message}</p>
                </td></tr>
              </table>

              ${isServiceRequest ? `
              <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:20px;">
                <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
                  ⏳ <strong>What happens next?</strong><br>
                  A technician from Sayed Electric & Plumbing will call you to confirm the appointment details and provide a cost estimate.
                </p>
              </div>
              ` : ''}

              <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
                If you have any urgent concerns, feel free to reply to this email.<br><br>
                Best regards,<br>
                <strong>The Hawleek Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f8fffe;padding:24px 40px;text-align:center;border-top:1px solid #e0f5ee;">
              <p style="margin:0;font-size:12px;color:#bbb;">
                © ${new Date().getFullYear()} Hawleek · Your Neighborhood Guide & Booking Assistant
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await sendEmail({
      to: siteEmail,
      subject: isServiceRequest ? `🔧 Service Request: ${trimmedName}` : `📬 Contact form: ${trimmedName}`,
      html: adminHtml,
      replyTo: email,
    });

    await sendEmail({ to: email, subject: userSubject, html: userHtml });

    res.json({ success: true, message: 'Message sent' });
  } catch (err) {
    console.error('Contact email failed:', err.message);
    return next(new AppError('Failed to send contact message. Please check email configuration.', 500));
  }
};
