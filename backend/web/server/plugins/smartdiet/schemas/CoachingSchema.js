const {
  AVAILABILITIES_RANGE_DAYS,
  COACHING_MODE,
  ROLE_CUSTOMER,
  ROLE_EXTERNAL_DIET,
  COACHING_STATUS,
  COACHING_STATUS_NOT_STARTED
} = require('../consts')
const moment = require('moment')
const { CREATED_AT_ATTRIBUTE } = require('../../../../utils/consts')
const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const lodash=require('lodash')
const {intersection, idEqual, DUMMY_REF}=require('../../../utils/database')

const Schema = mongoose.Schema

const CoachingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    index: true,
    required: [true, 'Le patient est obligatoire'],
  },
  diet: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    index: true,
    required: false,
  },
  mode: {
    type: String,
    enum: Object.keys(COACHING_MODE),
    required: false,
  },
  reasons: [{
    type: Schema.Types.ObjectId,
    // TODO: check that target's category's type is TARGET_COACHING
    ref: 'target',
    required: true,
  }],
  dummy: {
    type: Number,
    default: 0,
    required: true,
  },
  food_documents: [{
    type: Schema.Types.ObjectId,
    ref: 'foodDocument',
    required: false,
  }],
  quizz_templates: [{
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'quizz',
    required: true,
  }],
  quizz: [{
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'userQuizz',
    required: true,
  }],
  assessment_quizz: {
    type: Schema.Types.ObjectId,
    ref: 'userQuizz',
    required: [function() { this.status!=COACHING_STATUS_NOT_STARTED},`Le questionnaire bilan est obligatoire`],
  },
  impact_quizz: {
    type: Schema.Types.ObjectId,
    ref: 'userQuizz',
    required: false,
  },
  progress: {
    type: Schema.Types.ObjectId,
    ref: 'userQuizz',
    required: [function() { this.status!=COACHING_STATUS_NOT_STARTED},`Le questionnaire progression est obligatoire`],
  },
  // Food program URL
  food_program: {
    type: String,
  },
  migration_id: {
    type: Number,
    index: true,
    required: false,
  },
  status: {
    type: String,
    enum: Object.keys(COACHING_STATUS),
    default: COACHING_STATUS_NOT_STARTED,
    required: [true, `Le status du coaching est obligatoire`],
  },
  offer: {
    type: Schema.Types.ObjectId,
    ref: 'offer',
    required: [true, `L'offre est obligatoire`],
  },
  smartdiet_assessment_id: {
    type: Number,
    index: true,
    required: false,
  },
  smartdiet_assessment_document: {
    type: String,
    required: false,
  },
  smartdiet_impact_id: {
    type: Number,
    index: true,
    required: false,
  },
  smartdiet_impact_document: {
    type: String,
    required: false,
  },
  smartdiet_patient_id: {
    type: Number,
    index: true,
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
// Required for register validation only
CoachingSchema.virtual('appointments', {
  ref: 'appointment',
  localField: '_id',
  foreignField: 'coaching',
})

/* eslint-disable prefer-arrow-callback */
// Required for register validation only
CoachingSchema.virtual('latest_appointments', {
  ref: 'appointment',
  localField: '_id',
  foreignField: 'coaching',
  options: { 
    match : () => {
      return {start_date: {$lt: Date.now()}}
    },
    sort: { start_date: -1 }, limit:1 
  },
})

CoachingSchema.virtual('_last_appointment', {
  ref: 'appointment',
  localField: '_id',
  foreignField: 'coaching',
  options: { 
    sort: { start_date: -1 }, limit:1 
  },
  justOne: true,
})

/* eslint-disable prefer-arrow-callback */
// Required for register validation only
CoachingSchema.virtual('appointments_future', {
  ref: 'appointment',
  localField: '_id',
  foreignField: 'coaching',
  options: {
    match : u => {
      return {start_date: {$gt: Date.now()}}
    },
  }
})

CoachingSchema.virtual('questions', {
  ref: 'userCoachingQuestion',
  localField: '_id',
  foreignField: 'coaching',
})


CoachingSchema.virtual('remaining_credits', DUMMY_REF).get(function() {
  return (this.offer?.coaching_credit-this.spent_credits) || 0
})

CoachingSchema.virtual('spent_credits', {
  ref: 'appointment',
  localField: '_id',
  foreignField: 'coaching',
  options: {
    match: () => {
      return {end_date: {$lt: Date.now()}} 
    }
  },
  count: true,
})

// all diets (hidden)
CoachingSchema.virtual("_all_diets", {
  ref: "user", // The Model to use
  localField: "dummy", // Find in Model, where localField
  foreignField: "dummy", // is equal to foreignField
  options: {
    match: {role: ROLE_EXTERNAL_DIET},
  },
})

// Returns available diets order by compatible reasons count
/* TODO Criterion :
- remove if no smartagenda
- remove if no availabilities in the 15 next days
- remove if my company not in diet's customer_companies
- remove if coaching not in diet's activities
- keep then sort by reasons
*/
CoachingSchema.virtual('available_diets', DUMMY_REF).get(function() {
  const expected_app_type=this.appointment_type?._id
  return lodash(this._all_diets)
    // Diets allowing coaching
    .filter(d => d.diet_coaching_enabled)
    // Diets managing this company
    .filter(d => d.customer_companies?.map(c => c._id).includes(this.user?.company._id))
    // Diets having availability in the 15 next days for this kind of appointment
    .filter(d => d.availability_ranges?.some(r => idEqual(r.appointment_type._id, expected_app_type)))
    .orderBy(u => intersection(u.reasons, this.reasons), 'desc')
    .value()
})

// Returns the current objectoves (i.e. the newest appointment's ones)
CoachingSchema.virtual('current_objectives', DUMMY_REF).get(function() {
  return lodash(this.appointments)
   .orderBy(app => app[CREATED_AT_ATTRIBUTE].start_date, 'desc')
   .head()?.objectives || []
})

// Returned availabilities are not store in database
CoachingSchema.virtual('diet_availabilities', DUMMY_REF).get(function() {

  if (!this.diet){
    return []
  }

  const appType=this.appointment_type
  const diet_availabilities=this.diet.availability_ranges?.filter(r => idEqual(r.appointment_type._id, appType?._id)) || []

  const availabilities=lodash.range(AVAILABILITIES_RANGE_DAYS).map(day_idx => {
    const day=moment().add(day_idx, 'day').startOf('day')
    const ranges=diet_availabilities?.filter(r => day.isSame(r.start_date, 'day')) || []
    if (!ranges?.length) {
      return null
    }
    return ({
      date: day,
      ranges: lodash.orderBy(ranges, 'start_date'),
    })
  })
  .filter(v => !!v)
  return availabilities
});

// Returns the appointment type expected (1st appnt: assesment, others: followu)
CoachingSchema.virtual('appointment_type', DUMMY_REF).get(function() {
  const appType=lodash.isEmpty(this.appointments) ? this.user?.company?.assessment_appointment_type : this.user?.company?.followup_appointment_type
  return appType
})

// Returns wether this coaching is in progress or not
CoachingSchema.virtual('in_progress', DUMMY_REF).get(function() {
  return [COACHING_STATUS_DROPPED, COACHING_STATUS_FINISHED, COACHING_STATUS_STOPPED].includes(this.status)
})

/* eslint-enable prefer-arrow-callback */


module.exports = CoachingSchema
