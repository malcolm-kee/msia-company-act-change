const format = require('date-fns/format');
const subDays = require('date-fns/sub_days');

const getTodayDate = () => format(new Date(), 'YYYY-MM-DD');

const getYesterdayDate = () => format(subDays(new Date(), 1), 'YYYY-MM-DD');

module.exports = {
  getTodayDate,
  getYesterdayDate
};
