const {
  sendNotification,
  setNotificationsContents,
  setSmsContents,
  setSmsContact,
  getTagUrl,
  addValidationAllowedDomain
} = require('../../utils/mailing')
const moment=require('moment')
const { computeUrl } = require('../../../config/config')
const CustomerFreelance = require('../../../server/models/CustomerFreelance')
const { loadFromDb } = require('../../utils/database')
const { ROLE_FREELANCE, AVAILABILITY_UNDEFINED } = require('./consts')

const SIB_IDS={
  CUSTOMER_CONFIRM_EMAIL:1,
  FREELANCE_CONFIRM_EMAIL:2,
  FREELANCE_SEND_SUGGESTION: 31,
  CUSTOMER_SEND_APPLICATION: 39,
  USER_SEND_SUSPENSION: 23,
  FREELANCE_INTEREST_REMINDER: 25,
  FREELANCE_AVAILABILITY_REMINDER: 15,
  ADMIN_NEW_SIGNUPS_NOTIF: 24,
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
const sendInterestReminder2Freelance = async (freelance) => {
  const url = `${await getTagUrl('SUPPLIER_DASHBOARD')}?id=${freelance._id}`
  return sendNotification({
    notification: SIB_IDS.FREELANCE_INTEREST_REMINDER,
    destinee: freelance,
    params: {
      firstname: freelance.firstname,
      update_profile_url: url,
    }
  })
  }

// Send reminder after 8, 15, 30, 60 days
const sendRemidner2Freelance = async (freelance) => {
  const url=`${await getTagUrl('SUPPLIER_DASHBOARD')}?id=${freelance._id}`
  return sendNotification({
    notification: SIB_IDS.FREELANCE_AVAILABILITY_REMINDER,
    destinee: freelance,
    params: {
      firstname: freelance.firstname,
      update_profile_url: url,
    }
  })
}

//Send mail if new sign-ups today
const sendNewSignUps2Admin = async (admin,nbnewuser) => {
  const tagUrl = await getTagUrl('LOGIN')
  const login=`${computeUrl(tagUrl)}`
  console.log(login)
  return sendNotification({
    notification: SIB_IDS.ADMIN_NEW_SIGNUPS_NOTIF,
    destinee: admin,
    params: {
      firstname: admin.firstname,
      nbnewuser: nbnewuser,
      login: login,
    }
  })
}
module.exports = {
  sendCustomerConfirmEmail, sendFreelanceConfirmEmail, sendSuggestion2Freelance, sendApplication2Customer, sendSuspension2User, sendInterestReminder2Freelance,
  sendRemidner2Freelance, sendNewSignUps2Admin
}
