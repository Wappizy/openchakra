const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  attachment: {
    type: String,
    required: false,
  },
  is_read: {
    type: Date,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  mine: {
    type: Boolean,
    required: false,
    default: false,
  }
}, schemaOptions)

MessageSchema.methods.getPartner = function(user) {
  const userId=typeof(user)=='string' ? user : user._id.toString()
  return this.sender._id.toString()==userId ?
    this.receiver: this.sender
}

module.exports = MessageSchema
