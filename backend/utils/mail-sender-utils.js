import nodemailer from 'nodemailer';
// import {EMAIL_MODEL} from '../api/settings/'
import {ApiError} from './api-error-utils.js';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.NODE_MAIL, // generated ethereal user
    pass: process.env.NODE_MAILER_PASS, // generated ethereal password
  },
});

const sendMail = async function (to, subject, text, html) {
  // send mail with defined transport object
  try {
    const info = await transporter.sendMail({
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      // html: html, // html body
    });

    console.log("Message sent: ", info);
    return true;
  } catch (error) {
    console.log(error);
     next(ApiError.mailNotSent("Failed to send email"));
  }
};

  
export default sendMail;