const
    showEventsBotAction = require('./botActions/showEventsBotAction'),
    showGreetingBotAction = require('./botActions/showGreetingBotAction'),
    changeCityBotAction = require('./botActions/changeCityBotAction'),
    specifyEventDateBotAction = require('./botActions/specifyEventDateBotAction'),
    specifyEventTypeBotAction = require('./botActions/specifyEventTypeBotAction'),
    showHelpBotAction = require('./botActions/showHelpBotAction'),
    webhookApi = require('./webhookApi'),
    constants = require('./Constants'),
    logger = require('./logger');

var isCityWaiting = false;
var currentCity = "";

var startDate = new Date().toISOString().slice(0, 10); // today by default
var endDate = new Date().toISOString().slice(0, 10); // today by default

var appController = {};

appController.receivedMessage = (event) => {
    var userId = event.sender.id;

    var messageText = event.message.text;
    var messageAttachments = event.message.attachments;

    if (messageText.toLowerCase().startsWith('hi')) {
        webhookApi.receiveUserInfo(userId)
            .then(function(data){
                showGreetingBotAction.greetingMessage(userId, data.name)
                    .then(function (message) {
                        webhookApi.callSendAPI(message);
                    });
            });
    } else if (isCityWaiting) {
        var city = messageText;
        currentCity = city;
        isCityWaiting = false;

        changeCityBotAction.changeCityMessage(userId, city)
            .then(function(message) {
                webhookApi.callSendAPI(message);
            })
            .finally(function () {
                specifyEventTypeBotAction.specifyEventType(userId)
                    .then(function(message) {
                        webhookApi.callSendAPI(message);
                    });
            });
    } else if (messageText.toLowerCase().indexOf('help') > -1) {
        showHelpBotAction.showHelpMessage(userId, webhookApi.callSendAPI);
    } else if (messageAttachments) {
        showHelpBotAction.showHelpMessage(userId, webhookApi.callSendAPI);
    }
};

appController.receivedPostback = (event) => {
    var userId = event.sender.id;
    var payload = event.postback.payload;

    isCityWaiting = false;

    if (payload === constants.POSTBACK_TODAY) {
        isCityWaiting = true;
        webhookApi.sendTextMessage(userId, "Please tell me which city should I look for events.");
    }
    else if (payload === constants.POSTBACK_THIS_MONTH) {

        isCityWaiting = true;

        var currMonth = ("0" + (new Date().getMonth() + 1)).slice(-2);
        var lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toString().substring(8, 10);

        startDate = '2016-' + currMonth + '-01';
        endDate = '2016-' + currMonth + '-' + lastDay;

        webhookApi.sendTextMessage(userId, "Please tell me which city should I look for events.");
    } else if (payload === constants.POSTBACK_CHANGE_CITY) {
        isCityWaiting = true;
        webhookApi.sendTextMessage(userId, "Please tell me which city should I look for events.");
    } else if (payload === constants.POSTBACK_CONTINUE_WITH_CITY) {
        specifyEventTypeBotAction.specifyEventType(userId)
            .then(function(message){
                webhookApi.callSendAPI(message);
            });
    } else if (payload === constants.POSTBACK_EVENT_MUSIC) {
        showEventsBotAction.showEvents(userId, startDate, endDate, currentCity, constants.EVENT_CATEGORY_MUSIC_NAME)
            .then(function(message) {
                webhookApi.callSendAPI(message);
            })
            .finally(function() {
                showEventsBotAction.whatNextMessage(userId)
                    .then(function(message){
                        webhookApi.callSendAPI(message);
                    });
            });
    } else if (payload === constants.POSTBACK_EVENT_SPORTS) {
        showEventsBotAction.showEvents(userId, startDate, endDate, currentCity, constants.EVENT_CATEGORY_SPORTS_NAME)
            .then(function(message) {
                webhookApi.callSendAPI(message);
            })
            .finally(function () {
                showEventsBotAction.whatNextMessage(userId)
                    .then(function(message) {
                        webhookApi.callSendAPI(message);
                    });
            });
    } else if (payload === constants.POSTBACK_EVENT_ARTS) {
        showEventsBotAction.showEvents(userId, startDate, endDate, currentCity, constants.EVENT_CATEGORY_ART_THEATRE_NAME)
            .then(function(message) {
                webhookApi.callSendAPI(message);
            })
            .finally(function () {
                showEventsBotAction.whatNextMessage(userId)
                    .then(function(message) {
                        webhookApi.callSendAPI(message);
                    });
            });
    } else if (payload === constants.POSTBACK_EVENT_VIEW_DETAILS) {
        showEventsBotAction.whatNextMessage(userId)
            .then(function(message) {
                webhookApi.callSendAPI(message);
            });
    } else if (payload === constants.POSTBACK_MORE_RESULTS) {
        showEventsBotAction.showMoreEvents(userId)
            .then(function(message) {
                webhookApi.callSendAPI(message);
            })
            .finally(function() {
                showEventsBotAction.whatNextMessage(userId)
                    .then(function(message) {
                        webhookApi.callSendAPI(message);
                    });
            });
    } else if (payload === constants.POSTBACK_NEW_SEARCH) {
        specifyEventDateBotAction.specifyEventDateMessage(userId, 'Start new search')
            .then(function(message) {
                webhookApi.callSendAPI(message);
            });
    } else {
        webhookApi.sendTextMessage(userId, "This operation is not supported.");
    }
};

appController.receivedDeliveryConfirmation = (event) => {
    var delivery = event.delivery;
    var messageIDs = delivery.mids;
    var watermark = delivery.watermark;

    if (messageIDs) {
        messageIDs.forEach(function (messageID) {
            logger.info("Received delivery confirmation for message ID: %s",
                messageID);
        });
    }

    logger.info("All message before %d were delivered.", watermark);
};

module.exports = appController;