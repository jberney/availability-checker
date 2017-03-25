const request = require('request-promise');
const {RestClient} = require('twilio');

const twilioClient = new RestClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function clean(text) {
  return text.split('').filter(c => c.charCodeAt(0) < 128).join('')
}

const shortUrls = {};
const bestBuyCache = {};
const walmartCache = {};

function filterItem(itemId, status, unavailableStatuses, cache) {
  let pass = false;
  const oldStatus = cache[itemId];
  if (oldStatus) {
    pass = oldStatus !== status;
  } else {
    pass = unavailableStatuses.indexOf(status) === -1;
  }
  cache[itemId] = status;
  return pass;
}

async function shortenUrl(longUrl) {
  if (!shortUrls[longUrl]) {
    try {
      const {id} = await request.post({
        url: 'https://www.googleapis.com/urlshortener/v1/url',
        qs: {key: process.env.GOOGLE_API_KEY},
        body: {longUrl},
        json: true
      });
      shortUrls[longUrl] = id;
    } catch (e) {
      console.error(e);
    }
  }
  return shortUrls[longUrl] || longUrl;
}

async function sendMessage(body) {
  return new Promise(res => {
    twilioClient.sms.messages.create({
      from: process.env.TWILIO_NUMBER,
      to: process.env.TO_NUMBER,
      body
    }, (error, message) => {
      console.log(`[${new Date()}] ${body}`);
      if (!error) return res(message);
      console.error(error);
      res(error);
    });
  });
}

function check({url, apiKey, qs, itemsKey, idKey, stockKey, unavailableStatuses, itemCache, interval}) {
  setInterval(async() => {
    try {
      const response = await request({
        url,
        qs: Object.assign({apiKey, format: 'json'}, qs),
        json: true
      });
      const items = response[itemsKey];
      const changed = items
        .filter(({marketplace}) => !marketplace)
        .filter(item => filterItem(item[idKey], item[stockKey], unavailableStatuses, itemCache));
      changed.forEach(async item => {
        const stock = item[stockKey];
        const {name, addToCartUrl} = item;
        let message = `${stock} ${clean(name)}`;
        const available = unavailableStatuses.indexOf(stock) === -1;
        if (available) message = `${message} "${await shortenUrl(addToCartUrl)}"`;
        await sendMessage(message);
      });
    } catch ({message}) {
      console.error(message);
    }
  }, interval * 1000);
}

check({
  url: `https://api.bestbuy.com/v1/products(sku in (${[5670003, 5670100].join(',')}))`,
  apiKey: process.env.BEST_BUY_API_KEY,
  qs: {show: ['sku', 'name', 'orderable', 'addToCartUrl'].join(',')},
  itemsKey: 'products',
  idKey: 'sku',
  stockKey: 'orderable',
  unavailableStatuses: ['ComingSoon', 'NotOrderable', 'SoldOut'],
  itemCache: bestBuyCache,
  interval: 30
});

check({
  url: 'http://api.walmartlabs.com/v1/items',
  apiKey: process.env.WALMART_API_KEY,
  qs: {ids: [52901821, 55449981].join(',')},
  itemsKey: 'items',
  idKey: 'itemId',
  stockKey: 'stock',
  unavailableStatuses: ['Not available'],
  itemCache: walmartCache,
  interval: 20
});