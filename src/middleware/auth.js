const jwt = require('jsonwebtoken')
const { User, UserMeta } = require('../models')

const userAuth = async (req, res, next) => {
  try {
    if (!req.header('Authorization')) {
      return res.status(400).send({ status: false, message: "No Token provided" })
    }

    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, global.config.JWT_SECRET, { ignoreExpiration: true })
    const UserInfo = await UserMeta.findOne({ where: { user_id: decoded.id } })
    if (!UserInfo) {
      return res.status(400).send({ status: false, message: "please provide valid token" })
    }
    req.token = token
    req.user = UserInfo
    next()
  } catch (e) {
    console.log("Error", e)
    return res.status(400).send({ status: false, message: e.message })
  }
}

module.exports = { userAuth }
