const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const {HOME_STATUS, CONTENTS_TYPE} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const DeclineReasonSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'Le nom est obligatoire'],
  },
  migration_id: {
    type: Number,
    index: true,
    required: false,
  }
}, schemaOptions
)

module.exports = DeclineReasonSchema
