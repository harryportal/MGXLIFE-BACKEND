"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, json, colorize, printf } = winston_1.format;
const myLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    },
};
// configure level for production and development environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env == 'development' ? 'debug' : 'warn';
};
// add colors for different logging levels
(0, winston_1.addColors)(myLevels.colors);
// create logger
const logger = (0, winston_1.createLogger)({
    level: level(),
    levels: myLevels.levels,
    format: combine(json(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), colorize({ all: true }), printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)),
    transports: [
        // all logs should appear here
        new winston_1.transports.File({ filename: 'logs/all.log' }),
        // error logs should appear here
        new winston_1.transports.File({ filename: 'logs/errors.log', level: 'error' }),
    ],
    exceptionHandlers: [new winston_1.transports.File({ level: 'error', filename: 'logs/exceptions.log' })],
    rejectionHandlers: [new winston_1.transports.File({ level: 'error', filename: 'logs/exceptions.log' })],
});
if (process.env.NODE_ENV != 'production') {
    const console_format = winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple());
    logger.add(new winston_1.transports.Console({
        level: 'info',
        format: console_format,
    }));
    logger.exceptions.handle(new winston_1.transports.Console({ format: console_format }));
    logger.rejections.handle(new winston_1.transports.Console({ format: console_format }));
}
exports.default = logger;
