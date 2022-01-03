const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {COMPANY_SIZE, COMPANY_ACTIVITY}=require('../../utils/consts')
const {hideIllegal} = require('../../utils/text')

const mongooseLeanVirtuals = require('mongoose-lean-virtuals')

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  siret: {
    type: String,
  },
  billing_address: {
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    zip_code: {
      type: String,
    },
    country: {
      type: String,
    },
    gps: {
      lat: Number,
      lng: Number,
    },
  },
  service_address: [{
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    zip_code: {
      type: String,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    label: {
      type: String,
    },
  }],
  vat_subject: {
    type: Boolean,
    required: true,
    default: false,
  },
  vat_number: {
    type: String,
  },
  activity: {
    type: String,
    enum: Object.keys(COMPANY_ACTIVITY),
  },
  size: {
    type: String,
    enum: Object.keys(COMPANY_SIZE),
  },
  description: {
    type: String,
    set: text => hideIllegal(text),
  },
  // Legal repesentative
  representative: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  // Mangopay as client
  id_mangopay: {
    type: String,
    default: null,
  },
}, {toJSON: {virtuals: true, getters: true}})

CompanySchema.virtual('full_name').get(function() {
  return this.name
})

CompanySchema.virtual('mangopay_provider_id').get(function() {
  return this.id_mangopay
})

CompanySchema.plugin(mongooseLeanVirtuals)

module.exports = mongoose.model('company', CompanySchema)
