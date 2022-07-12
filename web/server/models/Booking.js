const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let BookingSchema=null

try {
  BookingSchema=require(`./${getDataModel()}/BookingSchema`)
  BookingSchema.plugin(mongooseLeanVirtuals)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = BookingSchema ? mongoose.model('booking', BookingSchema) : null
