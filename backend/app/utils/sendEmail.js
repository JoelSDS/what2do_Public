const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Your What2Do account👋" <no-reply@myapp.com>',
    to,
    subject,
    html: htmlContent,
  });

  return nodemailer.getTestMessageUrl(info);
};

module.exports = sendEmail;
