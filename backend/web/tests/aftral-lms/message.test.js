const moment=require('moment')
const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const User=require('../../server/models/User')
const { ROLE_CONCEPTEUR, ROLE_FORMATEUR, RESOURCE_TYPE, BLOCK_STATUS_UNAVAILABLE, ACHIEVEMENT_RULE_DOWNLOAD, RESOURCE_TYPE_VIDEO} = require('../../server/plugins/aftral-lms/consts')
const Resource=require('../../server/models/Resource')
const {forceDataModelAftral}=require('../utils')
forceDataModelAftral()
const { updateAllDurations, updateDuration, lockSession } = require('../../server/plugins/aftral-lms/functions')
const Message = require('../../server/models/Message')
const lodash=require('lodash')


describe('Test models computations', () => {

  let designer;
  let trainer

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    designer=await User.create({firstname: 'concepteur', lastname: 'concepteur', 
      email: 'hello+concepteur@wappizy.com', role: ROLE_CONCEPTEUR, password: 'p1'})
    trainer=await User.create({firstname: 'formateur', lastname: 'formateur', 
      email: 'hello+formateur@wappizy.com', role: ROLE_FORMATEUR, password: 'p1'})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return last_message', async() => {
    const designer_resource=await Resource.create({
      name: 'Ressource designer', 
      duration:10, 
      creator: designer, 
      url: 'url', 
      resource_type: RESOURCE_TYPE_VIDEO, 
      achievement_rule: ACHIEVEMENT_RULE_DOWNLOAD,
      achievement_status: BLOCK_STATUS_UNAVAILABLE})
    const trainer_resource=await Resource.create({
      name: 'Ressource formateur', 
      duration:10,  
      creator: trainer, 
      url: 'url', 
      resource_type: RESOURCE_TYPE_VIDEO, 
      achievement_rule: ACHIEVEMENT_RULE_DOWNLOAD,
      achievement_status: BLOCK_STATUS_UNAVAILABLE, 
  })
    const messages=lodash.range(10)
    await Promise.all(messages.map(idx => Message.create({creation_date: moment().add(idx, 'seconds'), sender: designer, receiver: trainer, content: `Message ${idx}`})))
    const conversations=await loadFromDb({model: 'conversation', user: designer, fields: ['messages', 'newest_message']})
    console.log(conversations[0].messages)
    expect(conversations).toHaveLength(1)
    expect(conversations[0].newest_message.content).toBe('Message 9')
  })

})
