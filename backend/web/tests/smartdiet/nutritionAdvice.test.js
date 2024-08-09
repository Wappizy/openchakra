const { DIET_DATA } = require('./data/modelsBaseData')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const moment = require('moment')
const mongoose = require('mongoose')
const {forceDataModelSmartdiet}=require('../utils')

forceDataModelSmartdiet()

const Lead=require('../../server/models/Lead')
const User = require('../../server/models/User')
const NutritionAdvice = require('../../server/models/NutritionAdvice')
require('../../server/models/Content')
require('../../server/models/Comment')

describe('Prospects', () => {

  beforeEach(async () => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return proper nut advices', async() => {
    const patient_email='test@test.com'
    const lead_email='prospect@test.com'
    const diet1_email='diet@test.com'
    const diet2_email='diet@test.com'
    const diet1=await User.create({...DIET_DATA, email: diet1_email, password: 'hop'})
    const diet2=await User.create({...DIET_DATA, email: diet2_email, password: 'hop'})
    const nuts=[[diet1, lead_email], [diet1, patient_email],[diet2, lead_email], [diet2, patient_email]]
    await Promise.all(nuts.map(([d, p]) => NutritionAdvice.create({diet: d, patient_email:p, comment: 'c' })))
    const nutDiet1=await User.findOne({email: diet1_email}).populate('nutrition_advices')
    const nutDiet2=await User.findOne({email: diet2_email}).populate('nutrition_advices')
    const nutPatient=await User.findOne({email: patient_email}).populate('nutrition_advices')
    const nutLead=await Lead.findOne({email: lead_email}).populate('nutrition_advices')
    expect(nutDiet1.nutrition_advices).toHaveLength(2)
    expect(nutDiet2.nutrition_advices).toHaveLength(2)
    expect(nutPatient.nutrition_advices).toHaveLength(2)
    expect(nutLead.nutrition_advices).toHaveLength(2)
  })
})