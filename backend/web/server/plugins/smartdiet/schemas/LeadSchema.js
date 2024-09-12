const lodash=require('lodash')
const { isEmailOk } = require('../../../../utils/sms')
const { isPhoneOk } = require('../../../../utils/sms')
const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { CALL_STATUS, CALL_DIRECTION, COACHING_CONVERSION_STATUS, CALL_STATUS_TO_CALL, CALL_DIRECTION_OUT_CALL } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const LeadSchema = new Schema({
  firstname: {
    type: String,
    set: v => v?.trim(),
    required: false,
  },
  lastname: {
    type: String,
    set: v => v?.trim(),
    required: false,
  },
  // No email validation for import
  email: {
    type: String,
    // validate: [isEmailOk, v => `L'email '${v?.value}' est invalide`],
    required: [true, `L'email est obligatoire`],
    set: v => v?.toLowerCase().trim(),
    index: true,
  },
  // Custom identifier
  identifier: {
    type: String,
    set: v => v ? v.trim() : v,
    required: false,
  },
  company_code: {
    type: String,
    set: v => v ? v.replace(/ /g,'') : v,
    required: false,
    index: true,
  },
  source: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    validate: [value => !value || isPhoneOk(value), v => `Le numéro de téléphone '${v?.value}' doit commencer par 0 ou +33`],
    set: v => v?.replace(/^0/, '+33'),
    required: false,
  },
  // Calls attributes
  comment: {
    type: String,
    required: false,
  },
  call_status: {
    type: String,
    enum: Object.keys(CALL_STATUS),
    default: CALL_STATUS_TO_CALL,
    // TODO: manage both lead && calls
    //required: [true, `Le status d'appel est obligatoire`],
    required: false,
    set: v => v || undefined,
  },
  campain: {
    type: String,
    required: false,
  },
  // Did the lead open the 1st campain email
  mail_opened: {
    type: Boolean,
    default: false,
  },
  operator: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: "job",
    required: false,
  },
  decline_reason: {
    type: Schema.Types.ObjectId,
    ref: "declineReason",
    required: false,
  },
  join_reason: {
    type: Schema.Types.ObjectId,
    ref: "joinReason",
    required: false,
  },
  next_call_date: {
    type: Date,
    required: false,
  },
  interested_in: [{
    type: Schema.Types.ObjectId,
    ref: "interest",
    required: false,
  }],
  call_direction: {
    type: String,
    enum: Object.keys(CALL_DIRECTION),
    required: false,
    set: v => v || undefined,
  },
  consent: {
    type: Boolean,
    required: false,
  },
  nutrition_converted: {
    type: Boolean,
    default: false,
    required: false,
  },
  coaching_converted: {
    type: String,
    enum: Object.keys(COACHING_CONVERSION_STATUS)
  },
  crm_id: {
    type: Number,
  },
  migration_id: {
    type: Number,
    required: false,
    index: true,
  },
}, schemaOptions)

LeadSchema.index(
  { email: 1},
  { unique: true, message: 'Un prospect existe déjà avec cet email' });

/* eslint-disable prefer-arrow-callback */
LeadSchema.virtual('fullname', DUMMY_REF).get(function() {
  return `${this.firstname || ''} ${this.lastname || ''}`
})

LeadSchema.virtual("company", {
  ref: "company", // The Model to use
  localField: "company_code", // Find in Model, where localField
  foreignField: "code", // is equal to foreignField
  justOne: true,
});

// Corresponding registered user if any
LeadSchema.virtual("registered_user", {
  ref: "user", // The Model to use
  localField: "email", // Find in Model, where localField
  foreignField: "email", // is equal to foreignField
});

LeadSchema.virtual('registered', DUMMY_REF).get(function() {
  return !lodash.isEmpty(this.registered_user)
})

LeadSchema.virtual("nutrition_advices", {
  ref: "nutritionAdvice", // The Model to use
  localField: 'email',
  foreignField: 'patient_email',
})

/* eslint-enable prefer-arrow-callback */

module.exports = LeadSchema
