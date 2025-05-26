"use strict";

const { newOtp } = require("./otp.service");
const { getTemplate } = require("./template.service");
const { transporter } = require("../dbs/init.nodemailer");

const { NotFoundError } = require("../core/error.response");

const { replacePlaceholder } = require("../utils/index");

const sendEmailLinkVerify = async ({
  html,
  toEmail,
  subject = "Verify email signup!",
  text = "Verify...",
}) => {
  try {
    const mailOptions = {
      from: 'ticketplaza1000@gmail.com',
      to: toEmail,
      subject,
      text,
      html,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return console.log(err);
      }

      console.log("Message sent::", info.messageId);
    });
  } catch (error) {
    console.log(`error send Email::`, error);
    return error;
  }
};

const sendEmailToken = async ({ email = null }) => {
  try {
    // 1. Get token
    const token = await newOtp(email);

    // 2. get Template
    const template = await getTemplate({
      tem_name: "HTML EMAIL TOKEN",
    });

    if (!template) {
      throw new NotFoundError("Template not found");
    }

    // 3. replace place holder with params
    const content = replacePlaceholder(template.tem_html, {
      link_verify: `http://localhost:3055/cgp/welcom-back?token=${token.tem_token}`,
    });

    // 4. Send email
    sendEmailLinkVerify({
      html: content,
      toEmail: email,
      subject: "Please, verify email sign up to shopdev.com",
    }).catch((err) => console.log(err));

    return 1;
  } catch (error) {}
};

module.exports = {
  sendEmailToken,
};
