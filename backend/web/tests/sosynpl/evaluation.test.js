const mongoose = require('mongoose')
const lodash = require('lodash')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Freelance = require('../../server/models/Freelance')
const JobFile = require('../../server/models/JobFile')
const { JOB_FILE_DATA, JOB_DATA, SECTOR_DATA, CATEGORY_DATA, FREELANCE_DATA, CUSTOMER_DATA } = require('./data/base_data')
const Job = require('../../server/models/Job')
const Sector = require('../../server/models/Sector')
const HardSkillCategory = require('../../server/models/HardSkillCategory')
const HardSkill = require('../../server/models/HardSkill')
const Expertise = require('../../server/models/Expertise')
const Customer = require('../../server/models/Customer')
const Announce = require('../../server/models/Announce')
const { EXPERIENCE, DURATION_UNIT_DAYS, DURATION_UNIT, MOBILITY_NONE, DURATION_MONTH } = require('../../server/plugins/sosynpl/consts')
const Software = require('../../server/models/Software')
const LanguageLevel = require('../../server/models/LanguageLevel')
const { LANGUAGE_LEVEL_ADVANCED } = require('../../utils/consts')
const Application = require('../../server/models/Application')
const Mission = require('../../server/models/Mission')
const Evaluation = require('../../server/models/Evaluation')

jest.setTimeout(30000000)

describe('Evaluation', ()=> {
  let freelance, announce, application, evaluation, sector, expertise1, expertise2, expertise3, software, language, customer, mission
  beforeAll(async () => {
    const DBNAME=`evalTest`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
    const jobFile=await JobFile.create({...JOB_FILE_DATA})
    const job=await Job.create({...JOB_DATA, job_file: jobFile})
    sector=await Sector.create({...SECTOR_DATA})
    const category1=await HardSkillCategory.create({...CATEGORY_DATA, name: `Catégorie 1`})
    const category2=await HardSkillCategory.create({...CATEGORY_DATA, name: `Catégorie 2`})
    expertise1 = await Expertise.create({ name: 'JavaScript' })
    expertise2 = await Expertise.create({ name: 'Java' })
    expertise3 = await Expertise.create({ name: 'Python' })
    freelance=(await Freelance.create({...FREELANCE_DATA, main_job: job, work_sector: [sector]}))
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

    customer=await Customer.create({...CUSTOMER_DATA})

    announce=await Announce.create({
      user:customer._id, 
      title:'dev',
      experience: Object.keys(EXPERIENCE)[0], 
      duration: 2,
      duration_unit: DURATION_MONTH,
      budget: '6969669',
      mobility_days_per_month : 2,
      mobility: MOBILITY_NONE,
      city: rouen,
      sectors: [sector._id],
      expertises: [expertise1._id, expertise2._id, expertise3._id],
      pinned_expertises: [expertise1._id, expertise2._id, expertise3._id],
      softwares: [software._id],
      languages: [language._id],
    })

    application = await Application.create({
      announce: announce._id,
      customer: customer._id,
      freelance: freelance._id,
    })

    mission = await Mission.create({
      application: application._id,
      customer: customer._id,
      freelance:freelance._id,
      title:'dev',
      start_date: new Date(),
      end_date: new Date('2025-06-06'),
    })

    evaluation = await Evaluation.create({
      customer: customer._id,
      freelance: freelance._id,
      mission: mission._id,
      creation_date: new Date()
    })
  })
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must get evaluations', async()=>{
  })
})