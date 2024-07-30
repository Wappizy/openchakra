const {
  sendNotification,
  setNotificationsContents,
  setSmsContents,
  setSmsContact,
  getTagUrl,
  addValidationAllowedDomain
} = require('../../utils/mailing')
const {datetime_str} = require('../../../utils/dateutils')
const moment=require('moment')
const { formatDate, formatHour } = require('../../../utils/text')
const { generateIcs } = require('../../../utils/ics')
const { computeUrl } = require('../../../config/config')
const CustomerFreelance = require('../../../server/models/CustomerFreelance')
const { loadFromDb } = require('../../utils/database')
const cron = require('../../utils/cron')

const SIB_IDS={
  CUSTOMER_CONFIRM_EMAIL:1,
  FREELANCE_CONFIRM_EMAIL:2,
  FREELANCE_SEND_SUGGESTION: 31,
  CUSTOMER_SEND_APPLICATION: 39,
  USER_SEND_SUSPENSION: 23,
  FREELANCE_INTEREST_REMINDER: 25,
}

const SMS_CONTENTS={
}

setSmsContents(SMS_CONTENTS)

const NOTIFICATIONS_CONTENTS={
}

setNotificationsContents(NOTIFICATIONS_CONTENTS)

setSmsContact('SoSynpL')

addValidationAllowedDomain('sosynpl.com')

const sendCustomerConfirmEmail = async ({user}) => {
  const tagUrl=await getTagUrl('EMAIL_VALIDATION')
  const email_validation_url=`${computeUrl(tagUrl)}?id=${user._id}`
  return sendNotification({
    notification: SIB_IDS.CUSTOMER_CONFIRM_EMAIL,
    destinee: user,
    params: {
      firstname: user.firstname,
      email_validation_url,
    },
  })
}

const sendFreelanceConfirmEmail = async ({user}) => {
  const tagUrl=await getTagUrl('EMAIL_VALIDATION')
  const email_validation_url=`${computeUrl(tagUrl)}?id=${user._id}`
  return sendNotification({
    notification: SIB_IDS.FREELANCE_CONFIRM_EMAIL,
    destinee: user,
    params: {
      firstname: user.firstname,
      email_validation_url,
    },
  })
}

// Send suggestion of 'announce'to 'user'
const sendSuggestion2Freelance = async ({user, announce}) => {
  const announceUrl=`${await getTagUrl('ANNOUNCE')}?id=${announce._id}`
  return sendNotification({
    notification: SIB_IDS.FREELANCE_SEND_SUGGESTION,
    destinee: user,
    params: {
      firstname: user.firstname,
      title: announce.title,
      url: announceUrl,
    },
  })
}

// Send suggestion of 'announce'to 'user'
const sendApplication2Customer = async ({freelance, announce, customer}) => {
  return sendNotification({
    notification: SIB_IDS.CUSTOMER_SEND_APPLICATION,
    destinee: customer,
    params: {
      firstname: freelance.firstname,
      annonce_name: announce.title,
    },
  })
}

// Send application confirmation
const sendSuspension2User = async ({value}) => {
  const [user] = await loadFromDb({model:'customerFreelance', id:value, fields:['firstname','email','suspended_reason']})
  return sendNotification({
    notification: SIB_IDS.USER_SEND_SUSPENSION,
    destinee: user,
    params: {
      firstname: user.firstname,
      motifsuspension: user.suspended_reason,
    }
  })
}

// Send reminder if still interested in SoSynpl
const checkFreelanceInterest = async() => {
  const startOfDay45DaysAgo = moment().subtract(45, 'days').startOf('day').toDate()
  const endOfDay45DaysAgo = moment().subtract(45, 'days').endOf('day').toDate()
  
  const freelances = await CustomerFreelance.find({
    availability_last_update: {
      $gte: startOfDay45DaysAgo,
      $lte: endOfDay45DaysAgo
    }
  })
  if(freelances) {
    const notificationPromises = freelances.map(async (freelance) => {
      try {
        const url=`${await getTagUrl('SUPPLIER_DASHBOARD')}?id=${freelance._id}`
        await sendNotification({
          notification: SIB_IDS.FREELANCE_INTEREST_REMINDER,
          destinee: freelance,
          params: {
            firstname: freelance.firstname,
            update_profile_url: url,
          }
        })
      } catch (error) {
        console.error(`Failed to send notification to ${freelance.email}: `, error);
        throw error
      }
    })

    const results = await Promise.allSettled(notificationPromises)

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Notification sent to ${freelances[index].email}`)
      } else {
        console.error(`Failed to send notification to ${freelances[index].email}: `, result.reason)
      }
    })
  }
}

module.exports = {
  sendCustomerConfirmEmail, sendFreelanceConfirmEmail, sendSuggestion2Freelance, sendApplication2Customer, sendSuspension2User, checkFreelanceInterest
}
