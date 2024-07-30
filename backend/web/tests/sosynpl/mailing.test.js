const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const Question = require('../../server/models/Question')
const { CUSTOMER_DATA, FREELANCE_DATA, JOB_FILE_DATA, SECTOR_DATA, JOB_DATA } = require('./data/base_data')
const { ROLE_ADMIN, SUSPEND_REASON, SUSPEND_REASON_INACTIVE, ROLE_FREELANCE, MOBILITY_CITY, WORK_MODE_REMOTE, COMPANY_SIZE_LESS_10, MOBILITY_FRANCE, LEGAL_STATUS, LEGAL_STATUS_CAE } = require('../../server/plugins/sosynpl/consts')
const { suspendAccount } = require('../../server/plugins/sosynpl/actions')
const { checkFreelanceInterest } = require('../../server/plugins/sosynpl/mailing')
const JobFile = require('../../server/models/JobFile')
const Job = require('../../server/models/Job')
const Sector = require('../../server/models/Sector')
require('../../server/plugins/sosynpl/functions')

describe('Mailing', () => {
  let admin, freelance, customer
  
  beforeAll(async () => {
    const DBNAME = `test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)

    const jobFile=await JobFile.create({...JOB_FILE_DATA})
    const job=await Job.create({...JOB_DATA, job_file: jobFile})
    const sector=await Sector.create({...SECTOR_DATA})

    freelance=await CustomerFreelance.create({
      ...FREELANCE_DATA, 
      role:ROLE_FREELANCE,
      main_job: job, 
      work_sector: 
      [sector],
      mobility: MOBILITY_FRANCE, 
      work_mode: WORK_MODE_REMOTE, 
      rate: 5, 
      description: 'hi', 
      company_size: COMPANY_SIZE_LESS_10,
      email:'seghir.oumohand@wappizy.com', 
      availability_last_update:moment().subtract(45, 'days').toDate(),
      legal_status:LEGAL_STATUS_CAE
    })

    customer=await CustomerFreelance.create({...CUSTOMER_DATA})

    admin = await CustomerFreelance.create({...CUSTOMER_DATA, role:ROLE_ADMIN})
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must suspend inactive account', async() => {
    await suspendAccount({value:freelance._id, reason:SUSPEND_REASON_INACTIVE},admin)
  })

  it.only('must send reminder if interested', async () => {
    await checkFreelanceInterest()
  })
})