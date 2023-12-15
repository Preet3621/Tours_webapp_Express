const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) create a transporter
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user:process.env.USER_NAME,
          pass:process.env.USER_PASS
        }
      });
    // 2) Define the email options
    const mailOptions = {
        from: 'Preet Dedaniya <preetdedaniya3621@gmail.com>',
        to: options.email,
        subject:options.subject,
        text:options.message
    }
    // 3) actually sent the email
    await transport.sendMail(mailOptions)
}

module.exports = sendEmail;