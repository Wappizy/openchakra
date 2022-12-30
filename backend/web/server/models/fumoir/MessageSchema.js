const mongoose = require('mongoose')
const mongooseLeanVirtuals = require('mongoose-lean-virtuals')
const {schemaOptions} = require('../../utils/schemas')
const Schema = mongoose.Schema


const MessageSchema = new Schema({
  subject: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: true,
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
}, schemaOptions)

MessageSchema.plugin(mongooseLeanVirtuals)

module.exports = MessageSchema
