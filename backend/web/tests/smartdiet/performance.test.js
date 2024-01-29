const AppointmentType = require('../../server/models/AppointmentType')
const moment=require('moment')
const mongoose = require('mongoose')
const { performance } = require('perf_hooks');
const {forceDataModelSmartdiet, buildAttributesException}=require('../utils')

forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')

const {getDataModel} = require('../../config/config')
const {MONGOOSE_OPTIONS, loadFromDb, buildPopulates} = require('../../server/utils/database')
const {ROLE_CUSTOMER, COMPANY_ACTIVITY, ROLE_EXTERNAL_DIET} = require('../../server/plugins/smartdiet/consts')

const Appointment=require('../../server/models/Appointment')
const Coaching=require('../../server/models/Coaching')
const User=require('../../server/models/User')
const Company=require('../../server/models/Company')
const { computeStatistics } = require('../../server/plugins/smartdiet/functions')
require('../../server/models/Target')
require('../../server/models/Quizz')
require('../../server/models/Association')
require('../../server/models/Key')
require('../../server/models/Category')
require('../../server/models/Question')
require('../../server/models/UserQuizz')
require('../../server/models/Item')
require('../../server/models/LogbookDay')
require('../../server/models/Job')
require('../../server/models/DeclineReason')
require('../../server/models/JoinReason')

jest.setTimeout(100000)

const FIELDS=`groups_count,messages_count,users_count,user_women_count,webinars_count,webinars_replayed_count,average_webinar_registar,company,started_coachings,users_men_count,users_no_gender_count,leads_count,specificities_users,reasons_users`.split(',')
const COMPANY_ID = '65b1a8a148a716c5b3cb29bc'
const DIET_ID='651a9d3e1a7bd51b71a40327'

describe('Performance ', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it(`must load statistics 'fastly'`, async() => {
    const start=performance.now()
    const stats=await computeStatistics({id: COMPANY_ID, fields: FIELDS})
    const delta=performance.now()-start
    console.log('Took', delta, 'ms')
    expect(delta).toBeLessThan(2000)
  })

  it(`must load statistics properly`, async() => {
    const stats=await computeStatistics({id: COMPANY_ID, fields: FIELDS})
    console.log(FIELDS.map(f => `${f}:${stats[f]}`))
    FIELDS.forEach(f => expect(stats).not.toBeNull())
    FIELDS.forEach(f => expect(stats[f]).not.toBeUndefined())
  })

  it('must return diet patients', async () => {
    const dietUser=await User.findById(DIET_ID)
    const patientsCount=await Coaching.distinct('user', {diet: DIET_ID}).count()
    let diet1=await User.findById(DIET_ID).populate('diet_patients')
    expect(diet1.diet_patients[0].email).toBeTruthy()
    expect(patientsCount).toEqual(diet1.diet_patients.length)
    let diet2=await User.findById(DIET_ID).populate('diet_patients_count')
    expect(patientsCount).toEqual(diet2.diet_patients_count)
    const [loaded]=await loadFromDb({model: 'user', id: DIET_ID, fields:['diet_patients_count'], user: dietUser})
    expect(patientsCount).toEqual(loaded.diet_patients_count)
  })

  it('must return diet apppointments', async () => {
    const dietUser=await User.findById(DIET_ID)
    const coachings=await Coaching.find({diet: DIET_ID}, {id: 1})
    const preCount=await Appointment.countDocuments({coaching: {$in: coachings}})
    const diet=await User.findById(DIET_ID).populate('diet_appointments')
    console.log(JSON.stringify(diet.diet_appointments?.[0],null, 2))
    console.log(JSON.stringify(diet.coachings?.[0],null, 2))
    expect(diet.diet_appointments.length).toEqual(preCount)
    // expect(diet.diet_appointments).toHaveLength(1581)
    // const diet2=await User.findById(DIET_ID).populate(['diet_appointments_count','diet_appointments'])
    // expect(diet2.diet_appointments_count).toEqual(diet.diet_appointments.length)
    // const [diet3]=await loadFromDb({model: 'user', id: DIET_ID, fields:['diet_appointments_count'], user:diet})
    // expect(diet3.diet_appointments_count).toEqual(diet.diet_appointments.length)
  })

  it.only('must load limits', async () => {
    const user=await User.findOne({role: ROLE_EXTERNAL_DIET})
    const companies=await loadFromDb({model: 'company', fields:['name'], params:{limit:3}, user})
    return expect(companies.length).toEqual(3)
  })

})

