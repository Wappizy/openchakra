const { schemaOptions } = require('../../utils/schemas');
const mongoose = require('mongoose')
const lodash=require('lodash')
const {cloneArray} = require('../../utils/database')

const Schema = mongoose.Schema

const ThemeSchema = new Schema({
  name: {
    type: String,
    required: false,
  },
  code: {
    type: String,
    required: false,
  },
  picture: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  ordered: {
    type: Boolean,
    default: true,
    required: true,
  },
  resources: [{
    type: Schema.Types.ObjectId,
    ref: 'resource',
    required: true,
  }],
  origin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'resource',
    default: null,
  },
}, schemaOptions)

ThemeSchema.virtual('spent_time').get(function() {
  return null
})

ThemeSchema.virtual('spent_time_str').get(function() {
  return null
})

ThemeSchema.virtual('progress_str').get(function() {
  return null
})

ThemeSchema.virtual('progress_percent').get(function() {
  return null
})

ThemeSchema.virtual('hidden').get(function() {
  return (!this.name && !this.code && !this.picture)
})

ThemeSchema.virtual('status').get(function() {
  return null
})

module.exports = ThemeSchema
