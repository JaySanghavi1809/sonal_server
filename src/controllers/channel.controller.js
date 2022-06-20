const { UserChannel, TempMaster, UserMeta, User } = require('../models');
const { Op } = require('sequelize')
exports.CreateChannel = async (req, res) => {
    try {
        let body = req.body
        let CheckUser = await UserMeta.findOne({ where: { user_id: req.user.user_id, type: 'email' } })
        if (!CheckUser) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }
        let CheckChannel = await UserChannel.findOne({ where: { channel_name: body.channel_name, user_id: CheckUser.user_id } })
        if (CheckChannel) {
            return res.status(400).send({ status: false, message: res.__('ERR_CHANNEL_EXIST') });
        }

        let CheckTemplateExist = await TempMaster.findOne({ where: { id: body.template_id } })
        if (!CheckTemplateExist) {
            return res.status(400).send({ status: false, message: res.__('ERR_TEMPLATE_NOT_EXIST') });
        }

        let UpdateChannelName = await UserChannel.findOne({ where: { user_id: CheckUser.user_id } })
        if (UpdateChannelName) {
            let updateChannel = await UserChannel.update({ channel_name: body.channel_name, template_id: body.template_id }, { where: { user_id: CheckUser.user_id } })
            return res.status(200).send({
                status: true,
                message: res.__('CREATE_CHANNEL'),
                data: {
                    user_id: req.user.user_id,
                    channel_name: body.channel_name,
                    template_id: body.template_id,
                    status: "active"
                }
            });
        }

        let CreateNewChannel = await UserChannel.create({
            user_id: req.user.user_id,
            channel_name: req.body.channel_name,
            Template_id: req.body.Template_id,
            status: "active"
        });
        let objChannel = {
            user_id: CreateNewChannel.user_id,
            channel_name: CreateNewChannel.channel_name,
            url: CreateNewChannel.channel_name + '.sonarmedia.tv',
            template_name: CheckTemplateExist.template_name,

        }
        if (!CreateNewChannel) {
            return res.status(400).send({ status: false, message: res.__('ERR_CREATE_CHANNEL') });
        }
        res.status(200).json({
            status: true,
            message: res.__("CHANNEL_CREATED_SUCCESS"),
            data: objChannel
        })

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: e.message });

    }
}


exports.GetTemplate = async (req, res) => {
    try {

        let GetAllTemplate = await TempMaster.findAll({});
        if (!GetAllTemplate) {
            return res.status(400).send({ status: false, message: res.__("ERR_TEMPLATE_NOT_FOUND") })
        }
        return res.status(200).send({ status: true, message: res.__("SUCCESS_FETCHED"), data: GetAllTemplate })
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}

exports.CheckChannelFound = async (req, res) => {
    try {
        let body = req.body
        let CheckChannel = await UserMeta.findOne({ where: { user_id: req.user.user_id } })
        if (!CheckChannel) {
            return res.status(400).send({ status: false, message: res.__('ERR_USER_NOT_FOUND') });
        }

        let ChannelName = await UserChannel.findOne({ where: { channel_name: body.channel_name, user_id: CheckChannel.user_id } })
        if (ChannelName) {
            return res.status(400).send({ status: false, message: res.__('ERR_CHANNEL_EXIST') });
        }
        return res.status(200).send({ status: true, message: res.__('SUCCESS_CHANNEL') })
    } catch (e) {
        console.log('Exception', e);
        return res.send({ status: false, message: e.message })
    }
}