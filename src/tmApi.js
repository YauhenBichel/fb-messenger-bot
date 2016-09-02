'use strict';
const rest = require('rest'),
    config = require('config'),
    logger = require('./logger');

const API_KEY = (process.env.ticketmasterAPIKey) ?
    process.env.ticketmasterAPIKey :
    config.get('ticketmasterAPIKey');

const EVENTS_URL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}`;
const CLASSIFICATIONS_URL = `https://app.ticketmaster.com/discovery/v2/classifications.json?apikey=${API_KEY}`;

var extractEvents = function (resp) {

    if (typeof resp._embedded != "undefined") {
        var events = resp._embedded.events;

        var result = [];
        for (var i in events) {
            result.push({
                "name": events[i].name,
                "url": events[i].url,
                "image": events[i].images[0].url,
                "date": events[i].dates.start.localDate,
                "time": events[i].dates.start.localTime
            });
        }

        return result;
    } else {
        logger.info("extractEvents: Not events found");
        return {};
    }
};

var tmApi = {

    getEventsByType: function (startDate, endDate, location, eventTypeName, callback) {
        var startDateTime = startDate + 'T00:00:00Z';
        var endDateTime = endDate + 'T23:59:59Z';

        this.getClassifications(function (classifications) {
            var requestedId = '';

            for (var i in classifications) {
                if (classifications[i].name === eventTypeName) {
                    requestedId = classifications[i].id;
                    break;
                }
            }

            if (requestedId) {
                var query = `&startDateTime=${startDateTime}&endDateTime=${endDateTime}&city=${encodeURIComponent(location)}&classificationId=${requestedId}`;

                var url = EVENTS_URL + query;

                logger.info('Requesting ', url);

                rest(url).then(function (response) {
                    var resp = JSON.parse(response.entity);
                    var result = extractEvents(resp);

                    callback(result);
                });
            } else {
                callback({});
            }
        })
    },

    getClassifications: function (callback) {

        rest(CLASSIFICATIONS_URL).then(function (response) {

            var resp = JSON.parse(response.entity)._embedded;
            var classifications = resp.classifications;

            var result = [];
            for (var i in classifications) {
                result.push({
                    "id": classifications[i].segment.id,
                    "name": classifications[i].segment.name
                });
            }

            callback(result);
        });
    }
};

module.exports = tmApi;
