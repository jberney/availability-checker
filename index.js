/*
Amazon
NewEgg
Overclockers?
 */

require('dotenv').config();
const bestbuy = require('./lib/bestbuy');
const bhphoto = require('./lib/bhphoto');
const {sendMessage} = require('./lib/twilio');

const startInterval = (cb, ms) => {
  cb();
  return setInterval(cb, ms);
}

[bestbuy, bhphoto].forEach(({getItems = () => [], toString, interval}) => startInterval(
  () => getItems().then(ps => ps.map(toString).forEach(sendMessage)),
  interval));
