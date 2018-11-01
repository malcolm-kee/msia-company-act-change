const request = require('request');
const ch = require('cheerio');

const URL = `http://www.ssm.com.my/Pages/Legal_Framework/Companies-Act-2016.aspx`;

function parse() {
  return new Promise((fulfill, reject) => {
    request(URL, function(err, response, html) {
      if (err || response.statusCode !== 200) {
        return reject({ err, statusCode: response && response.statusCode });
      }
      const $ = ch.load(html);
      const allRecords = $('table.table')
        .map(function() {
          const tableTitle = $(this)
            .prev()
            .text()
            .trim();
          const titleIndex = findTitleIndex(this);
          const docIndexes = findDocIndexes(this);
          const records = getRecords(this, tableTitle, titleIndex, docIndexes);
          return records;
        })
        .get()
        .reduce((result, records) => result.concat(records), []);

      fulfill(allRecords);
    });
  });
}

function findTitleIndex(table) {
  let titleIndex = -1;

  ch(table)
    .find('thead th, thead td')
    .each(function(i) {
      const textContent = ch(this).text();

      // hard code title column name
      if (/Practice Directive|Practice Note|Guidelines|Legislation|Form/.test(textContent)) {
        titleIndex = i;
        return false;
      }
    });
  return titleIndex;
}

function findDocIndexes(table) {
  let indexes = [];

  ch(table)
    .find('thead th, thead td')
    .each(function(i) {
      const textContent = ch(this).text();

      if (/Format/.test(textContent)) {
        indexes.push(i);
      }
    });

  return indexes;
}

/**
 *
 * @param {*} table
 * @param {number} titleIndex
 * @param {Array<number>} docIndexes
 */
function getRecords(table, tableTitle, titleIndex, docIndexes) {
  return ch(table)
    .find('tbody tr, thead:nth-child(2) tr')
    .map(function() {
      const children = ch(this).children();

      return {
        section: tableTitle,
        title: children
          .eq(titleIndex)
          .text()
          .trim(),
        docs: docIndexes.map(docInd =>
          children
            .eq(docInd)
            .text()
            .trim()
            .replace(/\s\s+/, '')
        )
      };
    })
    .get();
}

module.exports = {
  parse
};
