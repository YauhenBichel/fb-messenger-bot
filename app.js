'use strict';

const
    bodyParser = require('body-parser'),
    express = require('express'),
    https = require('https'),
    appController = require('./src/appController'),
    webhookApi = require('./src/webhookApi'),
    logger = require('./src/logger');

var port = process.env.PORT || 3000;

var app = express();

app.set('port', port);
app.use(bodyParser.json({ verify: webhookApi.verifyRequestSignature }));
app.use(express.static('assets'));

app.get('/', function (req, res) {
    res.send('Knock, knock, wanderer.');
});
app.listen(app.get('port'), function() {
    logger.info("The app listening on port: ", port);
});

app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === webhookApi.validatationToken) {
        logger.info("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        logger.info("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

app.post('/webhook', function (req, res) {

    var data = req.body;
    logger.info('post /webhook');

    if (data.object === 'page') {
        data.entry.forEach(function(pageEntry) {
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.message) {
                    appController.receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    appController.receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    appController.receivedPostback(messagingEvent);
                } else {
                    logger.info("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        res.sendStatus(200);
    }
});

module.exports = app;
