const nodemailer = require('nodemailer');
const config = require('../config/config');

// User Verification Email
const sendVerifyMail = async (name, email, user_id) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: config.emailUser,
          pass: config.emailPassword,
        },
      });
      const mailOptions = {
        from: config.emailUser,
        to: email,
        subject: "Verification mail",
        html:
          "<p>Hi " +
          name +
          ', please click here to <a href="http://localhost:5000/verify?id=' +
          user_id +
          '"> Verify </a> your mail.</p>',
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email has been sent:- ", info.response);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
};

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "Reset Password",
      html:
        "<p>Hi " +
        name +
        ', please click here to <a href="http://localhost:5000/forget-password?token=' +
        token +
        '"> Reset </a> your password.</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:- ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addEmployMail = async (name, email, password, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "Onboarding Mail",
      html:
        "<p>Hi " +
        name +
        ', please click here to <a href="http://localhost:5000/verify?id=' +
        user_id +
        '"> Login </a> your Dashboard.</p> <br><br>Your Credentials <br><b>Email:- </b>' + email + ' <br><b>Password:- </b>' + password + ' <br><br>Thank You',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:- ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  sendVerifyMail,
  sendResetPasswordMail,
  addEmployMail
};