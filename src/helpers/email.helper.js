const nodemailer = require('nodemailer');
const path = require('path')
const handlebars = require('handlebars')
const { readHTMLFile } = require("../helpers/common")
const { EMAILCONSTANT } = require("../helpers/constant")
exports.sendEmail = async function (to, subject, template, from = global.config.FROM_EMAIL) {
    try {
        var transporter = null;
        if (typeof global.config.IS_EMAIL_USE_SMTP !== 'undefined' && global.config.IS_EMAIL_USE_SMTP == 'on') {
            transporter = nodemailer.createTransport({
                host: global.config.EMAIL_HOST,
                port: global.config.EMAIL_PORT,
                secure: (global.config.EMAIL_PORT == 465) ? true : false,
                auth: {
                    user: global.config.FROM_EMAIL,
                    pass: global.config.EMAIL_PASSWORD
                }
            });

        } else {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: "bhakti.jnext@gmail.com",
                    pass: "bmdave17@"
                }
            });
            transporter = nodemailer.createTransport({
                sendmail: true,
                newline: 'unix',
                path: '/usr/sbin/sendmail'
            });
        }
        let mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: template
        }
        return await transporter.sendMail(mailOptions,
            (error, info) => {
                if (error) {
                    console.log('\n if Email fail', error);
                    const templateData = { message: error.message ? error.message : '' }
                    // ADMINISTRATORMAIL(templateData)
                }
            }
        );

    } catch (e) {
        console.log('\nEmail failed', e)
        const templateData = { message: e.message ? e.message : '' }
        ADMINISTRATORMAIL(templateData)
    }
}

// const sendMailToAdminstrator = async function (to, subject, template, from = global.config.FROM_EMAIL) {
//     try {
//         transporter = nodemailer.createTransport({
//             sendmail: true,
//             newline: 'unix',
//             path: '/usr/sbin/sendmail'
//         })
//         let mailOptions = {
//             from: from,
//             to: to,
//             subject: subject,
//             html: template
//         }
//         return await transporter.sendMail(mailOptions,
//             (error, info) => {
//                 if (error) {
//                     console.log('Email failed', error);
//                 }
//             }
//         );

//     } catch (e) {
//         console.log(e)
//     }
// }


/** read administrator template and send mail to administrator */
// const ADMINISTRATORMAIL = (templateData) => {
//     readHTMLFile(path.join(__dirname, `../emailTemplates/${EMAILCONSTANT.ADMINISTRATOR_MAIL.template}.html`), async function (err, html) {
//         try {
//             const compiledTemplate = handlebars.compile(html);
//             const htmlToSend = compiledTemplate(templateData);
//             const subject = EMAILCONSTANT.ADMINISTRATOR_MAIL.subject;
//             const to = global.config.ADMINISTRATOR_EMAIL;
//             sendMailToAdminstrator(to, subject, htmlToSend)
//         } catch (e) {

//             console.log("error", e)
//         }
//     })
// } 