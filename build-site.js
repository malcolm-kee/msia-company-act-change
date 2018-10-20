const request = require('request');

const buildSite = () =>
  new Promise((fullfill, reject) =>
    request.post(process.env.NETLIFY_WEB_HOOK, {}, (err, res) => {
      if (err) {
        return reject(err);
      }

      fullfill(res);
    })
  );

module.exports = {
  buildSite
};
