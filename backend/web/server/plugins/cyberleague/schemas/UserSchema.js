const mongoose = require('mongoose')
const { isEmailOk, isPhoneOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')
const { ROLES , JOBS, ROLE_ADMIN, DISCRIMINATOR_KEY, JOB_STUDENT } = require('../consts')
const AddressSchema = require('../../../models/AddressSchema')

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
  picture: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
    set: v => v?.replace(/^0/, '+33'),
    required: false,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    index: true,
    required: false,
  },
  expertises: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'expertise',
      index: true,
      required: false,
    }],
    default: []
  },
  events: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'event',
      index: true,
      required: false,
    }],
    default: []
  },
  pinned_by: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      index: true,
      required: true,
    }],
    default: []
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  trophies: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'gift',
      required: false
    }],
    default: []
  },
  function: {
    type: String,
    required: false
  },
  job: {
    type: String,
    enum: Object.keys(JOBS),
    required: false
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'school',
    required: false,
    validate:  [s => !s || this.job == JOB_STUDENT, 'Seul·e un·e étudiant·e peut avoir une école']
  },
  city: {
    type: AddressSchema,
    required: false
  }
  }, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */
UserSchema.virtual('password2', DUMMY_REF).get(function() {})

UserSchema.virtual('fullname', DUMMY_REF).get(function() {
  return `${this.firstname} ${this.lastname}`
})

UserSchema.virtual('shortname', DUMMY_REF).get(function() {
  return `${this.firstname} ${this.lastname?.[0]}.`
})

UserSchema.virtual('pinned_by_count', DUMMY_REF).get(function() {
  return this.pinned_by?.length || 0
})

UserSchema.virtual('pinned_users', {
  ref:'user',
  localField:'_id',
  foreignField:'pinned_by',
})

UserSchema.virtual('pinned_companies', {
  ref:'company',
  localField:'_id',
  foreignField:'pinned_by',
})

UserSchema.virtual('pinned_companies_count', {
  ref:'company',
  localField:'_id',
  foreignField:'pinned_by',
  count:true,
})

UserSchema.virtual('is_admin', DUMMY_REF).get(function() {
  return this.role == ROLE_ADMIN
})

UserSchema.virtual('groups', {
  ref:'group',
  localField:'_id',
  foreignField:'users',
})

UserSchema.virtual('groups_count', {
  ref:'group',
  localField:'_id',
  foreignField:'users',
  count:true,
})

UserSchema.virtual('pending_groups', {
  ref:'group',
  localField:'_id',
  foreignField:'pending_users',
})

UserSchema.virtual('pending_groups_count', {
  ref:'group',
  localField:'_id',
  foreignField:'pendgin_users',
  count:true,
})

/* eslint-disable prefer-arrow-callback */

module.exports = UserSchema
