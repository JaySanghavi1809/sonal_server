const moment = require('moment');
const path = require('path')
const i18n = require('i18n')
const { User, UserMeta, UserAuth } = require('../models')
const { encrypt, generateOtp, comparePassword } = require("../helpers/utils")
const { generateToken } = require("../helpers/auth.token")


exports.register = async (req, res, next) => {
    try {
        const body = req.body

        //check email address
        let UserEmail = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (UserEmail) {
            var UserExists = await User.findOne({ where: { user_id: UserEmail.user_id } })
            if (UserExists) {
                return res.status(400).send({
                    status: false,
                    message: res.__('ERROR_EMAIL_ALREADY_EXIST')
                })
            }
            return res.status(400).send({
                status: false,
                message: res.__('ERROR_EMAIL_ALREADY_EXIST')
            })

        }
        var otp = generateOtp(6);
        let RegisterNewUser = {
            first_name: body.firstName,
            last_name: body.lastName,
            password: encrypt(body.password),
            otp: otp,
            otp_exp_time: moment(new Date()).add(global.config.OTP_EXPIRE_TIME, 'seconds').format('YYYY-MM-DD HH:mm:ss')
        }

        let UserCreate = await User.create(RegisterNewUser);
        console.log(UserCreate)
        if (!UserCreate) {
            return res.status(400).send({
                status: false,
                message: res.__('ERROR_USER_NOT_CREATED')
            })
        }
        var UserMetaRegister = {
            user_id: UserCreate.user_id,
            type: 'email',
            data: body.email
        }
        let RegisterMeta = await UserMeta.create(UserMetaRegister)
        return res.status(200).send({ status: true, message: res.__('SUCCESS_VERIFICATION_MAIL_SENT') })


    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }

}

exports.login = async (req, res) => {
    try {
        let body = req.body;
        console.log(body)

        let UserEmail = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!UserEmail) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }

        let UserExists = await User.findOne({ where: { user_id: UserEmail.user_id } })
        if (!UserExists) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        if (UserExists.password == null) {
            return res.status(400).send({ status: false, message: res.__('ERROR_LOGIN_PASSWORD') })
        }
        const validatePassword = await comparePassword(body.password, UserExists.password)
        if (!validatePassword) {
            return res.status(400).send({ status: false, message: res.__('ERROR_INCORRECT_PASSWORD') })
        }
        const token = generateToken({ id: UserExists.user_id, email: body.email })

        if (UserExists.status !== User.Status === "active") {
            return res.status(200).send({
                status: false,
                message: res.__('ERR_USER_NOT_VERIFY'),
                user_Verify_status: User.Status === "pending"
            });
        }
        let responseObj = {
            user_id: UserExists.user_id,
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
        let UserEmail = await UserMeta.findOne({ where: { type: "email", data: body.email } })
        if (!UserEmail) {
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_NOT_EXIST') })
        }

        let UserExists = await User.findOne({ where: { user_id: UserEmail.user_id } })
        if (!UserExists) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }

        if (body.type == 'register' && UserExists.status == "active") {
            return res.status(400).send({ status: false, message: res.__('ERROR_USER_ALREADY_VERIFY') })
        }

        if (UserExists.otp != body.otp) {
            return res.status(400).send({ status: false, message: res.__('ERROR_INVALID_OTP') })
        }

        if (moment(UserExists.otp_exp_time) < moment(new Date())) {
            return res.status(400).send({ status: false, message: res.__('ERROR_OTP_EXPIRED') })
        }

        var UserUpdateData = User.update({ otp: null, otp_exp_time: null, status: User.Status == "active" }, { where: { user_id: UserExists.user_id } });

        const token = generateToken({ id: UserEmail.user_id, email: body.email })
        let responseObj = {
            user_id: UserExists.user_id,
            email: body.email,
            token: token
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

        let UserEmail = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!UserEmail) {
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_NOT_EXIST') })
        }

        let CheckUser = await User.findOne({ where: { user_id: UserEmail.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        var otp = generateOtp(6);
        var UserUpdate = User.update({ otp: otp, otp_exp_time: moment(new Date()).add(global.config.OTP_EXPIRE_TIME, 'seconds').format('YYYY-MM-DD HH:mm:ss') }, { where: { user_id: CheckUser.user_id } });

        if (CheckUser.status === User.Status === "active") {
            var responseData = {
                user_id: CheckUser.user_id,
                email: body.email,
                status: CheckUser.status
            }
            return res.status(200).send({ status: false, message: res.__('ERR_USER_NOT_VERIFY'), data: responseData })
        }
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

        let UserEmail = await UserMeta.findOne({ where: { type: 'email', data: body.email } })
        if (!UserEmail) {
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_NOT_EXIST') })
        }
        let CheckUser = await User.findOne({ where: { user_id: UserEmail.user_id } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        if (CheckUser.otp != body.otp) {
            return res.status(400).send({ status: false, message: res.__('ERROR_INVALID_OTP') })
        }

        if (moment(CheckUser.otp_exp_time) < moment(new Date())) {
            return res.status(400).send({ status: false, message: res.__('ERROR_OTP_EXPIRED') })
        }

        const checkPassword = await comparePassword(body.password, CheckUser.password)
        if (checkPassword) {
            return res.status(400).send({ status: false, message: res.__('ERROR_NEW_PASSWORD_MUST_DIFFERENT') })
        }

        var UserUpdate = {
            password: encrypt(body.password),
            otp: null,
            otp_exp_time: null
        }

        var UserUpdate = User.update(UserUpdate, { where: { user_id: CheckUser.user_id } });

        const token = generateToken({ id: CheckUser.user_id, email: body.email })

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

        if (body.type == 'register' && UserExists.status !== "active") {
            return res.status(400).send({ status: false, message: res.__('ERROR_USER_ALREADY_VERIFY') })
        }
        var otp = generateOtp(6);

        var UserUpdateData = User.update({ otp: otp, otp_exp_time: moment(new Date()).add(global.config.OTP_EXPIRE_TIME, 'seconds').format('YYYY-MM-DD HH:mm:ss') }, { where: { user_id: CheckUser.user_id } });

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

