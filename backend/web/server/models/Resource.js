const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ResourceSchema=null

try {
  ResourceSchema=require(`../plugins/${getDataModel()}/schemas/ResourceSchema`)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

ResourceSchema?.plugin(mongooseLeanVirtuals)
module.exports = ResourceSchema ? mongoose.model('resource', ResourceSchema) : null
