var bcrypt = require('bcrypt');

exports.encrypt = (password) => {
    return bcrypt.hashSync(password, 10);
}
exports.generateOtp = (n) => {
    const val = Math.floor(Math.random() * (9 * Math.pow(10, n - 1))) + Math.pow(10, n - 1);
    return val;
}

exports.comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
}
