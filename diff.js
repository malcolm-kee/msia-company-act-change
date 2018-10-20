#!/usr/bin/node

require('./load-env');
const { connect } = require('./db');
const { Snapshot, Diff } = require('./model');
const { getTodayDate, getYesterdayDate } = require('./util');

async function diffAndSave() {
  const db = await connect();
  const todaySnapshot = await Snapshot.findOne({ date: getTodayDate() });
  const yesterdaySnapshot = await Snapshot.findOne({ date: getYesterdayDate() });
  const changedRecords = getDayDifference(todaySnapshot, yesterdaySnapshot);
  if (changedRecords.length > 0) {
    console.info('has changed records, saving...');
    const diff = new Diff();
    diff.date = getTodayDate();
    diff.records = changedRecords;
    await diff.save();
  } else {
    console.info('no changed records');
  }
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
