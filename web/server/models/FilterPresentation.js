const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FilterPresentationSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('filterPresentation', FilterPresentationSchema)
