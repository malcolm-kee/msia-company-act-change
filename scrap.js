#!/usr/bin/node

require('dotenv').config();
const { connect } = require('./db');
const { parse } = require('./company-act-parser');
const { Snapshot } = require('./model');

async function scrapSiteAndSave() {
  const db = await connect();
  const records = await parse();
  const snapshot = new Snapshot();
  snapshot.date = new Date().toISOString();
  snapshot.records = records;
  await snapshot.save();
  db.connection.close();
}

scrapSiteAndSave();
