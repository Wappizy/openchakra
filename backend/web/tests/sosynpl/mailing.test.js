const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const Question = require('../../server/models/Question')
const { CUSTOMER_DATA, FREELANCE_DATA, JOB_FILE_DATA, SECTOR_DATA, JOB_DATA, CATEGORY_DATA } = require('./data/base_data')
const { ROLE_ADMIN, SUSPEND_REASON, SUSPEND_REASON_INACTIVE, ROLE_FREELANCE, MOBILITY_CITY, WORK_MODE_REMOTE, COMPANY_SIZE_LESS_10, MOBILITY_FRANCE, LEGAL_STATUS, LEGAL_STATUS_CAE, AVAILABILITY_ON, EXPERIENCE, DURATION_MONTH, MOBILITY_NONE } = require('../../server/plugins/sosynpl/consts')
const { suspendAccount, finishMission } = require('../../server/plugins/sosynpl/actions')
const JobFile = require('../../server/models/JobFile')
const Job = require('../../server/models/Job')
const Sector = require('../../server/models/Sector')
const PageTag_ = require('../../server/models/PageTag_')
const { availabilityPeriodUpdate, checkFreelanceInterest, checkNewSignUps, checkCustomerAnnounces } = require('../../server/plugins/sosynpl/cron')
const HardSkillCategory = require('../../server/models/HardSkillCategory')
const Expertise = require('../../server/models/Expertise')
const HardSkill = require('../../server/models/HardSkill')
const LanguageLevel = require('../../server/models/LanguageLevel')
const { LANGUAGE_LEVEL_ADVANCED } = require('../../utils/consts')
const Software = require('../../server/models/Software')
const Announce = require('../../server/models/Announce')
const Application = require('../../server/models/Application')
require('../../server/plugins/sosynpl/functions')
const lodash = require('lodash')
const Mission = require('../../server/models/Mission')


describe('Mailing', () => {
  let admin, freelance, customer, application, mission, announce, category1, category2, expertise1, expertise2, expertise3, language, software

  beforeAll(async () => {
    const DBNAME = `test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)

    const jobFile = await JobFile.create({ ...JOB_FILE_DATA })
    const job = await Job.create({ ...JOB_DATA, job_file: jobFile })
    const sector = await Sector.create({ ...SECTOR_DATA })

    const dateFilter = (x) => {
      return moment().subtract(x, 'days').toDate()
    }

    const FREELANCE_ATTR = {
      ...FREELANCE_DATA,
      role: ROLE_FREELANCE,
      main_job: job,
      work_sector:
        [sector],
      mobility: MOBILITY_FRANCE,
      work_mode: WORK_MODE_REMOTE,
      rate: 5,
      description: 'hi',
      company_size: COMPANY_SIZE_LESS_10,
      email: 'seghir.oumohand@wappizy.com',
      availability_last_update: dateFilter(45),
      legal_status: LEGAL_STATUS_CAE,
      availability: AVAILABILITY_ON,
      available_days_per_week: 5,
    }

    freelance = await CustomerFreelance.create({ ...FREELANCE_ATTR })
    await CustomerFreelance.create({ ...FREELANCE_ATTR, availability_last_update: dateFilter(8), })
    await CustomerFreelance.create({ ...FREELANCE_ATTR, availability_last_update: dateFilter(15), })
    await CustomerFreelance.create({ ...FREELANCE_ATTR, availability_last_update: dateFilter(30), })
    await CustomerFreelance.create({ ...FREELANCE_ATTR, availability_last_update: dateFilter(60), })

    customer = await CustomerFreelance.create({ ...CUSTOMER_DATA, email: 'seghir.oumohand@wappizy.com' })

    admin = await CustomerFreelance.create({ ...CUSTOMER_DATA, role: ROLE_ADMIN, email: 'seghir.oumohand@wappizy.com', })

    await PageTag_.create({ tag: 'SUPPLIER_DASHBOARD', url: '/supplier-dashboard' })
    await PageTag_.create({ tag: 'ADMIN_DASHBOARD', url: '/admin-dashboard' })
    await PageTag_.create({ tag: 'LOGIN', url: '/login' })
    await PageTag_.create({ tag: 'COMPANY_MISSION_PROGRESS', url: '/company-mission-progress' })

    const category1=await HardSkillCategory.create({...CATEGORY_DATA, name: `Catégorie 1`})
    const category2=await HardSkillCategory.create({...CATEGORY_DATA, name: `Catégorie 2`})
    expertise1 = await Expertise.create({ name: 'JavaScript' })
    expertise2 = await Expertise.create({ name: 'Java' })
    expertise3 = await Expertise.create({ name: 'Python' })
    await Promise.all(lodash.range(4).map(idx => HardSkill.create({name: `Skill 1-${idx}`, code: '12', job_file: jobFile, category: category1})))
    await Promise.all(lodash.range(2).map(idx => HardSkill.create({name: `Skill 2-${idx}`, code: '12', job_file: jobFile, category: category2})))
    language = await LanguageLevel.create({ language: 'fr', level: LANGUAGE_LEVEL_ADVANCED })
    software = await Software.create({ name: 'VS Code' })
    const rouen = {
      address: 'Place du Vieux-Marché',
      city: 'Rouen',
      zip_code: '76000',
      country: 'France',
      latitude: 49.4431,
      longitude: 1.0993,
    }
    // announce = await Announce.create({
    //   user: customer._id,
    //   title: 'dev',
    //   experience: Object.keys(EXPERIENCE)[0],
    //   duration: 2,
    //   duration_unit: DURATION_MONTH,
    //   budget: '6969669',
    //   mobility_days_per_month: 2,
    //   mobility: MOBILITY_NONE,
    //   city: rouen,
    //   sectors: [sector._id],
    //   expertises: [expertise1._id, expertise2._id, expertise3._id],
    //   pinned_expertises: [expertise1._id, expertise2._id, expertise3._id],
    //   softwares: [software._id],
    //   languages: [language._id],
    // })
    // application = await Application.create({
    //   announce: announce._id,
    //   customer: customer._id,
    //   freelance: freelance._id,
    // })

    // announce.accepted_application = application._id
    // await announce.save()

    // mission = await Mission.create({
    //   application: application._id,
    //   customer: customer._id,
    //   freelance: freelance._id,
    //   title: 'dev',
    //   start_date: new Date(),
    //   end_date: new Date('2025-06-06'),
    // })
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must suspend inactive account', async () => {
    await suspendAccount({ value: freelance._id, reason: SUSPEND_REASON_INACTIVE }, admin)
  })

  it('must send reminder if interested', async () => {
    await checkFreelanceInterest()
  })

  it('must send reminders on intervals', async () => {
    await availabilityPeriodUpdate()
  })

  it('must send reminders if there are new users today', async () => {
    await checkNewSignUps()
  })

  it('must send confirm mission mail to customer when freelance finishes', async () => {
    const [mission] = await loadFromDb({model:'mission', fields:['title','status']})
    const res= await finishMission({value:mission}, freelance)
  })

  it.only(`must send reminder to customer that hasn't published announce yet`, async() => {
    await checkCustomerAnnounces()
  })
})