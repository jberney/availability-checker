/*
Amazon
NewEgg
Overclockers?
 */

require('dotenv').config();
const {BEST_BUY_API_KEY, TWILIO_FROM, TWILIO_TO} = process.env;
const bestbuy = require('bestbuy')(BEST_BUY_API_KEY);
const twilio = require('twilio')();
const fetch = require('node-fetch');

const startInterval = (cb, ms) => {
  cb();
  return setInterval(cb, ms);
}
const fetchJson = (...args) => fetch(...args).then(response => response.json());
const postJson = (url, opts) => fetchJson(url, {
  ...opts,
  body: JSON.stringify(opts.body),
  headers: {'content-type': 'application/json', ...opts.headers},
  method: 'POST'
});
const sendMessage = body => twilio.messages.create({body, from: TWILIO_FROM, to: TWILIO_TO});

const intervals = {
  bestbuy: 30000,
  bhphoto: 30000
};

const skus = {
  bestbuy: [
    6429434, // nvidia fe
    6432446, // asus tuf
    6432447, // asus strix
    6434363, // evga xc3
    6436192, // evga ftw3 ultra
    6436193, // evga ftw3
  ],
  bhphoto: [
    1434933, // evga ftw3 ultra
    1594384, // asus tuf
    1594385, // asus tuf oc
    1594451, // asus tuf oc
    1594454, // asus tuf
  ]
};

const apis = {
  bestbuy: {
    getItems: () => bestbuy.products(`sku in (${skus.bestbuy.join(',')})`,
      {show: ['manufacturer', 'modelNumber', 'onlineAvailability', 'addToCartUrl'].join(',')})
      .then(({products}) => products
        .filter(({onlineAvailability}) => onlineAvailability)),
    toString: p => `${p.manufacturer} ${p.modelNumber}: ${p.addToCartUrl}`
  },
  bhphoto: {
    getItems: () => postJson('https://www.bhphotovideo.com/api/item/p/product-details', {
      body: {
        params: {
          itemList: skus.bhphoto.map(skuNo => ({skuNo, itemSource: 'REG'})),
          channels: ['priceInfo'],
          channelParams: {priceInfo: {PRICING_CONTEXT: 'DETAILS_CART_LAYER'}}
        }
      }
    }).then(({data}) => data.filter(p => p.priceInfo.addToCartFunction)),
    toString: p => `${p.core.brandSeriesModel}: ${p.core.bitlyUrl}`
  }
};

Object.entries(apis).forEach(([api, {getItems = () => [], toString}]) => startInterval(
  () => getItems().then(ps => ps.map(toString).forEach(sendMessage)),
  intervals[api]));
