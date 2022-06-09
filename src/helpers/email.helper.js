
const nodemailer = require('nodemailer');
exports.sendEmail = async (to, subject, template, from = process.env.FROM_EMAIL) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'jaysanghavi.jnext@gmail.com',
            pass: 'Jay@1525'
        }
    });
    try {
        return await transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            html: template

        })

    } catch (error) {
        throw (new Error("Email failed"))
    }
}
exports.resetPasswordTemplate = (id, token) => {
    let url = `${process.env.RESET_URL}/${id}/${token}`

}

exports.passwordChanged = (changedPassword) => {

    

}
exports.welcomeTempalte = (firstname) => {
   
}
exports.contactTemplate = (data) => {


    const html = `
  New contact From below details
  <p> Name : ${data.fullname} </p>
  <p> Email : ${data.email} </p>
  <p> Message : ${data.message} </p>
  <p> Addtional Details : ${data.additional_details} </p>
  `
    return html;

}


exports.varifyTemplate = (code, email) => {


}






