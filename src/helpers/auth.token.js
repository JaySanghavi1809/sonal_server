const jwt = require('jsonwebtoken')

// function to generate token
const generateToken = function (user) {
    try {
        const token = jwt.sign(user, global.config.JWT_SECRET, { expiresIn: global.config.JWT_EXIPIRATION_TIME })
        return token
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = { generateToken }