const mongoose = require(`mongoose`)
const {schemaOptions} = require(`../../../utils/schemas`)
const lodash=require(`lodash`)
const {COMPANY_ACTIVITY, COMPANY_SIZE, TICKET_PRIORITY}=require(`../consts`)

const Schema = mongoose.Schema

const TicketCommentSchema = new Schema(
  {
    jiraid: {
      type: Number,
      required: [true, `Le numéro de ticket est obligatoire`],
    },
    text: {
      type: String,
      required: [true, `Le texte est obligatoire`],
    },
  }, schemaOptions,
)

module.exports = TicketCommentSchema
