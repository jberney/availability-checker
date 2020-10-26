const startInterval = (cb, ms) => {
  cb();
  return setInterval(cb, ms);
};

module.exports = {startInterval};