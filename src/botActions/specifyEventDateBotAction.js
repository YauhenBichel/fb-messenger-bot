'use strict';

const
    Promise = require('bluebird'),
    logger = require('../logger'),
    constants = require('../Constants'),
    genericButtonsTemplate = require('./genericButtonsTemplate');

var specifyEventDateBotAction = {

    specifyEventDateMessage: function (userId, messageTitle) {

        return new Promise(function(sendMessageCallback) {

            var buttons = [{
                "type": constants.BUTTON_TYPE_POSTBACK,
                "title": "today",
                "payload": constants.POSTBACK_TODAY
            }, {
                "type": constants.BUTTON_TYPE_POSTBACK,
                "title": "this month",
                "payload": constants.POSTBACK_THIS_MONTH
            }];

            var title = messageTitle || "When would you like to go out?";

            logger.info(`specifyEventDateMessage: '${title}'`);

            var msgData = genericButtonsTemplate(userId, title, buttons);

            sendMessageCallback(msgData);
        });
    }
};

module.exports = specifyEventDateBotAction;