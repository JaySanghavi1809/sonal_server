const errorHelper = require("../helpers/error.helper")
const authHelper = require("../helpers/auth.helper");
const { User} = require("../models");
const emailHelper = require('../helpers/email.helper');
const utils = require('../helpers/util');
const UserMeta = require("../models/UserMeta");

exports.register = async (req, res, next) => {
    try {
        let body = req.body;
        console.log(body)

        let otp = utils.genrateCode();
        body.otpCode = otp;
        body.optExpirationTime = utils.getCurrentTime();
        let checkExists = await User.findOne({ where: { email: body.email } });

        if (checkExists && checkExists !== null && checkExists !== '' && checkExists !== undefined) {
            return res.status(201).json({ success: false, message: "USER_EXIST" })
        } else {
            let user = await User.create(body);
            console.log(user)

            emailHelper.sendEmail(user.email, VERIFY_SUBJECT, emailHelper.varifyTemplate(otp, user.email));

            //emailHelper.sendEmail(user.email, "Welcome to motzza", emailHelper.welcomeTempalte(user.fullname))
            return res.status(200).json({ success: true, message: "REGISTRATION_MESSAGE" })
        }

    } catch (error) {
        console.log("Error : ", error)
        next(errorHelper.AppEror(error.message))
    }

}
exports.login = async (req, res, next) => {
    try {
        let result = await authHelper.getToken(req, res, next)
        console.log(result.getToken)
        res.send(result)

    } catch (error) {
        console.log("", error)
        next(error)
    }
}

exports.token = async (req, res, next) => {
    try {

        await authHelper.getRefreshToken(req, res, next)


    } catch (error) {
        console.log("", error)
        next(error)
    }
}
exports.forgotPassowrd = async (req, res, next) => {


    try {
        let email = req.params.email;
        let users = await User.findAll({
            where: {
                email: email,
            }
        });
        if (users && users.length > 0) {
            let user = users[0];
            console.log("user.createdAt", user.createdAt)
            let secretKey = authHelper.getForgotSecret(user.password, user.createdAt);

            let expireTime = process.env.EMAIL_TOKEN_LIFE || 3600000
            console.log("secret", secretKey, user.id, expireTime)
            let token = authHelper.createToken({ id: user.id }, user.password, expireTime);
            console.log("token", token)
            try {
                let template = emailHelper.resetPasswordTemplate(user.id, token)
                let info = await emailHelper.sendEmail(user.EMAIL, RESET_SUBJECT, template)
                console.log(info)

                res.json({ sucess: true, message: RESET_MESSAGE })

            } catch (error) {
                next(errorHelper.AppEror(error.message))

            }

        } else
            next(errorHelper.NotFoud(`${email} not found`))

    } catch (error) {
        console.log("", error)
        next(errorHelper.AppEror(error.message))
    }



}
exports.resetPassword = async (req, res, next) => {


    try {
        let password = req.body.password;
        let token = req.body.token;
        let id = req.params.id;
        let user = await User.findOne({
            where: {
                id: id
            }
        });
        console.log("USer", user);
        if (user) {
            //res.json(users[0])
            let secretKey = authHelper.getForgotSecret(user.password, user.createdAt);
            let expireTime = process.env.EMAIL_TOKEN_LIFE || 3600000
            let stoken = authHelper.createToken({ id: user.id }, secretKey, expireTime);

            try {

                if (true) {
                    let result = await User.update({ password: password }, {
                        where: {
                            id: id,
                            isVarify: 1
                        },
                        raw: true
                    });
                    console.log("result", result)
                    if (result) {

                        emailHelper.sendEmail(user.email, "Password successfully changed!", emailHelper.passwordChanged(password));
                        res.json({ success: true, message: PASSWORD_RESET_MESSAGE })
                    }


                } else {
                    next(errorHelper.AppEror(INVALID_TOKEN))
                }



            } catch (error) {
                next(errorHelper.AppEror(error.message))

            }

        } else
            next(errorHelper.NotFoud(`User not found`))

    } catch (error) {
        console.log("", error)
        next(errorHelper.AppEror(error.message))
    }



}


exports.varifyCode = async (req, res, next) => {
    try {

        let email = req.params.email;
        let code = req.params.code;
        if (!email || !code) throw (errorHelper.AppEror(INVALID_PAYLOAD));

        let user = await User.findOne({
            where: {
                email: email/*,
                otpCode: code*/
            },
            raw: true
        });

        if (user) {
            if (user.isVarify == true) {
                next(errorHelper.CustomError("User already verified", 401))
            } else {
                if (user.otpCode == code) {
                    let diff;
                    console.log("user", user);
                    if (user.optExpirationTime) {
                        diff = utils.getCurrentTimeDiff(user.optExpirationTime)
                    }
                    console.log("diff", diff, EMAIL_CODE_LIFE)
                    if (diff <= EMAIL_CODE_LIFE) {
                        let result = await User.update({ isVarify: true, otpCode: null }, {
                            where: {
                                email: email
                            },
                            raw: true
                        })
                        console.log(result);
                        emailHelper.sendEmail(user.email, "Welcome ", emailHelper.welcomeTempalte(user.fullname))
                        let token = await authHelper.getToken(req, res, next)
                        res.json({ status: true, access_token: token.access_token, refresh_token: token.refresh_token })
                    } else {
                        next(errorHelper.CustomError("Code Expire", 424))
                    }
                } else {
                    next(errorHelper.CustomError("Invalid Code", 401))
                }
            }

        } else {
            next(errorHelper.CustomError(EMAIL_MESSAGE, 401))
        }

    } catch (error) {
        console.log("", error)
        next(error)
    }
}

exports.resendCode = async (req, res, next) => {
    try {
        let email = req.params.email;
        if (!email) throw (errorHelper.AppEror(INVALID_PAYLOAD));

        let user = await User.findOne({
            where: {
                email: email,
            }
        });
        if (user) {
            if (user.isVarify == true) {
                next(errorHelper.CustomError("User already verified", 401))
            } else {
                let code = utils.genrateCode();
                let optExpirationTime = utils.getCurrentTime();
                let result = await User.update({ otpCode: code, optExpirationTime: optExpirationTime }, {
                    where: {
                        email: email
                    },
                    raw: true
                })

                emailHelper.sendEmail(user.email, VERIFY_SUBJECT, emailHelper.varifyTemplate(code, user.email));
                res.json({ status: true })
            }
        }
        else {
            next(errorHelper.NotFoud());
        }
    } catch (error) {
        console.log("", error)
        next(error)
    }
}
