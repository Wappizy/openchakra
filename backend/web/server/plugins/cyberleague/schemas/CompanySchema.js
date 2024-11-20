const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const siret = require('siret')
const { DUMMY_REF } = require('../../../utils/database')
const { SECTOR, COMPANY_SIZE, LOOKING_FOR_MISSION, STATUTS, STATUT_FOUNDER, STATUT_SPONSOR, CURRENT_CAMPAIGN_YES, CURRENT_CAMPAIGN_NO } = require('../consts')
const { isPhoneOk, isEmailOk } = require('../../../../utils/sms')
const AddressSchema = require('../../../models/AddressSchema')

const Schema = mongoose.Schema

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la société est requis'],
    },
    picture: {
      type: String,
    },
    size: {
      type: String,
      enum: Object.keys(COMPANY_SIZE),
      required: true,
    },
    administrators: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      }],
      required: false
    },
    sector: {
      type: String,
      enum: Object.keys(SECTOR),
      required: true,
    },
    email: {
      type: String,
      required: false,
      set: v => v ? v.toLowerCase().trim() : v,
      index: false,
      validate: [isEmailOk, v => `L'email '${v.value}' est invalide`],
    },
    phone: {
      type: String,
      validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
      set: v => v?.replace(/^0/, '+33'),
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    certifications: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'certification',
        required: true,
      }],
      default: []
    },
    customer_successes: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'customerSuccess',
        required: true,
      }],
      default: [],
    },
    pinned_by: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      }],
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    city: {
      type: AddressSchema,
      required: true
    },
    perimeter: {
      type: Number,
      required: false
    },
    baseline: {
      type: String,
      required: false
    },
    company_creation: {
      type: Date,
      required: false
    },
    siret: {
      type: String,
      set: v => v?.replace(/ /g, ''),
      validate: [v => siret.isSIRET(v)||siret.isSIREN(v), 'Le SIRET ou SIREN est invalide'],
      required: false,
    },
    targeted_markets: {
      type: [{
        type: String,
        enum: Object.keys(SECTOR),
        required: true,
      }],
      default: [],
    },
    contents: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'content',
        required: true,
      }],
      default: [],
    },
    looking_for_mission: {
      type: String,
      enum: Object.keys(LOOKING_FOR_MISSION),
      required: false,
      set: v => v || undefined,
    },
    expertise_set: {
      type: Schema.Types.ObjectId,
      ref: 'expertiseSet',
    },
    related_companies: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'company'
      }]
    },
    statut: {
      type: String,
      enum: Object.keys(STATUTS),
      required: false,
      set: v => v || undefined,
    },
    sponsor: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'company'
      }]
    },
    founders: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'company'
      }]
    },
    is_current_campaign: {
      type: Boolean,
      required: [true, `Il est obligatoire de préciser si l'entreprise a ses publicités actives ou non`],
      default: false
    },
    is_default_sponsor: {
      type: Boolean,
      required: [true, `Il est obligatoire de préciser si l'entreprise a est sponsor par défaut ou non`],
      default: false
    },
  },
  schemaOptions,
)

/* eslint-disable prefer-arrow-callback */

CompanySchema.virtual('users', {
  ref: 'user', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'company', // is equal to foreignField
})

CompanySchema.virtual('affected_missions', {
  ref: 'mission', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'companies', // is equal to foreignField
})

CompanySchema.virtual('affected_missions_count', {
  ref: 'mission', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'companies', // is equal to foreignField
  count: true,
})

CompanySchema.virtual('events', {
  ref: 'event', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'company', // is equal to foreignField
})

CompanySchema.virtual('pinned_by_count', DUMMY_REF).get(function () {
  return this.pinned_by?.length || 0
})

CompanySchema.virtual('sponsored', {
  ref: 'user',
  localField: '_id',
  foreignField: 'company_sponsorship'
})

CompanySchema.virtual('carreers', {
  ref: 'carreer',
  localField: '_id',
  foreignField: 'company'
})

CompanySchema.virtual('offers', {
  ref: 'offer',
  localField: '_id',
  foreignField: 'company'
})

CompanySchema.virtual('candidates_missions', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'candidates'
})

CompanySchema.virtual('candidates_missions_count', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'candidates',
  count: true
})

CompanySchema.virtual('region', DUMMY_REF).get(function () {
  return this.city?.region
})

CompanySchema.virtual('is_partner', DUMMY_REF).get(function() {
  return this.statut == STATUT_FOUNDER || this.statut == STATUT_SPONSOR
})

CompanySchema.virtual('advertisings', {
  ref: 'advertising',
  localField: '_id',
  foreignField: 'company'
})

CompanySchema.virtual('advertisings_count', {
  ref: 'advertising',
  localField: '_id',
  foreignField: 'company',
  count: true
})

CompanySchema.virtual('current_campaign', DUMMY_REF).get(function () {
  return this.is_current_campaign ? CURRENT_CAMPAIGN_YES : CURRENT_CAMPAIGN_NO
})

/* eslint-enable prefer-arrow-callback */

module.exports = CompanySchema