const moment=require('moment')
const customCron = require("../../utils/cron");
const { AVAILABILITY_CHECK_PERIODS, AVAILABILITY_UNDEFINED, ROLE_FREELANCE, ROLE_ADMIN } = require("./consts");
const { sendRemidner2Freelance, sendInterestReminder2Freelance, sendNewSignUps2Admin } = require("./mailing");
const CustomerFreelance = require('../../models/CustomerFreelance')

// Freelance whose availability date hasn't been changed for the past 45 days
const checkFreelanceInterest = async () => {
  try {
    const startOfDay45DaysAgo = moment().subtract(45, 'days').startOf('day').toDate()
    const endOfDay45DaysAgo = moment().subtract(45, 'days').endOf('day').toDate()
    
    const freelances = await CustomerFreelance.find({
      role: ROLE_FREELANCE,
      availability_last_update: {
        $gte: startOfDay45DaysAgo,
        $lte: endOfDay45DaysAgo
      }
    })
    
    if (freelances.length > 0) {
      const notificationPromises = freelances.map(async (freelance) => {
        try {
          await sendInterestReminder2Freelance(freelance)
          console.log(`Notification sent to ${freelance.email}`)
        } catch (error) {
          console.error(`Failed to send notification to ${freelance.email}: `, error)
        }
      })

      await Promise.allSettled(notificationPromises)
    }

    console.log('Check freelance interest process completed.')
  } catch (err) {
    console.error('Error in check freelance interest process:', err)
  }
}

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

//Send email if new sign-ups today

const checkNewSignUps = async () => {
  const today = moment().startOf('day').toDate()
  const newUsersCount = await CustomerFreelance.countDocuments({
    role: ROLE_FREELANCE,
    creation_date: { $gte: today }
  })
  console.log(newUsersCount)
  if(newUsersCount > 0) {
    const admins = await CustomerFreelance.find({role:ROLE_ADMIN})
    admins.forEach(async(a) => await sendNewSignUps2Admin(a,newUsersCount))
  }
}
customCron.schedule('0 17 * * * *', checkNewSignUps)

module.exports={
  availabilityPeriodUpdate, checkFreelanceInterest, checkNewSignUps
}