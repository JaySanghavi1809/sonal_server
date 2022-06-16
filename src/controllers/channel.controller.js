const { UserChannel, TempMaster, UserMeta, User } = require('../models')
const { Op } = require("sequelize");

exports.CreateChannel = async (req, res) => {
    const { userId, channelname, TemplateId } = req.body;

    try {
        const CreateChannel = await UserChannel.create({
            user_id: userId,
            channel_name: channelname,
            Template_id: TemplateId,
            status: "active"
        });
        res.status(200).json({
            status: true,
            message: res.__("CHANNEL_CREATED_SUCCESS"),
            CreateChannel
        })

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: e.message });

    }
}
exports.UpdateChannel = async (req, res) => {
    try {
        let findchannel = await UserChannel.findAll({ where: { id: req.body.id } });
        if (findchannel.length > 0) {
            findchannel.forEach(async data => { await data.update(req.body) })
        }
        res.status(200).json({
            status: true,
            message: res.__('UPDATE_CHANNEL'),
            findchannel
        });
    } catch (e) {
        console.log("Error", e);
        res.send({ status: false, message: e.message });
    }
}

exports.CreateTemplate = async (req, res) => {
    const { Template_name } = req.body;

    try {
        const CreateChannel = await TempMaster.create({
            Template_name: Template_name,
            status: "active"
        });
        res.status(200).json({
            status: true,
            message: res.__("TEMPLATE_CREATED_SUCCESS"),
            CreateChannel
        })

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: e.message });

    }
}