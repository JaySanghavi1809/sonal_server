const User = require("../models").User
const jwt = require('jsonwebtoken');


const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
const TOKEN_LIFE = process.env.TOKEN_LIFE;
const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE

exports.getToken = async (req, res, next) => {
  let user;
  if(req.url.includes('varify')){
    user = await User.findOne({where:{username: req.params.username, isVarify: true}});
  } else{
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    throw (error.CustomError(UNAUTHORIZED, 401));
  }
  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  console.log(base64Credentials)
  console.log(credentials)
  let [username, password] = credentials.split(':');

  const authObj = await this.authenticate(username, password);
  console.log(authObj)
  if (authObj && !authObj.status) {
    if (authObj.notVarify) {
      throw (error.CustomError(NOT_VARIFIED, 424))
    }
    else {
      throw (error.CustomError(FORBIDDEN, 403))
    }

  }
  user = authObj.user;
}
  console.log(REFRESH_TOKEN_LIFE), TOKEN_LIFE
  let token = this.createToken({ email: user.email, id: user.id}, SECRET_KEY, TOKEN_LIFE);
  let refresh_token = this.createToken({ email: user.email, id: user.id }, REFRESH_SECRET_KEY, REFRESH_TOKEN_LIFE)
  return { success: true, access_token: token, refresh_token: refresh_token }
}

exports.getRefreshToken = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    throw (error.CustomError(constant.EMPTY_TOKEN, 401))
  }

  jwt.verify(token, REFRESH_SECRET_KEY, (err, user) => {
    console.log(err, user, REFRESH_SECRET_KEY)
    if (err) {

      throw (error.CustomError(err.message, 403))
    }

    let token = this.createToken({ user: user.username, id: user.id, role: user.role }, SECRET_KEY, TOKEN_LIFE);
    console.log("token", token)
    res.json({ success: true, refresh_token: token });


  })





}
exports.authenticate = async (username, password) => {

  let status = { status: false }
  try {

    let user = await User.findOne({
      limit: 1,
      raw: true,
      where: {
        username: username,
      },

    })
    if ((user)) {
      if (!user.isVarify) {
        return { notVarify: true, status: false }
      }

      let hashpassword = user.password;
      let isPasswordValid = await utils.validatePassword(password, hashpassword)
      if (isPasswordValid) {
        const { password, ...other } = user;
        return { status: true, notVarify: false, user: other };;
      }
    }
    return { status: false }
  } catch (error) {
    return { status: false }

  }



}
exports.createToken = (user, secret_key, expiresIn) => {
  const token = jwt.sign(user, secret_key, { expiresIn: expiresIn })
  return token;
}


exports.varifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        // console.log(err)
        throw (error.CustomError(err.message, 403))
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    throw (error.CustomError(constant.EMPTY_TOKEN, 401))
  }
};
exports.getForgotSecret = (password, createdAt) => {
  let date=new Date(createdAt)
  var milliseconds = date.getTime(); 
  console.log(milliseconds)
  const secret = password + "_" + date;
  return secret;

}
exports.varifyResetToken = async (token, secret) => {

  if (token) {
    try {
      return jwt.verify(token, secret)
    } catch (err) {
      throw (error.CustomError(err.message, 403))
    }

  } else {
    throw (error.CustomError(constant.EMPTY_TOKEN, 401))
  }
};





