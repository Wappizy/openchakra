const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const BestPracticesSchema = new Schema({
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
BestPracticesSchema.virtual('steps', {
  ref: 'step', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'container', // is equal to foreignField
  options: {sort: {order: 1}},
})
/* eslint-enable prefer-arrow-callback */

module.exports = BestPracticesSchema
