const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const config = require('./core/config');
const morgan = require('./core/morgan');
const { authLimiter } = require('./core/middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./core/middlewares/error');
const ApiError = require('./core/ApiError');
const { initSocket } = require('./core/socket');
const http = require('http');

// Register Models
require('./modules/users/models/permission.model');
require('./modules/users/models/role.model');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
initSocket(server);

if (config.env !== 'test') {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true // Enable parsing of Authorization header
}));
app.options(/.*$/, cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
// app.use(mongoSanitize()); // Removed causing crash

// gzip compression
app.use(compression());

// enable cors - MOVED TO TOP
// app.use(cors()); // removed old location

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
    app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = { app, server };
