const mongoose = require('mongoose');
const schema = mongoose.Schema({
  userfrom: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  userto: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  notification: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  type: {
    type: String,
  },
});

module.exports = mongoose.model('Notification', schema);
