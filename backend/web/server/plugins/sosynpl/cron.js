const moment=require('moment')
const customCron = require("../../utils/cron");
const { AVAILABILITY_CHECK_PERIODS, AVAILABILITY_UNDEFINED } = require("./consts");
const { checkFreelanceInterest, sendRemidner2Freelance } = require("./mailing");
const CustomerFreelance = require('../../models/CustomerFreelance')

// Freelance whose availability date hasn't been changed for the past 45 days
customCron.schedule('0 9 * * * *', checkFreelanceInterest)

// Freelance availability update
const updateAvailability = async () => {
  return CustomerFreelance.updateMany(
    { availability_last_update: { $lt: moment().subtract(8, 'days').startOf('day').toDate() } },
    { $set: { availability: AVAILABILITY_UNDEFINED } }
  )
}
customCron.schedule('0 0 * * * *', updateAvailability)

// Freelance availability update reminder
const availabilityPeriodUpdate = async () => {
  const dateFilter = (x) => {
    const startOfDay = moment().subtract(x, 'days').startOf('day').toDate()
    const endOfDay = moment().subtract(x, 'days').endOf('day').toDate()
    return {
      availability_last_update: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }
  }

  let freelances = []

  const findPromises = AVAILABILITY_CHECK_PERIODS.map(day => CustomerFreelance.find({...dateFilter(day)}))

  const results = await Promise.allSettled(findPromises)

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      freelances = [...freelances, ...result.value]
    } else {
      console.error('Error fetching freelances for a period:', result.reason)
    }
  })

  const reminderPromises = freelances.map(f => sendRemidner2Freelance(f))

  const reminderResults = await Promise.allSettled(reminderPromises)

  reminderResults.forEach(result => {
    if (result.status === 'rejected') {
      console.error('Error sending reminder to freelance:', result.reason)
    }
  })
}

customCron.schedule('0 9 * * * *', availabilityPeriodUpdate)

module.exports={
  availabilityPeriodUpdate,
}