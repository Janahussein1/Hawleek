const nodemailer = require('nodemailer');

const createTransporter = () => {
  // If no email config, return null (emails will be skipped gracefully)
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`📧 [EMAIL SKIPPED — no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Hawleek <noreply@hawleek.com>',
    to,
    subject,
    html,
  });

  console.log(`📧 Email sent to ${to}`);
};

const sendBookingConfirmation = async ({ userEmail, userName, booking, placeName }) => {
  const typeLabel = {
    table: 'Table Reservation',
    appointment: 'Appointment',
    seat: 'Transport Seat',
  }[booking.type] || booking.type;

  const statusColor = {
    pending: '#f59e0b',
    confirmed: '#22c55e',
  }[booking.status] || '#6366f1';

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Hawleek</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#0f6e56 0%,#1a9b75 100%);padding:40px 40px 30px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🏘️ Hawleek</h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Your Neighborhood Guide</p>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:36px 40px 20px;">
                <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">Booking ${booking.status === 'confirmed' ? 'Confirmed' : 'Received'} ✅</h2>
                <p style="margin:0;color:#555;font-size:15px;line-height:1.6;">
                  Hi <strong>${userName}</strong>, your ${typeLabel.toLowerCase()} has been 
                  ${booking.status === 'confirmed' ? 'confirmed' : 'received and is pending confirmation'}.
                  Here are your booking details:
                </p>
              </td>
            </tr>

            <!-- Booking Details Card -->
            <tr>
              <td style="padding:0 40px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f8fffe;border:2px solid #e0f5ee;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:24px 28px;">
                      <table width="100%" cellpadding="0" cellspacing="0">

                        <tr>
                          <td colspan="2" style="padding-bottom:16px;border-bottom:1px solid #e0f5ee;">
                            <span style="background:${statusColor};color:#fff;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                              ${booking.status}
                            </span>
                            <span style="margin-left:10px;font-size:13px;color:#888;">
                              Booking ID: #${String(booking._id).slice(-8).toUpperCase()}
                            </span>
                          </td>
                        </tr>

                        ${[
                          ['📍 Place',       placeName],
                          ['📋 Type',        typeLabel],
                          ['📅 Date',        new Date(booking.date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })],
                          ['⏰ Time',        booking.time],
                          booking.partySize > 1 ? ['👥 Party Size', `${booking.partySize} people`] : null,
                          booking.seatsBooked > 1 ? ['💺 Seats',    `${booking.seatsBooked} seats`] : null,
                          booking.totalPrice > 0  ? ['💰 Total',    `EGP ${booking.totalPrice}`]    : null,
                          booking.notes ? ['📝 Notes', booking.notes] : null,
                        ].filter(Boolean).map(([label, value]) => `
                          <tr>
                            <td style="padding:10px 0 4px;font-size:13px;color:#888;font-weight:600;">${label}</td>
                            <td style="padding:10px 0 4px;font-size:14px;color:#1a1a1a;text-align:right;font-weight:500;">${value}</td>
                          </tr>
                        `).join('')}

                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="padding:0 40px 32px;">
                <p style="margin:0;color:#555;font-size:14px;line-height:1.7;background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 8px 8px 0;">
                  ${booking.status === 'pending'
                    ? '⏳ Your booking is <strong>pending confirmation</strong>. The business will confirm shortly. You\'ll receive another email once confirmed.'
                    : '🎉 Your booking is <strong>confirmed</strong>! Please arrive a few minutes early. If you need to cancel, you can do so from your dashboard.'}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fffe;padding:24px 40px;text-align:center;border-top:1px solid #e0f5ee;">
                <p style="margin:0 0 8px;font-size:13px;color:#888;">
                  Need help? Reply to this email or visit your <a href="#" style="color:#0f6e56;text-decoration:none;font-weight:600;">Hawleek Dashboard</a>
                </p>
                <p style="margin:0;font-size:12px;color:#bbb;">
                  © ${new Date().getFullYear()} Hawleek · Your Neighborhood Guide &amp; Booking Assistant
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  await sendEmail({
    to: userEmail,
    subject: `Booking ${booking.status === 'confirmed' ? 'Confirmed' : 'Received'} — ${placeName} | Hawleek`,
    html,
  });
};

const sendBookingStatusUpdate = async ({ userEmail, userName, booking, placeName, newStatus }) => {
  const statusMessages = {
    confirmed:  { emoji: '✅', headline: 'Booking Confirmed!',  body: 'Great news! Your booking has been confirmed by the business. See you there!' },
    cancelled:  { emoji: '❌', headline: 'Booking Cancelled',   body: 'Your booking has been cancelled. If this was unexpected, please contact the business directly.' },
    completed:  { emoji: '🎉', headline: 'Visit Complete!',     body: 'Thank you for visiting! We hope you had a great experience. Don\'t forget to leave a review.' },
  };

  const info = statusMessages[newStatus] || { emoji: 'ℹ️', headline: `Booking ${newStatus}`, body: `Your booking status has been updated to ${newStatus}.` };

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 20px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f6e56,#1a9b75);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;">🏘️ Hawleek</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:22px;">${info.emoji} ${info.headline}</h2>
              <p style="color:#555;font-size:15px;line-height:1.6;">Hi <strong>${userName}</strong>, ${info.body}</p>
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f8fffe;border:2px solid #e0f5ee;border-radius:12px;margin-top:20px;">
                <tr><td style="padding:20px 24px;">
                  <p style="margin:0 0 6px;font-size:13px;color:#888;">Place</p>
                  <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1a1a1a;">${placeName}</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#888;">Date &amp; Time</p>
                  <p style="margin:0;font-size:15px;color:#1a1a1a;">
                    ${new Date(booking.date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })} at ${booking.time}
                  </p>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fffe;padding:20px 40px;text-align:center;border-top:1px solid #e0f5ee;">
              <p style="margin:0;font-size:12px;color:#bbb;">© ${new Date().getFullYear()} Hawleek · Neighborhood Guide &amp; Booking Assistant</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  await sendEmail({
    to: userEmail,
    subject: `${info.emoji} Booking ${newStatus} — ${placeName} | Hawleek`,
    html,
  });
};

const sendWelcomeEmail = async ({ userEmail, userName, role }) => {
  const roleMessages = {
    resident:       'Start exploring places in your neighborhood, make bookings, and share your reviews.',
    business_owner: 'You can now add your business, manage bookings, and grow your local presence.',
    admin:          'You have full admin access to manage the Hawleek platform.',
  };

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 20px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f6e56,#1a9b75);padding:48px 40px;text-align:center;">
              <h1 style="margin:0 0 8px;color:#fff;font-size:32px;font-weight:700;">🏘️ Welcome to Hawleek!</h1>
              <p style="margin:0;color:rgba(255,255,255,0.85);font-size:16px;">Your Neighborhood Guide &amp; Booking Assistant</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:20px;">Hi ${userName} 👋</h2>
              <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
                Your account has been created successfully as a <strong style="color:#0f6e56;">${role.replace('_', ' ')}</strong>.
              </p>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
                ${roleMessages[role] || 'Welcome aboard!'}
              </p>
              <div style="background:#f0fdf9;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;">
                <p style="margin:0;font-size:14px;color:#166534;line-height:1.7;">
                  🔐 Keep your login details safe.<br>
                  🌍 Use <strong>?lang=ar</strong> in the URL to switch to Arabic.<br>
                  📱 Your dashboard adapts to your role automatically.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fffe;padding:20px 40px;text-align:center;border-top:1px solid #e0f5ee;">
              <p style="margin:0;font-size:12px;color:#bbb;">© ${new Date().getFullYear()} Hawleek · Built with ❤️ for your neighborhood</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  await sendEmail({
    to: userEmail,
    subject: `Welcome to Hawleek, ${userName}! 🏘️`,
    html,
  });
};

module.exports = { sendEmail, sendBookingConfirmation, sendBookingStatusUpdate, sendWelcomeEmail };

