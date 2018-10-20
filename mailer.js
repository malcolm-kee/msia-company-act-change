const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email via email providers
 * @param {Array<string>} emails email of receipients
 * @param {string} subject subject of email
 * @param {string} text plain text of the email
 * @param {string} html html of the email
 */
const sendEmail = (emails, subject, text, html) =>
  sgMail.sendMultiple({
    to: emails,
    from: {
      name: 'Malcolm Kee',
      email: 'malcolm.keeweesiong@gmail.com'
    },
    subject,
    text,
    html
  });

module.exports = {
  sendEmail
};
