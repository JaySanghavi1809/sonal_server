const { celebrate, Joi, Segments } = require('celebrate');
const { Item } = require('../models')

module.exports = {
    register: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
          firstName: Joi.string().required(),
          lastName: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().required()
        }),
      }),
  login: () => celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  verifyOtp: () => celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      otp: Joi.string().required(),
      type: Joi.string().required().valid("register", "forgot"),
    }),
  }),
  forgotPassword: () => celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required()
    }),
  }),
  resetPassword: () => celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      otp: Joi.required(),
      password: Joi.string().required()
    }),
  }),
  resendOtp: () => celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      type: Joi.string().required().valid('register', 'forgot', 'resend'),
    }),
  }),
  ChangePassword: () => celebrate({
    [Segments.BODY]: Joi.object().keys({
      current_password: Joi.string().required().allow(null),
      new_password: Joi.string().required(),
    }),
  }),
}