'use strict';

const
    Promise = require('bluebird'),
    logger = require('../logger'),
    specifyEventDateBotAction = require('./specifyEventDateBotAction');

var showGreetingBotAction = {

    greetingMessage: function (userId, userName) {

        return new Promise(function(sendMessageCallback) {

            var title = `Hi ${userName}. When would you like to go out?`;
            logger.info(`greetingMessage: ${title}`);

            specifyEventDateBotAction.specifyEventDateMessage(userId, title)
                .then(function(message){
                    sendMessageCallback(message);
                });
        });
    }
};

module.exports = showGreetingBotAction;