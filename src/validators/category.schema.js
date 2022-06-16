const { celebrate, joi, Segments } = require('celebrate')
const Joi = require('joi')
const { MetaCategory } = require("../models")

module.exports = {
    category: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            parent_id: Joi.number().integer().required(),
            category_name: Joi.string().required(),
            visibleInSection: Joi.boolean(),
        })
    })
}
