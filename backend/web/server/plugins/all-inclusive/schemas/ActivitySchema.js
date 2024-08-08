const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')

const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: `jobUser`,
    required: [true, `Le métier est obligatoire`],
  },
}, schemaOptions
);

module.exports = ActivitySchema
