const dotenv = require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const config = require('./src/config/config.json')[env];
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const app = express();
const { HandleErrorMessage } = require('./src/middleware/validatorMessageError');
const db = require('./src/models')
const cors = require('cors')



const port = process.env.PORT || 8000

const { userAuth } = require('./src/middleware/auth');

db.sequelize.sync({ alter: true }).then(() => {
	console.log("re-sync db.");
}).catch((error) => {
	console.log("DB Error", error)
	throw new Error(error)
})

app.use(cors());
app.use('/src/uploads', express.static(__dirname + '/src/uploads'));
app.use(bodyParser.json())
const { publicRouter, privateRouter } = require('./src/routes/index');


app.use('/v1/public', publicRouter);
app.use('/v1/private', privateRouter);
global.config = config;
console.log(global.config)

app.use(HandleErrorMessage);
const server = http.createServer(app)


server.listen(global.config.PORT, () => {
	console.log(`Server is up on port: ${global.config.PORT}`)
})


