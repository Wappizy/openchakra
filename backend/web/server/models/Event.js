const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let EventSchema=null

try {
  EventSchema=require(`../plugins/${getDataModel()}/schemas/EventSchema`)
  EventSchema.plugin(mongooseLeanVirtuals)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = EventSchema ? mongoose.model('event', EventSchema) : null
