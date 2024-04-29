const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const PackSchema = new Schema({
  title: {
    type: String,
    required: [true, `Le nom du pack est opbligatoire`]
  },
  checkup: {
    type: Boolean,
    required: [true, `Indiquez si l'offre inclut un bilan`]
  },
  follow_count: {
    type: Number,
    required: [true, `Le nombre de suivis est obligatoire`]
  },
  price: {
    type: Number,
    required: [true, `Le tarif de l'offre est obligatoire`]
  },
  payment_count: {
    type: Number,
    validate: [function(v) {return (+v)>0}, `Le nombre d'échéances de paiments doit être supérieur à 0`],
    required: [true, `Le nombre d'échéances de paiments est obligatoire`]
  },
},
{...schemaOptions}
)

module.exports = PackSchema
