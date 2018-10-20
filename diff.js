#!/usr/bin/node

require('./load-env');
const { connect } = require('./db');
const { Snapshot, Diff, Subscriber } = require('./model');
const { getTodayDate, getYesterdayDate } = require('./util');
const { sendEmail } = require('./mailer');
const { buildSite } = require('./build-site');

async function diffAndNotify() {
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
    await sendNotificationEmail(changedRecords);
    await buildSite();
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

const TH_STYLE =
  'padding: 5px; font-size: 16px; line-height:20px; line-height:30px; border-bottom: 2px solid #efefef;';
const TD_STYLE = 'padding: 5px; border-bottom: 1px solid #efefef;';

async function sendNotificationEmail(changedRecords) {
  const subscribers = await Subscriber.find({});

  if (subscribers.length > 0) {
    console.info(`has ${subscribers.length} subscribers, sending email...`);
    await sendEmail(
      subscribers.map(sub => sub.email),
      `New Update on SSM Company Act`,
      changedRecords.map(rec => `Section:${rec.section}|Title:${rec.title}`).join(`\r\n`),
      `<h1 style="font-weight:bold; font-size: 20px;">New Updates on SSM Company Act</h1>
      <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;">
        <thead>
          <tr>
            <th align="left" style="${TH_STYLE}">Section</th>
            <th align="left" style="${TH_STYLE}">Title</th>
          </tr>
        </thead>
        <tbody>
        ${changedRecords
          .map(
            rec => `<tr>
            <td valign="top" style="${TD_STYLE}">${rec.section}</td>
            <td valign="top" style="${TD_STYLE}">${rec.title}</td>
            </tr>`
          )
          .join('')}
        </tbody>
      </table>`
    );
  } else {
    console.info('no subscribers');
  }
}

diffAndNotify();
