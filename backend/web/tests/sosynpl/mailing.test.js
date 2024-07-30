const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const Question = require('../../server/models/Question')
const { CUSTOMER_DATA } = require('./data/base_data')
const { ROLE_ADMIN, SUSPEND_REASON, SUSPEND_REASON_INACTIVE } = require('../../server/plugins/sosynpl/consts')
const { suspendAccount } = require('../../server/plugins/sosynpl/actions')
const { checkFreelanceInterest } = require('../../server/plugins/sosynpl/mailing')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/JobFile')
require('../../server/models/Job')

describe('Mailing', () => {
  let user, admin
  
  beforeAll(async () => {
    const DBNAME = `test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)

    user = await CustomerFreelance.create({...CUSTOMER_DATA, email:'seghir.oumohand@wappizy.com', availability_last_update:moment().subtract(47, 'days').toDate()})
    admin = await CustomerFreelance.create({...CUSTOMER_DATA, role:ROLE_ADMIN})
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must get question creator', async() => {
    await suspendAccount({value:user._id, reason:SUSPEND_REASON_INACTIVE},admin)
  })

  it.only('must send reminder if interested', async () => {
    console.log(user.availability_last_update)
    await checkFreelanceInterest()
  })
})