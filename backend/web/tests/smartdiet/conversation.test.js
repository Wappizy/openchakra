const lodash=require('lodash')
const mongoose = require('mongoose')
const {forceDataModelSmartdiet, buildAttributesException}=require('../utils')
const Conversation = require('../../server/models/Conversation')
require('../../server/models/Job')
require('../../server/models/DeclineReason')
require('../../server/models/JoinReason')
require('../../server/models/FoodDocument')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Message = require('../../server/models/Message')
const { ROLE_EXTERNAL_DIET } = require('../../server/plugins/smartdiet/consts')
const User = require('../../server/models/User')
const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')

forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')

const DIET_CRITERION={email: 'stephanieb.smartdiet@gmail.com', role: ROLE_EXTERNAL_DIET}

describe('Conversation ', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    // await mongoose.connection.close()
  })

  it(`must check conversations`, async() => {
    const conversations=await Conversation.find()
    const getConvUsers = conv => new Set(conv.users.map(u => u._id.toString()))
    const getMsgUsers = msg => new Set([msg.sender, msg.receiver].map(u => u._id.toString()))
    const messages=await Message.find({group: null})
    console.log('conversations', conversations)
    messages.forEach(m => {
      const msgUsers = getMsgUsers(m)
      const conv=conversations.find(c => lodash.isEqual(msgUsers, getConvUsers(c)))
      expect(conv._id.toString()).toEqual(m.conversation._id.toString())
    })
  })

  it(`must check conversations messages`, async() => {
    const conversations=await Conversation.find()
      .populate({path: 'users'})
      .populate({path: 'messages', populate: ['sender', 'receiver']})
    const sortedConversations=lodash.sortBy(conversations, conv => conv.users.map(u => u.email).sort().join('-'))
    sortedConversations.map(conv => {
      console.group(conv.users.map(u => u.email).sort())
      conv.messages.forEach(m => {
        console.log(m.group ? "GROUPE!!!"+m: '')
        console.log([m.sender, m.receiver].map(u => u.email).sort())
      })
      console.groupEnd()
    })
  })

  it('Should return latest messages', async()=> {
    const diet=await User.findOne(DIET_CRITERION)
    const conversations=await Conversation.find({users: diet._id}).populate(['messages', 'latest_messages'])
    conversations
      .filter(c => c.messages.length==1)
      .forEach(conv => {
        console.log(conv._id)
        expect(conv.latest_messages).toHaveLength(1)
    })
  })

  it.only('Should return latest messages (2)', async()=> {
    const CONVID="66102d3348a4d229cbb1164b"
    const DIET_EMAIL='cyndiet.smartdiet@gmail.com'
    const conversation=await Conversation.findById(CONVID).populate(['messages', 'latest_messages'])
    expect(conversation.latest_messages[0]?.[CREATED_AT_ATTRIBUTE]).toBeTruthy()
    const diet=await User.findOne({email: DIET_EMAIL})
    const [conversation2 ]=await loadFromDb({model: 'conversation', id: CONVID, fields: ['latest_messages.creation_date'], user: diet})
    console.log(conversation2)
  })

})

