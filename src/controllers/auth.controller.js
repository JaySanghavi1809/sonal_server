const moment = require('moment');
const path = require('path')
const { User, UserMeta, UserAuth } = require('../models')
const handlebars = require('handlebars')
const { readHTMLFile } = require("../helpers/common")
const { encrypt, generateOtp, comparePassword } = require("../helpers/utils")
const { EMAILCONSTANT } = require("../helpers/constant")
const { sendMail } = require("../helpers/email.helper")
const { generateToken } = require("../helpers/auth.token");



//User Signup:-
exports.register = async (req, res) => {
    try {
        var body = req.body
        console.log(body)

        if (!body) {
            return res.status(400).json({ status: false, message: 'Body data error' })
        }
        //check email address valid or not:
        var checkExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (checkExists) {
            var UserAuthInfo = await UserAuth.findOne({ where: { user_id: checkExists.user_id } })
        }
        if (UserAuthInfo) {
            return res.status(400).send({ status: false, message: "Email is Already Exists try to login" })
        }

        var otp = generateOtp(6);

        //Create new User:
        var CreateUser = {
            first_name: body.firstName,
            last_name: body.lastName,
            password: encrypt(body.password),
            otp: otp,
            otp_exp_time: moment(new Date()).add(process.env.OTP_EXPIRE_TIME, 'seconds').format('YYYY-MM-DD HH:mm:ss')
        }

        let UserInfo = await User.create(CreateUser)
        if (!UserInfo) {
            return res.status(400).send({ status: false, message: "Something went wrong, could't create User" })

        }

        var UserMetaCreate = {
            user_id: UserInfo.user_id,
            type: 'email',
            data: body.email
        }

        let UserMetaInfo = await UserMeta.create(UserMetaCreate)

        let templateData = {
            LOGO: process.env.EMAIL_BASE_URL + EMAILCONSTANT.IMAGES.logo,
            URL: process.env.EMAIL_BASE_URL + EMAILCONSTANT.WELCOME_VERIFIED.url
        }
        readHTMLFile(path.join(__dirname, `../emailTemplates/${EMAILCONSTANT.SIGNUP_OTP.template}.html`), async function (err, html) {
            try {
                const compiledTemplate = handlebars.compile(html);
                const htmlToSend = compiledTemplate(templateData);
                const subject = EMAILCONSTANT.SIGNUP_OTP.subject;
                const to = body.email;
                sendMail(to, subject, htmlToSend)
            } catch (e) {
                console.log("error", e)
            }
        })

        return res.status(200).send({ status: true, message: "user create successfully mail sent" })

    } catch (e) {
        console.log('error', e);
        return res.send({ status: false, message: e.message })
    }
}
// Login 
exports.login = async (req, res) => {
    try {
        let body = req.body;
        console.log(body)

        let checkExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!checkExists) {
            return res.status(400).send({ status: false, message: "Not Found" })
        }

        let UserVerify = await User.findOne({ where: { user_id: checkExists.user_id } })
        if (!UserVerify) {
            return res.status(400).send({ status: false, message: "User Not Found" });
        }
        if (UserVerify.password == null) {
            return res.status(400).send({ status: false, message: "please enter correct password" })
        }

        const verifyPassword = await comparePassword(body.password, UserVerify.password)
        if (!verifyPassword) {
            return res.status(400).send({ status: false, message: "please enter correct password" })
        }

        const token = generateToken({ id: checkExists.user_id, email: body.email })

        if (UserVerify.status !== User.Status.ACTIVE) {
            console.log(UserVerify.status !== User.Status.ACTIVE)
            return res.status(200).send({
                status: false,
                message: "something went wrong",
                user_Verify_status: User.Status.PENDING
            });
        }
        let responseObj = {
            user_id: UserVerify.user_id,
            email: body.email,
            token: token,
        }
        return res.status(200).send({ status: true, message: "User successfullly login", data: responseObj })

    } catch (e) {
        console.log('Error', e);
        return res.send({ status: false, message: e.message })
    }
}

