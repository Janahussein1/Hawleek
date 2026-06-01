const AppError = require('../utils/AppError');
const { sendEmail } = require('../utils/email');

exports.sendContact = async (req, res, next) => {
  const { name, email, message } = req.body;

  const siteEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || 'noreply@hawleek.com';

  // send email to site admin
  const adminHtml = `
    <p>New contact form submission</p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;

  try {
    await sendEmail({ to: siteEmail, subject: `Contact form: ${name}`, html: adminHtml });

    // optional: reply to user
    const userHtml = `
      <p>Hi ${name},</p>
      <p>Thanks for contacting Hawaleek. We received your message and will reply shortly.</p>
      <p>— Hawaleek Team</p>
    `;
    await sendEmail({ to: email, subject: 'Thanks for contacting Hawaleek', html: userHtml }).catch(() => {});

    res.json({ success: true, message: 'Message sent' });
  } catch (err) {
    return next(new AppError('Failed to send contact message', 500));
  }
};
