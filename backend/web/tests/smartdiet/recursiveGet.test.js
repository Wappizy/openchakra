require('../../server/plugins/smartdiet/functions')
require('../../server/plugins/smartdiet/consts')
const moment=require('moment')
const mongoose = require('mongoose')
const {forceDataModelSmartdiet}=require('../utils')

forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')

require('../../config/config')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const {ROLE_CUSTOMER, COMPANY_ACTIVITY} = require('../../server/plugins/smartdiet/consts')

const Appointment=require('../../server/models/Appointment')
const Coaching=require('../../server/models/Coaching')
const User=require('../../server/models/User')
const Company=require('../../server/models/Company')
require('../../server/models/Target')
require('../../server/models/Quizz')
require('../../server/models/Association')
require('../../server/models/Key')
require('../../server/models/Category')
require('../../server/models/Question')
require('../../server/models/UserQuizz')
require('../../server/models/Item')
require('../../server/models/FoodDocument')
require('../../server/models/Availability')
require('../../server/models/Range')
require('../../server/models/LogbookDay')

jest.setTimeout(10000)

describe('Logbbooks management ', () => {

  let user
  let coaching

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    const company=await Company.create({name: 'Company test', size:100, activity: Object.keys(COMPANY_ACTIVITY)[0]})
    user=await User.create({company, dataTreatmentAccepted:true,role:ROLE_CUSTOMER, cguAccepted:true,
      pseudo: 'Seb', firstname: 'S', lastname: 'S', email: 'a@a.com'})
    coaching=await Coaching.create({user})
    await Appointment.create({coaching:coaching._id, start_date: moment().add(-2, 'day'), end_date: moment().add(-2, 'day').add(2, 'hour')})
    await Appointment.create({coaching:coaching._id, start_date: moment().add(-4, 'day'), end_date: moment().add(-4, 'day').add(2, 'hour')})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return user offer', async() => {
    let fields='offer'.split(',')
    const [loaded_user]=await loadFromDb({model: 'user', fields})
    expect(loaded_user.offer).toBeTruthy()
  })

  it('must return coaching credits offer', async() => {
    let fields='spent_credits,remaining_credits'.split(',')
    const [coaching]=await loadFromDb({model: 'coaching', fields})
    expect(coaching.spent_credits).toEqual(2)
    expect(coaching.remaining_credits).toEqual(5)
  })

  it('must return coaching remaining credits in Wappizy mode', async() => {
    let fields='latest_coachings.remaining_credits'.split(',')
    const [loaded_user]=await loadFromDb({model: 'user', fields})
    expect(loaded_user.latest_coachings[0].remaining_credits).toEqual(5)
  })
})