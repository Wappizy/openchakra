const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const {GENDER, SMOKER_TYPE} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstname: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le prénom est obligatoire'],
  },
  lastname: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le nom de famille est obligatoire'],
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    set: v => v.toLowerCase().trim(),
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    default: 'invalid',
    set: pass => bcrypt.hashSync(pass, 10),
  },
  withings_id: {
    type: String,
    required: false, // true,
  },
  picture: {
    type: String,
    required: false,
  },
  weight: { // kg
    type: Number,
    min: [1, 'Le poids doit être > 1 kg'],
    max: [600, 'Le poids doit être < 600 kg'],
    required: [true, 'Le poids est obligatoire'],
  },
  height: { // cm
    type: Number,
    min: [10, 'La taille doit être >  10 cm'],
    max: [300, 'La taille doit être <  300 cm'],
    required:  [true, 'La taille est obligatoire'],
  },
  birthday: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: Object.keys(GENDER),
    default: null,
    required: [true, `Le genre est obligatoire (${Object.values(GENDER)})`],
  },
  phone: {
    type: String,
    required: false,
  },
  smoker: {
    type: String,
    enum: Object.keys(SMOKER_TYPE),
    required: false,
  },
  highBloodPressureTreatment: {
    type: Boolean,
    required: false,
  },
  tensiometer_withings_id: {
    type: String,
    required: false,
  },
  tensiometer_mark: {
    type: String,
    required: false,
  },
  tensiometer_serial_number: {
    type: String,
    required: false,
  },
}, schemaOptions)

UserSchema.virtual('fullname').get(function() {
  return `${this.firstname || ''} ${this.lastname || ''}`
})

UserSchema.virtual('measures', {
  ref: 'measure', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'user', // is equal to foreignField
})

UserSchema.virtual('appointments', {
  ref: 'appointment', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'user', // is equal to foreignField
})

UserSchema.virtual('reminders', {
  ref: 'reminder', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'user', // is equal to foreignField
})

module.exports = UserSchema
