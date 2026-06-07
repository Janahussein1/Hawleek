require('dotenv').config();
const { sendEmail } = require('./utils/email');

const testMail = async () => {
  const to = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER and EMAIL_PASS must be set in .env');
    process.exit(1);
  }

  try {
    await sendEmail({
      to,
      subject: 'Hawleek SMTP test',
      html: '<p>If you received this, SMTP is working correctly.</p>',
    });
    console.log(`✅ Test email sent to ${to}`);
  } catch (err) {
    console.error('❌ SMTP test failed:', err.message);
    console.error('Tip: Gmail requires an App Password (not your login password).');
    process.exit(1);
  }
};

testMail();
