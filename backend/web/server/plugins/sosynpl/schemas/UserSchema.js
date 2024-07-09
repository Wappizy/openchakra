const mongoose = require('mongoose')
const { isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')
const { ROLES, DEACTIVATION_REASON } = require('../consts')
const { getCurrentMissions, getComingMissions } = require('../missions')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  role: {
    type: String,
    enum: Object.keys(ROLES),
    required: [true, `Le rôle est obligatoire`],
    index: true,
  },
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
    required: [true, `L'email est obligatoire`],
    set: v => v ? v.toLowerCase().trim() : v,
    index: true,
    validate: [isEmailOk, v => `L'email '${v.value}' est invalide`],
  },
  password: {
    type: String,
    required: [true, `Le mot de passe est obligatoire`],
    set: pass => pass ? bcrypt.hashSync(pass, 10) : null,
  },
  email_valid: {
    type: Boolean,
    required: false,
  },
  fullname: {
    type: String,
    get: function() {return `${this.firstname} ${this.lastname}`},
    set: () => {}
  },
  shortname: {
    type: String,
    get: function() {return `${this.firstname} ${this.lastname[0]}.`},
    set: () => {}
  },
  picture: {
    type: String,
    required: false,
  },
  company_logo: {
    type: String,
    required: false,
  }
  }, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
// Required for register validation only
UserSchema.virtual('password2', DUMMY_REF).get(function() {})

UserSchema.virtual('pinned_freelances', {
  ref: 'customer',
  localField: '_id',
  foreignField: 'pinned_by',
})

UserSchema.virtual('current_missions', DUMMY_REF).get(getCurrentMissions)

UserSchema.virtual('coming_missions', DUMMY_REF).get(getComingMissions)
/* eslint-enable prefer-arrow-callback */

module.exports = UserSchema
