const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { idEqual } = require('../../../utils/database')
const { CREATED_AT_ATTRIBUTE } = require('../../../../utils/consts')
const Schema = mongoose.Schema

const ConversationSchema = new Schema({
  users: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    required: [value => value?.length==2, `Les deux utilisateurs sont requis`]
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  application: {
    type: mongoose.Schema.ObjectId,
    ref: 'application',
    required: [true, `L'application est obligatoire`]
  },
},
schemaOptions)

ConversationSchema.virtual('messages', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
})

ConversationSchema.virtual('messages_count', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
  count: true,
})

ConversationSchema.virtual('latest_messages', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
  options: { 
    sort: { [CREATED_AT_ATTRIBUTE]: -1 }, 
    limit: 1,
  },
})

ConversationSchema.statics.getFromUsersApplication = async function(user1, user2, applicationId) {
  if (!user1 || !user2 || !applicationId) {
    return null
  }
  let conversation=await this.findOne({$and: [{users: user1},{users: user2}], application: applicationId})
  if (!conversation) {
    conversation=await this.create({users: [user1, user2], application: applicationId})
  }
  return conversation
};

ConversationSchema.methods.getPartner = async function(me) {
  const partner=idEqual(this.users[0], me) ? this.users[1] : this.users[0]
  return partner
}

module.exports=ConversationSchema
