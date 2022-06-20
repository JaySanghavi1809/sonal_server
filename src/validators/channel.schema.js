const { celebrate, joi, Segments } = require('celebrate')
const Joi = require('joi')

module.exports = {
    CreateChannel: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            channel_name: Joi.string().required(),
            template_id: Joi.number().required(),
        }),
    }),

    CheckChannelNameExist: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            channel_name: Joi.string().required(),
        }),
    }),


};




