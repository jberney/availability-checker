/*
Amazon
NewEgg
Overclockers?
 */

require('dotenv').config();
const bestbuy = require('./lib/bestbuy');
const bhphoto = require('./lib/bhphoto');
const {startInterval} = require('./lib/javascript');
const {sendMessage} = require('./lib/twilio');

[bestbuy, bhphoto].forEach(({getItems = () => [], toString, interval}) => startInterval(
  () => getItems().then(ps => ps.map(toString).forEach(sendMessage)),
  interval));
