require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./route');
const handle404 = require('./middleware/handle404');
const handleError = require('./middleware/handleError');
const connectToDB = require('./db');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const accessLogGenerator = require('./middleware/accessLogGenerator');
const { consoleLogger } = require('./config/log.config');

// const multer = require('multer');
const path = require('path');

const app = express();

connectToDB();
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// enable cors
app.use(cors());
app.options("*", cors());


app.get('/health', (req, res) => {
    console.log(a)
    res.send('I am ok');
})

app.use(accessLogGenerator);
app.use('/api/v1/', routes);
app.use('*', handle404);
app.use(handleError);

const port = process.env.PORT || 5511;

app.listen(port, () => {
    console.info(`Server is running on port ${port}.`)
})