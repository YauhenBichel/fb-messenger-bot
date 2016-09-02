'use strict';

const
    Promise = require('bluebird'),
    logger = require('../logger'),
    constants = require('../Constants'),
    genericButtonsTemplate = require('./genericButtonsTemplate');

var changeCityBotAction = {

    changeCityMessage: function (userId, cityEntered) {

        return new Promise(function(sendMessageCallback) {

            var buttons = [
                {
                    "type": constants.BUTTON_TYPE_POSTBACK,
                    "title": "Change city",
                    "payload": constants.POSTBACK_CHANGE_CITY
                }
            ];
            var title = `You are looking for events near ${cityEntered}`;

            logger.info(`changeCityMessage: ${title}`);

            var msgData = genericButtonsTemplate(userId, title, buttons);

            sendMessageCallback(msgData);

        });
    }
};

module.exports = changeCityBotAction;
