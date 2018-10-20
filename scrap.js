#!/usr/bin/node

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});
const { connect } = require('./db');
const { parse } = require('./company-act-parser');
const { Snapshot } = require('./model');
const { getTodayDate } = require('./util');

async function scrapSiteAndSave() {
  const db = await connect();
  const records = await parse();
  const snapshot = new Snapshot();
  snapshot.date = getTodayDate();
  snapshot.records = records;
  await snapshot.save();
  db.connection.close();
}

scrapSiteAndSave();
