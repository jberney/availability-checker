const bestbuy = require('bestbuy')(process.env.BEST_BUY_API_KEY);

const interval = 30000;

const skus = [
  6429434, // nvidia fe
  6432446, // asus tuf
  6432447, // asus strix
  6434363, // evga xc3
  6436192, // evga ftw3 ultra
  6436193, // evga ftw3
];

const getItems = () => bestbuy.products(`sku in (${skus.join(',')})`,
  {show: ['manufacturer', 'modelNumber', 'onlineAvailability', 'addToCartUrl'].join(',')})
  .then(({products}) => products
    .filter(({onlineAvailability}) => onlineAvailability));

const toString = p => `${p.manufacturer} ${p.modelNumber}: ${p.addToCartUrl}`;

module.exports = {interval, getItems, toString};