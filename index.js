const dotenv = require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const config = require('./src/config/config.json')[env];
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const app = express();
const i18n = require('./src/helpers/i18n');
const { HandleErrorMessage } = require('./src/middleware/validatorMessageError');
const db = require('./src/models')
const cors = require('cors')
const { userAuth } = require('./src/middleware/auth');

db.sequelize.sync({ alter: true }).then(() => {
	console.log("re-sync db.");
}).catch((error) => {
	console.log("DB Error", error)
	throw new Error(error)
})
app.use(cors());
app.use(i18n.init)
app.use('/src/uploads', express.static(__dirname + '/src/uploads'));
app.use(bodyParser.json())
const { publicRouter, privateRouter } = require('./src/routes/index');


app.use('/v1/public', publicRouter);
app.use('/v1/private', privateRouter);
global.config = config;

app.use(HandleErrorMessage);
const server = http.createServer(app)


server.listen(global.config.PORT, () => {
	console.log(`Server is up on port: ${global.config.PORT}`)
})


