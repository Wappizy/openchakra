const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let ProductSchema=null

try {
  ProductSchema=require(`./${getDataModel()}/ProductSchema`)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw e
  }
}

module.exports = ProductSchema ? mongoose.model('product', ProductSchema) : null
