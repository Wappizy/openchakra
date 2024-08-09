const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let CoachingLogbookSchema=null

try {
  CoachingLogbookSchema=require(`../plugins/${getDataModel()}/schemas/CoachingLogbookSchema`)
  CoachingLogbookSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CoachingLogbookSchema ? mongoose.model('coachingLogbook', CoachingLogbookSchema) : null