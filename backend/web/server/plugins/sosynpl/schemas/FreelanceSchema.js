const mongoose = require('mongoose')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const customerSchema=require('./CustomerSchema')
const AddressSchema = require('../../../models/AddressSchema')
const {COMPANY_SIZE, WORK_MODE, WORK_DURATION, SOURCE, SOSYNPL, DISCRIMINATOR_KEY, VALID_STATUS_PENDING, EXPERIENCE, ROLE_FREELANCE, ROLES} = require('../consts')

const MIN_SECTORS=1
const MAX_SECTORS=5

const MIN_DURATIONS=1
const MAX_DURATIONS=3

const MIN_JOB_SKILLS=0
const MAX_JOB_SKILLS=20

const MIN_EXTRA_SKILLS=0
const MAX_EXTRA_SKILLS=20

const Schema = mongoose.Schema

const FreelanceSchema = new Schema({
  ...customerSchema.obj,
  // Ovveride address => mandatory
  address: {
    type: AddressSchema,
    required: [true, `L'adresse est obligatoire`],
  },
  // Override role
  role: {
    type: String,
    enum: Object.keys(ROLES),
    default: ROLE_FREELANCE,
    required: [true, `Le rôle est obligatoire`],
    index: true,
  },
  main_job: {
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: [true, `Le métier principal est obligatoire`],
  },
  main_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    required: [true, `L'expérience principale est obligatoire`],
  },
  second_job: {
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: false,
  },
  second_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    set: v => v || undefined,
    required: [function() {return !!this.second_job}, `L'expérience du deuxième métier est obligatoire`],
  },
  third_job: {
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: false,
  },
  third_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    set: v => v || undefined,
    required: [function() {return !!this.third_job}, `L'expérience du troisième métier est obligatoire`],
  },
  rate: {
    type: Number,
    validate: [v => !v || (parseInt(v)==v && v>1), `Le TJM doit être un nombre entier supérieur à 1€`],
    min: 1.0,
    required: false,
  },
  motivation: {
    type: String,
    required: [true, `Saisisez les types de missions recherchées`],
  },
  work_mode: {
    type: String,
    enum: Object.keys(WORK_MODE),
  },
  // 1 minimum, 3 max
  work_duration: {
    type: [{
      type: String,
      enum: Object.keys(WORK_DURATION),
    }],
    validate: [
      durations => lodash.inRange(durations?.length, MIN_DURATIONS, MAX_DURATIONS+1), 
      `Vous devez choisir de ${MIN_DURATIONS} à ${MAX_DURATIONS} durées de mission` 
    ]
  },
  // 1 minimum, 5 max
  work_sector: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'sector',
    }],
    validate: [
      sectors => lodash.inRange(sectors?.length, MIN_SECTORS, MAX_SECTORS+1), 
      `Vous devez choisir de ${MIN_SECTORS} à ${MAX_SECTORS} secteurs d'activité` 
    ]
  },
  work_company_size: {
    type: [{
      type: String,
      enum: Object.keys(COMPANY_SIZE),
    }],
  },
  softwares: [{
    type: Schema.Types.ObjectId,
    ref: 'software',
    required: false,
  }],
  software_languages: [{
    type: Schema.Types.ObjectId,
    ref: 'language',
    required: false,
  }],
  hard_skills_job: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'hardSkill',
    }],
    validate: [
      skills => lodash.inRange(skills?.length, MIN_JOB_SKILLS, MAX_JOB_SKILLS+1), 
      `Vous devez choisir de ${MIN_JOB_SKILLS} à ${MAX_JOB_SKILLS} compétences métiers` 
    ]
  },
  hard_skills_extra: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'hardSkill',
    }],
    validate: [
      skills => lodash.inRange(skills?.length, MIN_EXTRA_SKILLS, MAX_EXTRA_SKILLS+1), 
      `Vous devez choisir de ${MIN_EXTRA_SKILLS} à ${MAX_EXTRA_SKILLS} compétences hors métier` 
    ]
  },
  experience: {
    type: String,
    required: [true, `L'expérience est obligatoire`],
  },
  validation_status: {
    type: String,
    default: VALID_STATUS_PENDING,
    required: [true, `Le statut de validation est obligatoire`],
  },
  professional_rc: {
    type: String,
    required: false,
  },
  linkedin: {
    type: String,
    required: [function() { return !this.curriculum}, `Un lien Linkedin ou un CV est obligatoire`]
  },
  curriculum: {
    type: String,
    required: [function() { return !this.linkedin}, `Un lien Linkedin ou un CV est obligatoire`]
  },
  source: {
    type: String,
    enum: Object.keys(SOURCE),
    required: [true, `Sélectionnez la manière dont vous avez connu ${SOSYNPL}`]
  },
  picture_visible: {
    type: Boolean,
    default: false,
    required: [true, `La visibilité de la photo est obligatoire`]
  },
  google_visible: {
    type: Boolean,
    default: false,
    required: [true, `La visibilité Google est obligatoire`]
  },
  languages: [{
    type: Schema.Types.ObjectId,
    ref: 'languageLevel',
    required: false,
  }],
}, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */

FreelanceSchema.virtual('freelance_missions', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'freelance',
})

FreelanceSchema.virtual('recommandations', {
  ref: 'recommandation',
  localField: '_id',
  foreignField: 'freelance',
})

FreelanceSchema.virtual('communications', {
  ref: 'communication',
  localField: '_id',
  foreignField: 'user',
})

FreelanceSchema.virtual('experiences', {
  ref: 'experience',
  localField: '_id',
  foreignField: 'user',
})

FreelanceSchema.virtual('certifications', {
  ref: 'experience',
  localField: '_id',
  foreignField: 'user',
})

FreelanceSchema.virtual('trainings', {
  ref: 'training',
  localField: '_id',
  foreignField: 'user',
})

// Depends on filled attributes
FreelanceSchema.virtual('search_visible').get(function() {
  return false
})

FreelanceSchema.virtual('languages', {
  ref: 'languageLevel',
  localField: '_id',
  foreignField: 'user',
})

/* eslint-enable prefer-arrow-callback */

module.exports = FreelanceSchema
