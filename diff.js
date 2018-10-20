#!/usr/bin/node

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});
const { connect } = require('./db');
const { Snapshot } = require('./model');
const { getTodayDate, getYesterdayDate } = require('./util');

async function diffAndSave() {
  const db = await connect();
  const todaySnapshot = await Snapshot.findOne({ date: getTodayDate() });
  const yesterdaySnapshot = await Snapshot.findOne({ date: getYesterdayDate() });
  const changedRecords = getDayDifference(todaySnapshot, yesterdaySnapshot);
  console.info({ changedRecords });
  db.connection.close();
}

function getDayDifference(todaySnapshot, yesterdaySnapshot) {
  if (todaySnapshot && yesterdaySnapshot) {
    console.info('Both day data available, comparing...');
    return todaySnapshot.records.filter(record => {
      const yesterdayRecord = yesterdaySnapshot.records.find(
        yRecord => yRecord.section === record.section && yRecord.title === record.title
      );
      if (yesterdayRecord) {
        if (yesterdayRecord.docs.some((yDoc, index) => yDoc !== record.docs[index])) {
          console.info('updatedRecord', record);
          return true;
        }
      } else {
        console.info('newRecord', record);
        return true;
      }
    });
  }
  return [];
}

diffAndSave();
