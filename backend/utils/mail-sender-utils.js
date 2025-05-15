import nodemailer from 'nodemailer';
import { AppEmailSettings } from '../api/settings/app-settings/app-settings-model.js';

const sendMail = async function (to, subject, html) {
  const emailSettings = await AppEmailSettings.findOne();
  if (!emailSettings) {
    return false;
  } 

  const mailOptions = {
    from: emailSettings.email, 
    to: to,
    subject: subject,
    html: html
  };

  const transporter = nodemailer.createTransport({
    host: emailSettings.smtpHost,
    port: emailSettings.smtpPort,
    secure: true,
    auth: {
      user: emailSettings.email, 
      pass: emailSettings.credential,
    },
  });

  try {
    const res = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:");
    return false;
  }
}

export default sendMail;