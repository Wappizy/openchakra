const mongoose = require('mongoose')

let Schema=null

try {
  Schema=require(`./ChartDataSchema`)
  Schema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}
module.exports = Schema ? mongoose.model('chartData', Schema) : null