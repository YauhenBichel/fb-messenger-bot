'use strict';

const
    Promise = require('bluebird'),
    logger = require('../logger'),
    constants = require('../Constants'),
    genericButtonsTemplate = require('./genericButtonsTemplate');

var showHelpBotAction = {

    showHelpMessage: function (userId) {

        return new Promise(function(sendMessageCallback) {

            logger.info("showHelpMessage");

            var buttons = [
                {
                    "type": constants.BUTTON_TYPE_POSTBACK,
                    "title": "find event",
                    "payload": constants.POSTBACK_NEW_SEARCH
                }
            ];

            var title = "Always happy to help! You may want to next commands:";

            logger.info(`specifyEventDateMessage: '${title}'`);

            var msgData = genericButtonsTemplate(userId, title, buttons);

            sendMessageCallback(msgData);

        });
    }
};

module.exports = showHelpBotAction;
