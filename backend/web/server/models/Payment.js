const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let PaymentSchema=null

try {
  PaymentSchema=require(`../plugins/${getDataModel()}/schemas/PaymentSchema`)
  PaymentSchema.plugin(mongooseLeanVirtuals)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PaymentSchema ? mongoose.model('payment', PaymentSchema) : null
