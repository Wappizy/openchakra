const mongoose = require('mongoose')
const { computeStatistics } = require('../../server/plugins/smartdiet/functions')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const moment = require('moment')
const { ROLE_SUPER_ADMIN, ROLE_EXTERNAL_DIET, ROLE_ADMIN } = require('../../server/plugins/smartdiet/consts')
const Appointment = require('../../server/models/Appointment')

jest.setTimeout(30000000)

beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('Statistics', () => {
  const start_date = new Date('2020-01-05T13:00:00.000Z')
  const end_date = new Date('2021-01-05T13:00:00.000Z')
  const id = '65f2f95bd449f912a30afe74'
  const diet = '65f2faa6234cec144a11fb3f'

  const fields = {
    number: [
      'coachings_started',
      // 'coachings_ongoing',
      // 'coachings_stopped',
      // 'coachings_dropped',
      // 'coachings_finished',
      // 'coachings_renewed',
      // 'nut_advices',
      // 'ratio_dropped_started',
      // 'ratio_stopped_started',
      // 'ratio_appointments_coaching',
      // 'coachings_gender_female',
      // 'coachings_gender_male',
      // 'coachings_gender_non_binary',
      // 'coachings_gender_unknown',
      // 'jobs_total',
      // 'join_reasons_total',
      // 'decline_reasons_total',
      // 'webinars_by_company_total',
    ],
    complex: [
      // 'coachings_stats',
      // 'jobs_details',
      // 'join_reasons_details',
      // 'decline_reasons_details',
      // 'webinars_by_company_details'
    ]
  }

  const allFields = [...fields.number, ...fields.complex]

  const combinations = [
    { label: 'no params', filters: {} },
    { label: 'diet', filters: { diet: diet } },
    { label: 'start_date', filters: { start_date: start_date } },
    { label: 'end_date', filters: { end_date: end_date } },
    { label: 'company', filters: { company: id } },
    { label: 'all but company', filters: { diet: diet, start_date: start_date, end_date: end_date } },
    { label: 'all', filters: { company: id, start_date: start_date, end_date: end_date, diet: diet } },
  ]

  const computeMeanDuration = (measures) => {
    const grouped = measures.reduce((acc, { label, duration }) => {
      if (!acc[label]) acc[label] = []
      acc[label].push(duration)
      return acc
    }, {})

    return Object.keys(grouped).map(label => {
      const durations = grouped[label]
      const mean = durations.reduce((sum, value) => sum + value, 0) / durations.length
      return { label, mean }
    })
  }

  const runTestsForFields = async (fieldsToTest, iterations = 1) => {
    let allMeasures = []

    const measure = (label, duration) => {
      allMeasures.push({ label, duration })
    }

    const runTest = async () => {
      for (const combination of combinations) {
        console.log('*****************************************', combination, '**************************************')
        let now = moment()
        for (const field of fieldsToTest) {
          const noww = moment()
          const stats = await computeStatistics({ fields: [field], ...combination.filters })
          measure(combination.label + ' ' + field, moment().diff(noww, 'milliseconds'))
          try {
            if (fields.number.includes(field)) {
              expect(stats[field]).toBeGreaterThanOrEqual(0)
            } else {
              expect(stats[field]).toBeTruthy()
            }
          } catch (error) {
            console.error(error)
          }
        }
        measure(combination.label, moment().diff(now, 'milliseconds'))
      }
      return allMeasures
    }

    for (let i = 0; i < iterations; i++) {
      const measures = await runTest()
      allMeasures = allMeasures.concat(measures)
    }

    return allMeasures
  }

  it('must calculate all fields and their perfs', async () => {
    const allMeasures = await runTestsForFields(allFields, 1)
    const meanDurations = computeMeanDuration(allMeasures)
    console.table(meanDurations)
  })

  it.only('must count started coachings', async () => {
    console.time('Counting started coachings')
    const apptMatch={
      order: 1,
    }
    apptMatch['user.company']=mongoose.Types.ObjectId('65f2f95bd449f912a30afe74')
    apptMatch['diet']=mongoose.Types.ObjectId('651a9d3e1a7bd51b71a40327')
    const appts=await Appointment.aggregate([
  // Lookup to join appointments with users
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user'
    }
  },
  
  // Unwind the user array
  { $unwind: '$user' },
  
  // // Match appointments with the specified criteria
  {
    $match: apptMatch,
  },
  
  // Group by coaching ID to count distinct coachings
  {
    $group: {
      _id: '$coaching',
      count: { $sum: 1 }
    }
  },
  
  // Count the number of distinct coachings
  {
    $count: 'totalCoachings'
  }
])
  console.timeEnd('Counting started coachings')
console.log('result', appts)
})
})
