const twilio = require('twilio')();

const {TWILIO_FROM, TWILIO_TO} = process.env;

const sendMessage = body => twilio.messages.create({body, from: TWILIO_FROM, to: TWILIO_TO});

module.exports = {sendMessage};