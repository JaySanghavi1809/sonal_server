const jwt = require('jsonwebtoken')

const generateToken = function (user) {
    try {
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXIPIRATION_TIME })
        return token
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = { generateToken }