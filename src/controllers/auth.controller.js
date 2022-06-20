const moment = require('moment');
const path = require('path')
const handlebars = require('handlebars');
const i18n = require('i18n')
const { User, UserMeta, UserAuth } = require('../models')
const { encrypt, generateOtp, comparePassword } = require("../helpers/utils")
const { readHTMLFile } = require("../helpers/common")
const { EMAILCONSTANT } = require("../helpers/constant")
const { sendEmail } = require("../helpers/email.helper")
const { generateToken } = require("../helpers/auth.token");

exports.register = async (req, res, next) => {
    try {
        var body = req.body
        if (!body) {
            return res.status(400).send({ status: false, message: res.__('ERROR_BODY') })
        }
        // check for unique email 
        let CheckExistsUsers = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (CheckExistsUsers) {
            var UserAuth1 = await UserAuth.findOne({ where: { user_id: CheckExistsUsers.user_id } })
            if (UserAuth1) {
                return res.status(400).send({ status: false, message: res.__('ERROR_ALREADY_LOGIN') })
            }
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_ALREADY_EXIST') })
        }
        var otp = generateOtp(6);
        let CreateUser = {
            first_name: body.firstName,
            last_name: body.lastName,
            password: encrypt(body.password),
            otp: otp,
            otp_exp_time: moment(new Date()).add(global.config.OTP_EXPIRE_TIME, 'seconds').format('YYYY-MM-DD HH:mm:ss')
        }
        let UserInfo = await User.create(CreateUser);
        if (!UserInfo) {
            return res.status(400).send({ status: false, message: res.__('ERROR_USER_NOT_CREATED') })
        }

        var UserMetaCreate = {
            user_id: UserInfo.user_id,
            type: 'email',
            data: body.email
        }
        let UserMetaInfo = await UserMeta.create(UserMetaCreate)
        let templateData = {
            LOGO: global.config.EMAIL_BASE_URL + EMAILCONSTANT.IMAGES.logo,
            OTP: otp,
            URL: global.config.EMAIL_BASE_URL + EMAILCONSTANT.SIGNUP_OTP.url(body.email)

        }
        readHTMLFile(path.join(__dirname, `../emailTemplates/${EMAILCONSTANT.SIGNUP_OTP.template}.html`), async function (err, html) {
            try {
                const compiledTemplate = handlebars.compile(html);
                const htmlToSend = compiledTemplate(templateData);
                const subject = EMAILCONSTANT.SIGNUP_OTP.subject;
                const to = body.email;
                sendEmail(to, subject, htmlToSend)
            } catch (e) {
                console.log("error", e)
            }
        })

        return res.status(200).send({ status: true, message: res.__('SUCCESS_VERIFICATION_MAIL_SENT') })

    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}
exports.login = async (req, res) => {
    try {
        let body = req.body;

        let CheckUserExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserExists) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }

        let UserVerify = await User.findOne({ where: { user_id: CheckUserExists.user_id } })
        if (!UserVerify) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        if (UserVerify.password == null) {
            return res.status(400).send({ status: false, message: res.__('ERROR_LOGIN_PASSWORD') })
        }
        const VerifyPassword = await comparePassword(body.password, UserVerify.password)
        if (!VerifyPassword) {
            return res.status(400).send({ status: false, message: res.__('ERROR_INCORRECT_PASSWORD') })
        }
        const token = generateToken({ id: CheckUserExists.user_id, email: body.email })

        if (UserVerify.status !== User.Status === "active") {
            return res.status(200).send({
                status: false,
                message: res.__('ERR_USER_NOT_VERIFY'),
                user_Verify_status: User.Status === "pending"
            });
        }
        let responseObj = {
            user_id: UserVerify.user_id,
            email: body.email,
            token: token,
        }
        return res.status(200).send({ status: true, message: res.__('SUCCESS_LOGIN'), data: responseObj })
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        let body = req.body;
        let CheckUserMeta = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserMeta) {
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_NOT_EXIST') })
        }
        let CheckUser = await User.findOne({ where: { user_id: CheckUserMeta.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        if (body.type == 'register' && CheckUser.status === User.Status === "active") {
            return res.status(400).send({ status: false, message: res.__('ERROR_USER_ALREADY_VERIFY') })
        }
        if (CheckUser.otp != body.otp) {
            return res.status(400).send({ status: false, message: res.__('ERROR_INVALID_OTP') })
        }
        if (moment(CheckUser.otp_exp_time) < moment(new Date())) {
            return res.status(400).send({ status: false, message: res.__('ERROR_OTP_EXPIRED') })
        }
        var UserUpdate = User.update({ otp: null, otp_exp_time: null, status: User.Status === "active" }, { where: { user_id: CheckUser.user_id } });

        const token = generateToken({ id: UserUpdate.user_id, email: body.email })

        let templateData = {
            LOGO: global.config.EMAIL_BASE_URL + EMAILCONSTANT.IMAGES.logo,
            URL: global.config.EMAIL_BASE_URL + EMAILCONSTANT.WELCOME_VERIFIED.url
        }
        readHTMLFile(path.join(__dirname, `../emailTemplates/${EMAILCONSTANT.WELCOME_VERIFIED.template}.html`), async function (err, html) {
            try {
                const compiledTemplate = handlebars.compile(html);
                const htmlToSend = compiledTemplate(templateData);
                const subject = EMAILCONSTANT.WELCOME_VERIFIED.subject;
                const to = body.email;
                sendEmail(to, subject, htmlToSend)
            } catch (e) {
                console.log("error", e)
            }
        })
        let responseObj = {
            user_id: CheckUser.user_id,
            email: body.email,
            token: token,
        }
        return res.status(200).send({ status: true, message: res.__('SUCCESS_OTP_VERIFIED'), data: responseObj });
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}
exports.forgotPassword = async (req, res) => {
    try {

        let body = req.body;
        // console.log(body)

        let CheckUserExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserExists) {
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_NOT_EXIST') })
        }

        let CheckUser = await User.findOne({ where: { user_id: CheckUserExists.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        var otp = generateOtp(6);
        var UserUpdate = User.update({ otp: otp, otp_exp_time: moment(new Date()).add(global.config.OTP_EXPIRE_TIME, 'seconds').format('YYYY-MM-DD HH:mm:ss') }, { where: { user_id: CheckUser.user_id } });
        let templateData = {
            LOGO: global.config.EMAIL_BASE_URL + EMAILCONSTANT.IMAGES.logo,
            OTP: otp,
            URL: global.config.EMAIL_BASE_URL + EMAILCONSTANT.FORGOT.url(body.email)
        }
        if (CheckUser.status === User.Status === "active") {
            var responseData = {
                user_id: CheckUser.user_id,
                email: body.email,
                status: CheckUser.status
            }
            templateData.URL = global.config.EMAIL_BASE_URL + EMAILCONSTANT.SIGNUP_OTP.url(body.email)
            readHTMLFile(path.join(__dirname, `../emailTemplates/${EMAILCONSTANT.SIGNUP_OTP.template}.html`), async function (err, html) {
                try {
                    const compiledTemplate = handlebars.compile(html);
                    const htmlToSend = compiledTemplate(templateData);
                    const subject = EMAILCONSTANT.SIGNUP_OTP.subject;
                    const to = body.email;
                    sendEmail(to, subject, htmlToSend)
                } catch (e) {
                    console.log("error", e)
                }
            })
            return res.status(200).send({ status: false, message: res.__('ERR_USER_NOT_VERIFY'), data: responseData })
        }
        readHTMLFile(path.join(__dirname, `../emailTemplates/${EMAILCONSTANT.FORGOT.template}.html`), async function (err, html) {
            try {
                const compiledTemplate = handlebars.compile(html);
                const htmlToSend = compiledTemplate(templateData);
                const subject = EMAILCONSTANT.FORGOT.subject;
                const to = body.email;
                sendEmail(to, subject, htmlToSend)
            } catch (e) {
                console.log("error", e)

            }
        })
        return res.status(200).send({ status: true, message: res.__('SUCCESS_OTP_SEND') })
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }

}
exports.resetPassword = async (req, res) => {
    try {
        let body = req.body;
        // console.log(body)

        let CheckUserExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserExists) {
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_NOT_EXIST') })
        }
        let CheckUser = await User.findOne({ where: { user_id: CheckUserExists.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        if (CheckUser.otp != body.otp) {
            return res.status(400).send({ status: false, message: res.__('ERROR_INVALID_OTP') })
        }

        if (moment(CheckUser.otp_exp_time) < moment(new Date())) {
            return res.status(400).send({ status: false, message: res.__('ERROR_OTP_EXPIRED') })
        }

        const isPasswordCheck = await comparePassword(body.password, CheckUser.password)
        if (isPasswordCheck) {
            return res.status(400).send({ status: false, message: res.__('ERROR_NEW_PASSWORD_MUST_DIFFERENT') })
        }

        var UserUpdate = {
            password: encrypt(body.password),
            otp: null,
            otp_exp_time: null
        }

        var UserUpdate = User.update(UserUpdate, { where: { user_id: CheckUser.user_id } });

        const token = generateToken({ id: CheckUserExists.user_id, email: body.email })

        var responseData = {
            user_id: CheckUser.user_id,
            email: body.email,
            token: token
        }

        return res.status(200).send({ status: true, message: res.__('SUCCESS_RESET_PASSWORD'), data: responseData })
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}
exports.resendOtp = async (req, res) => {
    try {

        let body = req.body;
        // console.log(body)
        let CheckUserExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserExists) {
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_NOT_EXIST') })
        }
        let CheckUser = await User.findOne({ where: { user_id: CheckUserExists.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }

        if (body.type == 'register' && CheckUser.status === User.Status.ACTIVE) {
            return res.status(400).send({ status: false, message: res.__('ERROR_USER_ALREADY_VERIFY') })
        }
        var otp = generateOtp(6);

        var UserUpdateData = User.update({ otp: otp, otp_exp_time: moment(new Date()).add(global.config.OTP_EXPIRE_TIME, 'seconds').format('YYYY-MM-DD HH:mm:ss') }, { where: { user_id: CheckUser.user_id } });

        let url
        if (body.type == 'register') {
            url = global.config.EMAIL_BASE_URL + `verify-otp/${body.email}`
        } else if (body.type == 'forgot') {
            url = global.config.EMAIL_BASE_URL + `reset-password/${body.email}`
        }

        let templateData = {
            LOGO: global.config.EMAIL_BASE_URL + EMAILCONSTANT.IMAGES.logo,
            OTP: otp,
            URL: url
        }
        readHTMLFile(path.join(__dirname, `../emailTemplates/${EMAILCONSTANT.RESENDOTP.template}.html`), async function (err, html) {
            try {
                const compiledTemplate = handlebars.compile(html);
                const htmlToSend = compiledTemplate(templateData);
                const subject = EMAILCONSTANT.RESENDOTP.subject;
                const to = body.email;
                sendEmail(to, subject, htmlToSend)
            } catch (e) {
                console.log("error", e)
            }
        })
        if (body.type === 'resend') {
            return res.status(200).send({ status: true, message: res.__('SUCCESS_OTP_RESEND') })
        } else {
            return res.status(200).send({ status: true, message: res.__('SUCCESS_OTP_SEND') })
        }
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

