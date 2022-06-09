const jwt = require('jsonwebtoken')
const { User, UserMeta } = require('../models')

const UserAuth = async (req, res, next) => {
    try {
        if (!req.header('Authorization')) {
            return res.status(400).send({ status: false, message: res.__('ERROR_TOKEN_REQUIRED') })
        }
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, global.config.JWT_SECRET, { ignoreExpiration: true })
        const UserData = await User.findOne({ where: { user_id: decoded.id } })

        if (!UserData) {
            return res.status(400).send({ status: false, message: res.__('ERROR_INVALID_TOKEN') })
        }
        req.token = token
        req.user = User
        next()
    } catch (e) {
        console.log(e)
        return res.status(400).send({ status: false, message: e.message })

    }
}

module.exports = { UserAuth }