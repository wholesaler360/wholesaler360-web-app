import nodemailer from 'nodemailer';
import { AppEmailSettings } from '../api/settings/app-settings/app-settings-model.js';

const sendMail = async function (to, subject, html) {

  if(process.env.NODE_ENV === 'production') {
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
      secure: emailSettings.smtpPort === 465, // true for 465, false for other ports
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
  else if(process.env.NODE_ENV === 'demoproduction' || process.env.NODE_ENV === 'development') {
    const mailOptions = {
      from: process.env.EMAIL, 
      to: to,
      subject: subject,
      html: html
    };

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD,
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
}

export default sendMail;