'use strict';
const
    Promise = require('bluebird'),
    request = require('request'),
    config = require('config'),
    logger = require('./logger'),
    crypto = require('crypto');

const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('facebookAppSecret');

const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
    (process.env.MESSENGER_VALIDATION_TOKEN) :
    config.get('facebookAppValidationToken');

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    config.get('facebookPageAccessToken');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
    logger.error("Missing config values");
    process.exit(1);
}

var webhookApi = {

    appSecret: APP_SECRET,
    validatationToken: VALIDATION_TOKEN,
    pageAccessToken: PAGE_ACCESS_TOKEN,

    sendTextMessage: function (userId, messageText) {
        var messageData = {
            recipient: {
                id: userId
            },
            message: {
                text: messageText
            }
        };

        this.callSendAPI(messageData);
    },

    callSendAPI: function (messageData) {

        return new Promise(function(callback) {
            request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: PAGE_ACCESS_TOKEN},
                method: 'POST',
                json: messageData

            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var recipientId = body.recipient_id;
                    var messageId = body.message_id;

                    if (callback) {
                        callback();
                    }

                    logger.info("Successfully sent generic message with id %s to recipient %s",
                        messageId, recipientId);
                } else {
                    logger.error("Unable to send message. Response: %s. Error: %s", response, error);
                }
            })
        });
    },

    verifyRequestSignature: function (req, res, buf) {

        logger.info('verifyRequestSignature');

        var signature = req.headers["x-hub-signature"];

        if (!signature) {
            logger.error("Couldn't validate the signature.");
        } else {
            var elements = signature.split('=');
            var signatureHash = elements[1];

            var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                .update(buf)
                .digest('hex');

            if (signatureHash != expectedHash) {
                throw new Error("Couldn't validate the request signature.");
            }
        }
    },

    receiveUserInfo: function (userId) {

        return new Promise(function (callback) {
            request({
                url: "https://graph.facebook.com/v2.6/" + userId,
                qs: {
                    fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
                    access_token: PAGE_ACCESS_TOKEN
                },
                json: true
            }, function (error, response, body) {
                if (error || response.statusCode !== 200) {
                    return callback(error || {statusCode: response.statusCode});
                }

                logger.info('body of receiveUserInfo');
                logger.info(`user name is ${body.first_name}`);

                return callback({name: body.first_name});
            })
        })
    }
};

module.exports = webhookApi;