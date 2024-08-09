const {
  MONGOOSE_OPTIONS} = require('../../../server/utils/database')
const moment = require('moment')
const mongoose = require('mongoose')
const {forceDataModelSmartdiet}=require('../../utils')
forceDataModelSmartdiet()
const User=require('../../../server/models/User')
const Company=require('../../../server/models/Company')
require('../../../server/models/Target')
require('../../../server/models/Category')
require('../../../server/models/Association')
require('../../../server/models/Question')
const {loadFromDb}=require('../../../server/utils/database')
require('../../../server/plugins/smartdiet/consts')
require('../../../server/plugins/smartdiet/functions')

jest.setTimeout(10000)

describe('Validate virtual attributes mapping', ()=> {
  let user
  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    const company=await Company.create({size:100, activity:'COMPANY_ACTIVITY_BANQUE',name:'Test'})
	user=await User.create({pseudo:'s',email:'email',firstname:'f',lastname:'l',company, dataTreatmentAccepted:true,cguAccepted:true})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  test('Check virtual attribute populate', async () => {
    const [loaded_user]=await loadFromDb({model: 'user',fields:['contents.comments_count'],user})
    expect(loaded_user.contents).toHaveLength(1)
    expect(loaded_user.contents[0].comments_count).toEqual(1)
  })
})