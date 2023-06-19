import mongoose from 'mongoose';
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
  roomid: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now()
  },

});

export default mongoose.model('Room', schema);
