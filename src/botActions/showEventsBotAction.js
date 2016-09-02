'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    tmApi = require('../tmApi'),
    logger = require('../logger'),
    constants = require('../Constants'),
    genericButtonsTemplate = require('./genericButtonsTemplate');

const CAROUSEL_ITEMS_AMOUNT = 3;
var currentEvents = [];

var moreEventsButtons = [{
    "type": constants.BUTTON_TYPE_POSTBACK,
    "title": "View more",
    "payload": constants.POSTBACK_MORE_RESULTS
}, {
    "type": constants.BUTTON_TYPE_POSTBACK,
    "title": "New search",
    "payload": constants.POSTBACK_NEW_SEARCH
}];

var noMoreEventsButton = [{
    "type": constants.BUTTON_TYPE_POSTBACK,
    "title": "New search",
    "payload": constants.POSTBACK_NEW_SEARCH
}];

var eventsMessageDataTemplate = (userId, events) => {
    return {
        recipient: {
            id: userId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: events
                }
            }
        }
    };
};

var showEventsBotAction = {

    whatNextMessage: function (userId) {

        return new Promise(function(sendMessageCallback){

            var buttons = [];
            var title = "";

            if (currentEvents && currentEvents.length > 0) {
                title = "You can view more results";
                buttons = moreEventsButtons;
            }
            else {
                title = "There are no more events";
                buttons = noMoreEventsButton;
            }

            var msgData = genericButtonsTemplate(userId, title, buttons);

            sendMessageCallback(msgData);

        });
    },

    showEvents: function (userId, startDate, endDate, city, eventType) {

        return new Promise(function(sendMessageCallback){

            var requiredCity = city || 'Los Angeles';
            logger.info('City %s', requiredCity);

            currentEvents = [];

            tmApi.getEventsByType(startDate, endDate, requiredCity, eventType, function (resp) {

                for (var i in resp) {
                    currentEvents.push({
                        title: resp[i].name,
                        subtitle: eventType,
                        item_url: resp[i].url,
                        image_url: resp[i].image,
                        buttons: [{
                            "type": constants.BUTTON_TYPE_WEB_URL,
                            "url": resp[i].url,
                            "title": "View details"
                        }]
                    });
                }

                var events = [];
                if (!currentEvents || currentEvents.length === 0) {
                    this.whatNextMessage(userId)
                        .then(function(message){
                            sendMessageCallback(message);
                        });
                    return;
                } else if (currentEvents.length < CAROUSEL_ITEMS_AMOUNT && currentEvents.length > 0) {
                    events = currentEvents;
                    currentEvents = [];
                } else {
                    var chunks = _.chunk(currentEvents, CAROUSEL_ITEMS_AMOUNT);
                    events = chunks[0];
                    currentEvents = chunks[1];
                }

                var messageData = eventsMessageDataTemplate(userId, events);
                sendMessageCallback(messageData);
            });
        });
    },

    showMoreEvents: function (userId) {

        return new Promise(function(sendMessageCallback) {
            var events = [];
            if (currentEvents.length < CAROUSEL_ITEMS_AMOUNT) {
                events = currentEvents;
                currentEvents = [];
            } else {
                var chunks = _.chunk(currentEvents, CAROUSEL_ITEMS_AMOUNT);
                events = chunks[0];
                currentEvents = chunks[1];
            }

            var messageData = eventsMessageDataTemplate(userId, events);

            sendMessageCallback(messageData);
        });
    }
};

module.exports = showEventsBotAction;