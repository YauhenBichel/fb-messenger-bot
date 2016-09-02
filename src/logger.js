'use strict';

const log4js = require('log4js');

log4js.configure({
    "appenders": [
        {
            "type": "file",
            "filename": "./logs/logs.log",
            "maxLogSize": 1024,
            "backups": 3,
            "category": "default"
        }
    ]
});

var logger = log4js.getLogger('default');

module.exports = logger;