const fetch = require('node-fetch');

const fetchJson = (...args) => fetch(...args).then(response => response.json());
const postJson = (url, opts) => fetchJson(url, {
  ...opts,
  body: JSON.stringify(opts.body),
  headers: {'content-type': 'application/json', ...opts.headers},
  method: 'POST'
});

module.exports = {fetchJson, postJson};