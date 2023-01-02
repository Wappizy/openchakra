const mongoose = require('mongoose')
const moment = require('moment')
const {schemaOptions} = require('../../utils/schemas')
const {PLACES, TO_COME, CURRENT, FINISHED} = require('../../../utils/fumoir/consts')

const Schema = mongoose.Schema

const EventSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    picture: {
      type: String,
    },
    start_date: {
      type: Date,
      required: false,
    },
    end_date: {
      type: Date,
      required: false,
    },
    booking_user: {
      // User who booked
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
    ],
    place: {
      type: String,
      enum: [...Object.keys(PLACES)],
      required: false,
    },
  },
  schemaOptions,
)

/**
 TODO: should rather be a virtual function insteadd of this trick
 BUT: if it's a function, mongoose asks got foreignField declaration during populate
 THEN: exclude fields are marked as computed in buildPopulate(s)
 */
EventSchema.virtual('guests', {
  ref: 'guest', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: '_id', // is equal to foreignField
})

// Computed field
EventSchema.virtual('guests_count').get(() => {
  return null
})

EventSchema.virtual('members_count').get(function() {
  return this.guests_count + this.members?.length || 0
})

EventSchema.virtual('status').get(function() {
  if (this.start_date && moment() < moment(this.start_date)) {
    return TO_COME
  }
  if (this.end_date && moment() > moment(this.end_date)) {
    return FINISHED
  }
  // Not before, not after => current if both dates defined
  if (this.start_date && this.end_date) {
    return CURRENT
  }
  return null
})

module.exports = EventSchema
