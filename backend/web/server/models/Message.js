const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let MessageSchema=null

try {
  MessageSchema=require(`../plugins/${getDataModel()}/schemas/MessageSchema`)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

MessageSchema?.plugin(mongooseLeanVirtuals)
module.exports = MessageSchema ? mongoose.model('message', MessageSchema) : null
