const moment = require('moment');
const path = require('path')
const handlebars = require('handlebars')
const { User, UserMeta, UserAuth } = require('../models')
const { encrypt, generateOtp, comparePassword } = require("../helpers/utils")
const { readHTMLFile } = require("../helpers/common")
const { EMAILCONSTANT } = require("../helpers/constant")
const { sendEmail } = require("../helpers/email.helper")
const { generateToken } = require("../helpers/auth.token");


exports.register = async (req, res) => {
    try {
        var body = req.body
        if (!body) {
            return res.status(400).send({ status: false, message: 'ERROR_BODY' })
        }
        // check for unique email 
        let CheckExistsUsers = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (CheckExistsUsers) {
            var UserAuth1 = await UserAuth.findOne({ where: { user_id: CheckExistsUsers.user_id } })
            if (UserAuth1) {
                return res.status(400).send({ status: false, message: 'email already exist' })
            }
            return res.status(400).send({ status: false, message: 'ERROR_EMAIL_ALREADY_EXIST' })
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
            return res.status(400).send({ status: false, message: 'Something went wrong could not create user' })
        }

        var UserMetaCreate = {
            user_id: UserInfo.user_id,
            type: 'email',
            data: body.email
        }
        let UserMetaInfo = await UserMeta.create(UserMetaCreate)
        console.log(UserMetaInfo)

        let templateData = {
            LOGO: global.config.EMAIL_BASE_URL + EMAILCONSTANT.IMAGES.logo,
            OTP: otp,
            URL: global.config.EMAIL_BASE_URL + EMAILCONSTANT.SIGNUP_OTP.url(body.email)

        }
        console.log(templateData)
        readHTMLFile(path.join(__dirname, `../emailTemplates/${EMAILCONSTANT.SIGNUP_OTP.template}.html`), async function (err, html) {
            try {
                const compiledTemplate = handlebars.compile(html);
                const htmlToSend = compiledTemplate(templateData);
                const subject = EMAILCONSTANT.SIGNUP_OTP.subject;
                const to = body.email;
                sendEmail(to, subject, htmlToSend)
                console.log("to, subject, htmlToSend", to, subject, htmlToSend)
            } catch (e) {
                console.log("error", e)
            }
        })

        return res.status(200).send({ status: true, message: 'Successfully User created, Verification Mail was sent' })

    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

// Login 
exports.login = async (req, res) => {
    try {
        let body = req.body;

        //check user 
        let CheckUserExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserExists) {
            return res.status(400).send({ status: false, message: 'User not Found' })
        }

        let UserVerify = await User.findOne({ where: { user_id: CheckUserExists.user_id } })
        if (!UserVerify) {
            return res.status(400).send({ status: false, message: 'User not Found, please enter valid data' });
        }
        if (UserVerify.password == null) {
            return res.status(400).send({ status: false, message: 'Please enter valid password' })
        }


        const VerifyPassword = await comparePassword(body.password, UserVerify.password)
        if (!VerifyPassword) {
            return res.status(400).send({ status: false, message: 'someting went wrong ' })
        }

        const token = generateToken({ id: CheckUserExists.user_id, email: body.email })

        if (UserVerify.status !== User.Status === "active") {
            return res.status(200).send({
                status: false,
                message: 'User not verify ',
                user_Verify_status: User.Status.PENDING
            });
        }
        let responseObj = {
            user_id: UserVerify.user_id,
            email: body.email,
            token: token,
        }
        return res.status(200).send({ status: true, message: 'Successfully User login', data: responseObj })

    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        let body = req.body;
        //check user 
        let CheckUserMeta = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserMeta) {
            return res.status(400).send({ status: false, message: 'ERROR_EMAIL_NOT_EXIST' })
        }

        let CheckUser = await User.findOne({ where: { user_id: CheckUserMeta.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: 'ERR_USER_NOT_FOUND' });
        }

        if (body.type == 'register' && CheckUser.status === User.Status.ACTIVE) {
            return res.status(400).send({ status: false, message: 'ERROR_USER_ALREADY_VERIFY' })
        }

        if (CheckUser.otp != body.otp) {
            return res.status(400).send({ status: false, message: 'ERROR_INVALID_OTP' })
        }

        if (moment(CheckUser.otp_exp_time) < moment(new Date())) {
            return res.status(400).send({ status: false, message: 'ERROR_OTP_EXPIRED' })
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
        return res.status(200).send({ status: true, message: 'SUCCESS_OTP_VERIFIED', data: responseObj });
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

exports.forgotPassword = async (req, res) => {
    try {

        let body = req.body;
        console.log(body)

        let CheckUserExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserExists) {
            return res.status(400).send({ status: false, message: 'Email not found' })
        }

        let CheckUser = await User.findOne({ where: { user_id: CheckUserExists.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: 'User Not Found' });
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
            return res.status(200).send({ status: false, message: 'User Not Verify', data: responseData })
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
        return res.status(200).send({ status: true, message: 'Successfully OTP Send' })
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }

}

exports.resetPassword = async (req, res) => {
    try {
        let body = req.body;
        console.log(body)

        let CheckUserExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserExists) {
            return res.status(400).send({ status: false, message: 'Error Email not Found' })
        }

        let CheckUser = await User.findOne({ where: { user_id: CheckUserExists.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: 'User not found' });
        }

        if (CheckUser.otp != body.otp) {
            return res.status(400).send({ status: false, message: "Please enter valid OTP" })
        }

        if (moment(CheckUser.otp_exp_time) < moment(new Date())) {
            return res.status(400).send({ status: false, message: 'OTP was expired please enter valid OTP' })
        }
        if (CheckUser.password == null) {
            let updatepass = await User.update({ password: encrypt(body.password) }, { where: { user_id: CheckUser.user_id } })
            return res.status(200).send({ status: true, message: 'Password successfully reset' })
        }
        const isPasswordCheck = await comparePassword(body.password, CheckUser.password)
        if (isPasswordCheck) {
            return res.status(400).send({ status: false, message: 'New_Password Must be different' })
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

        return res.status(200).send({ status: true, message: 'Password successfully reset', data: responseData })
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

exports.resendOtp = async (req, res) => {
    try {

        let body = req.body;
        console.log(body)

        //check user 
        let CheckUserExists = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!CheckUserExists) {
            return res.status(400).send({ status: false, message: 'Email is not found' })
        }
        let CheckUser = await User.findOne({ where: { user_id: CheckUserExists.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: 'User not found' });
        }

        if (body.type == 'register' && CheckUser.status === User.Status.ACTIVE) {
            return res.status(400).send({ status: false, message: 'User is already verify' })
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
            return res.status(200).send({ status: true, message: 'successfully OTP Reset' })
        } else {
            return res.status(200).send({ status: true, message: 'successfully OTP sent' })
        }
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

