const mongoose = require("mongoose")
const moment = require("moment")
const { schemaOptions } = require('../../../utils/schemas');
const autoIncrement = require('mongoose-auto-increment')
const { DUMMY_REF } = require("../../../utils/database");
const { MISSION_STATUS_TO_COME, MISSION_STATUS_CUSTOMER_FINISHED, MISSION_STATUS_FREELANCE_FINISHED, MISSION_STATUS_CLOSED, MISSION_STATUS_CURRENT } = require("../consts");

const Schema = mongoose.Schema;

const MissionSchema = new Schema({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'application',
    required: [true, `La candidature est obligatoire`],
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'customerFreelance',
    required: [true, `Le client est obligatoire`],
  },
  freelance: {
    type: Schema.Types.ObjectId,
    ref: 'customerFreelance',
    required: [true, `Le freelance est obligatoire`],
  },
  title: {
    type: String,
    required: [true,  `Le nom de mission est obligatoire`],
  },
  start_date: {
    type: Date,
    required: [true, `La date de début est obligatoire`],
  },
  end_date: {
    type: Date,
    required: [true, `La date de fin est obligatoire`],
  },
  // Total budget / somme des CRAs déclarés
  progress: {
    type: Number,
  },
  _counter: {
    type: Number,
  },
  freelance_finish_date: {
    type: Date,
  },
  customer_finish_date: {
    type: Date,
  },
  close_date: {
    type: Date,
  },
}, schemaOptions
);

/* eslint-disable prefer-arrow-callback */
// Manage announce serial number
if (mongoose.connection) {
  autoIncrement.initialize(mongoose.connection) // Ensure autoincrement is initalized
}

MissionSchema.plugin(autoIncrement.plugin, { model: 'mission', field: '_counter', startAt: 1});

MissionSchema.virtual('serial_number', DUMMY_REF).get(function() {
  if (!this._counter) {
    return undefined
  }
  return `M${moment().format('YY')}${this._counter.toString().padStart(5, 0)}`
})

// TO_COME, CURRENT, FINISHED_FREELANCE (he declares), FINISHED_CUSTOMER (he validates), CLOSED
MissionSchema.virtual('status', DUMMY_REF).get(function() {
  if (moment().isBefore(this.start_date)) {
    return MISSION_STATUS_TO_COME
  }
  if (!!this.close_date) {
    return MISSION_STATUS_CLOSED
  }
  if (!!this.customer_finish_date) {
    return MISSION_STATUS_CUSTOMER_FINISHED
  }
  if (!!this.freelance_finish_date) {
    return MISSION_STATUS_FREELANCE_FINISHED
  }
  return MISSION_STATUS_CURRENT
})

MissionSchema.virtual('report', {
  ref: 'report',
  localField: '_id',
  foreignField: 'mission',
  jutSone: true,
})
/* eslint-enable prefer-arrow-callback */


module.exports = MissionSchema;
