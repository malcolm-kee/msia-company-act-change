const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  section: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  docs: {
    type: [String]
  }
});

const snapshotSchema = new mongoose.Schema({
  date: String,
  records: [recordSchema]
});

const Snapshot = mongoose.model('snapshot', snapshotSchema, 'snapshots');

module.exports = {
  Snapshot
};
