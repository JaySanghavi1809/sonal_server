const { User, UserAuth, UserMeta, UserChannel, TempMaster } = require('../models')
const path = require('path')
const fs = require('fs')
const { Op } = require('sequelize')


exports.GetUser = async (req, res) => {

    try {
        let UserObj = {}
        /** fin user Data */
        let findUserData = await User.findOne({ where: { user_id: req.user.user_id } })
        if (!findUserData) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') })
        }
        UserObj.uses_id = findUserData.user_id
        UserObj.firstName = findUserData.first_name
        UserObj.lastName = findUserData.last_name

        /** find email */
        let UserDETAILS = await UserMeta.findOne({ where: { user_id: req.user.user_id, type: "email" } })
        if (!UserDETAILS) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') })
        }

        UserObjuser_id = UserDETAILS.user_id
        UserObjemail = UserDETAILS.data

        /** find mobile number */
        let UserMobile = await UserMeta.findOne({ where: { user_id: UserDETAILS.user_id, type: "phone" } })
        if (UserMobile) {
            UserObj.mobile = UserMobile.data
        }


        /** find channel name  */
        let channeldata = await UserChannel.findOne({ where: { user_id: UserDETAILS.user_id } })
        UserObj.channel_name = channeldata ? channeldata.channel_name : " "
        console.log(UserObj.channel_name)

        return res.status(200).send({
            status: true,
            message: res.__('SUCCESS_FETCHED'),
            data: UserObj
        })

    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

exports.EditUser = async (req, res) => {
    try {
        let body = req.body

        let CheckUser = await UserMeta.findOne({ where: { user_id: req.user.user_id, type: 'email' } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        let CheckEmailAvail = await UserMeta.findOne({
            where: {
                data: body.email,
                type: "email",
                [Op.not]: {
                    user_id: CheckUser.user_id
                }
            }
        })
        await UserMeta.update({ data: body.email }, { where: { user_id: CheckUser.user_id, type: "email" } })
        if (CheckEmailAvail) {
            return res.status(400).send({ status: false, message: res.__('ERROR_EMAIL_ALREADY_EXIST') });
        }

        let UserPhone = await UserMeta.findOne({ where: { type: "phone", user_id: CheckUser.user_id } })
        if (!UserPhone) {
            await UserMeta.create({ user_id: CheckUser.user_id, data: body.mobile, type: "phone" })
        } else {
            await UserMeta.update({ data: body.mobile }, { where: { user_id: UserPhone.user_id, type: "phone" } })
        }

        let UpdateUser = await User.findOne({ where: { user_id: CheckUser.user_id } })
        if (UpdateUser) {
            let UpdateUser = await User.update({ first_name: body.first_name, last_name: body.last_name, type: "phone", channel_name: body.channel_name }, { where: { user_id: CheckUser.user_id } })
            return res.status(200).send({
                status: true,
                message: res.__('Update_USER'),
                data: {
                    first_name: body.firstName,
                    last_name: body.lastName,
                    type: "phone",
                    channel_name: body.channel_name
                }
            });
        }

        let objUser = {
            first_name: body.firstName,
            last_name: body.lastName,
            type: "phone",
            channel_name: body.channel_name

        }
        res.status(200).json({
            status: true,
            message: res.__("CHANNEL_CREATED_SUCCESS"),
            data: objUser
        })

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: e.message });

    }
}

