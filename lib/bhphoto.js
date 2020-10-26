const {postJson} = require('./fetch');

const interval = 30000;

const skus = [
  1434933, // evga ftw3 ultra
  1594384, // asus tuf
  1594385, // asus tuf oc
  1594451, // asus tuf oc
  1594454, // asus tuf
];

const getItems = () => postJson('https://www.bhphotovideo.com/api/item/p/product-details', {
  body: {
    params: {
      itemList: skus.map(skuNo => ({skuNo, itemSource: 'REG'})),
      channels: ['priceInfo'],
      channelParams: {priceInfo: {PRICING_CONTEXT: 'DETAILS_CART_LAYER'}}
    }
  }
}).then(({data}) => data.filter(p => p.priceInfo.addToCartFunction))

const toString = p => `${p.core.brandSeriesModel}: ${p.core.bitlyUrl}`;

module.exports = {interval, getItems, toString};