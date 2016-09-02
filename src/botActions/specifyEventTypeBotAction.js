'use strict';

const
    Promise = require('bluebird'),
    logger = require('../logger'),
    constants = require('../Constants'),
    genericButtonsTemplate = require('./genericButtonsTemplate');

var specifyEventTypeBotAction = {

    specifyEventType: function (userId) {

        return new Promise(function(sendMessageCallback) {

            var buttons = [
                {
                    "type": constants.BUTTON_TYPE_POSTBACK,
                    "title": "Arts & Theatre",
                    "payload": constants.POSTBACK_EVENT_ARTS
                },
                {
                    "type": constants.BUTTON_TYPE_POSTBACK,
                    "title": "Music",
                    "payload": constants.POSTBACK_EVENT_MUSIC
                },
                {
                    "type": constants.BUTTON_TYPE_POSTBACK,
                    "title": "Sports",
                    "payload": constants.POSTBACK_EVENT_SPORTS
                }
            ];
            var title = "Сould you please specify what type of event you are looking for";

            var msgData = genericButtonsTemplate(userId, title, buttons);

            sendMessageCallback(msgData);

        });
    }
};

module.exports = specifyEventTypeBotAction;
