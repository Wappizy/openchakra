const moment=require('moment')
const mongoose = require('mongoose')

const {forceDataModelSmartdiet}=require('../utils')
forceDataModelSmartdiet()
require('../../server/plugins/smartdiet/functions')

const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const {ROLE_CUSTOMER, COMPANY_ACTIVITY,ROLE_EXTERNAL_DIET} = require('../../server/plugins/smartdiet/consts')

const Coaching=require('../../server/models/Coaching')
const User=require('../../server/models/User')
const Company=require('../../server/models/Company')
require('../../server/models/LogbookDay')
require('../../server/models/Range')
require('../../server/models/Target')
require('../../server/models/Category')
require('../../server/models/UserQuizz')
require('../../server/models/Quizz')
require('../../server/models/Key')
require('../../server/models/Association')
require('../../server/models/Question')
require('../../server/models/Item')
jest.setTimeout(10000)

describe('Diet appointments management ', () => {

  let user, user2
  let diet
  let coaching1, coaching2

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    const company=await Company.create({name: 'Company', size:100, activity: Object.keys(COMPANY_ACTIVITY)[0]})
    user=await User.create({company, dataTreatmentAccepted:true,role:ROLE_CUSTOMER, cguAccepted:true,
      pseudo: 'Seb', firstname: 'S', lastname: 'S', email: 'a@a.com'})
    user2=await User.create({company, dataTreatmentAccepted:true,role:ROLE_CUSTOMER, cguAccepted:true,
      pseudo: 'Seb', firstname: 'S', lastname: 'S', email: 'a@a.com'})
    diet=await User.create({role:ROLE_EXTERNAL_DIET, pseudo: 'Diet', firstname: 'Diet', lastname: 'Diet', email: 'diet@diet.com'})
    coaching1=await Coaching.create({diet:diet._id, user:user._id})
    coaching2=await Coaching.create({diet:diet._id, user:user._id})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return diet appointments', async() => {
    const users=await loadFromDb({model: 'user', fields:['diet_appointments']})
    const loaded_diet=users.find(u => u.role==ROLE_EXTERNAL_DIET)
    expect(loaded_diet.diet_appointments).toHaveLength(2)
  })

  it('must return diet patients', async() => {
    let users=await loadFromDb({model: 'user', fields:['diet_patients']})
    let loaded_diet=users.find(u => u.role==ROLE_EXTERNAL_DIET)
    expect(loaded_diet.diet_patients).toHaveLength(1)
    const extraCoaching=await Coaching.create({diet:diet._id, user:user2._id})
    users=await loadFromDb({model: 'user', fields:['diet_patients']})
    loaded_diet=users.find(u => u.role==ROLE_EXTERNAL_DIET)
    expect(loaded_diet.diet_patients).toHaveLength(2)
    await extraCoaching.delete()
  })
})