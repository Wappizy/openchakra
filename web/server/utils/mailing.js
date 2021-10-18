const {
  ENABLE_MAILING,
  computeUrl,
  getSibTemplates,
  get_host_url,
  is_validation,
} = require('../../config/config')
const {SIB} = require('./sendInBlue')
const {booking_datetime_str} = require('../../utils/dateutils')
const {fillSms} = require('../../utils/sms')

// Templates
const SIB_IDS=require(getSibTemplates()=='my-alfred' ? './sib_templates/my-alfred.js':'./sib_templates/all-inclusive.js')

/**
 21  VERS ALFRED == N'oubliez pas de mettre à jour vos disponibilités 🗓
 */

const SMS_CONTENTS = {
  [SIB_IDS.NEW_BOOKING_MANUAL]: '{{ params.client_firstname }} a effectué une demande de réservation de votre service {{ params.service_label }}',
  [SIB_IDS.CONFIRM_PHONE]: 'Pour valider votre numéro de téléphone portable, merci de saisir le code d\'activation suivant : {{ params.sms_code }}',
  [SIB_IDS.ASKING_INFO]: '{{ params.client_firstname }} a effectué une demande d\'information pour votre service {{ params.service_label }}',
  [SIB_IDS.BOOKING_CANCELLED_BY_CLIENT]: 'Malheureusement, {{ params.client_firstname }} a annulé la réservation de votre service {{ params.service_label }}',
  [SIB_IDS.TRANSFER_TO_ALFRED]: 'Un versement de {{ params.total_revenue }} a été effectué pour votre service {{ params.service_label }}',
  [SIB_IDS.BOOKING_CANCELLED_BY_ALFRED]: 'Malheureusement, {{ params.alfred_firstname }} a annulé votre réservation du service {{ params.service_label }}',
  [SIB_IDS.ASKINFO_PREAPPROVED]: '{{ params.alfred_firstname }} a pré approuvé la réservation de votre service {{ params.service_label }}',
  [SIB_IDS.BOOKING_REFUSED_2_CLIENT]: 'Malheureusement, {{ params.alfred_firstname }} a refusé votre réservation du service {{ params.service_label }}',
  [SIB_IDS.BOOKING_CONFIRMED]: '{{ params.alfred_firstname }} a confirmé votre réservation de son service {{ params.service_label }}',
  [SIB_IDS.NEW_BOOKING]: '{{ params.client_firstname }} a réservé votre service {{ params.service_label }}',
  [SIB_IDS.BOOKING_EXPIRED_2_CLIENT]: 'Votre réservation du service {{ params.service_label }} par {{ params.alfred_firstname }} est expirée',
  [SIB_IDS.BOOKING_EXPIRED_2_ALFRED]: 'La réservation de votre service {{ params.service_label }} par {{ params.client_firstname }} est expirée',
}

const sendNotification = (notif_index, destinee, params) => {
  const msg = `Sending notif ${notif_index} to ${destinee._id} using ${JSON.stringify(params)}`

  let enable_mails = ENABLE_MAILING
  // En validation, envoyer les notifications et SMS aux membres de @my-alfred.io
  if (!enable_mails && is_validation() && (destinee.email||'').toLowerCase().includes('@my-alfred.io')) {
    console.log('Mailing disabled except for my-alfred.io mails on validation platform')
    enable_mails = true
  }
  let enable_sms = ENABLE_MAILING

  if (!enable_sms && !enable_mails) {
    console.log(`Mailing disabled:${msg}`)
    return true
  }

  let resultMail = true, resultSms = true

  // Send mail
  if (enable_mails && notif_index != SIB_IDS.CONFIRM_PHONE) {
    resultMail = SIB.sendMail(notif_index, destinee.email, params)
  }

  // Send SMS
  if (enable_sms && destinee.phone && SMS_CONTENTS[notif_index.toString()]) {
    console.log('Sending SMS')
    const smsContents = fillSms(SMS_CONTENTS[notif_index.toString()], params)
    console.log(`SMS contents is ${ smsContents}`)
    if (!smsContents) {
      console.error(`Error creating SMS ${notif_index} to ${destinee.phone} with params ${JSON.stringify(params)}`)
      result = false
    }
    else {
      console.log('Calling SIB.sendSms')
      resultSms = SIB.sendSms(destinee.phone, smsContents)
    }
  }
  return resultMail && resultSms
}

const sendVerificationMail = (user, req) => {
  sendNotification(
    SIB_IDS.CONFIRM_EMAIL,
    user,
    {
      link_confirmemail: new URL(`/validateAccount?user=${user._id}`, computeUrl(req)),
      user_firstname: user.firstname,
    },
  )
  return true
}

const sendVerificationSMS = user => {
  sendNotification(
    SIB_IDS.CONFIRM_PHONE,
    user,
    {
      sms_code: user.sms_code,
    },
  )
  return true
}

const sendShopDeleted = user => {
  sendNotification(
    SIB_IDS.SHOP_DELETED,
    user,
    {
      user_firstname: user.firstname,
    },
  )
}

const sendBookingConfirmed = booking => {
  sendNotification(
    SIB_IDS.BOOKING_CONFIRMED,
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      total_cost: parseFloat(booking.amount).toFixed(2),
    },
  )
}

const sendBookingCancelledByAlfred = (booking, req) => {
  sendNotification(
    SIB_IDS.BOOKING_CANCELLED_BY_ALFRED,
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      link_findnewalfred: new URL('/search', computeUrl(req)),

    },
  )
}

const sendBookingCancelledByClient = booking => {
  sendNotification(
    SIB_IDS.BOOKING_CANCELLED_BY_CLIENT,
    booking.alfred,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
    },
  )
}

const sendLeaveCommentForClient = booking => {
  sendNotification(
    SIB_IDS.LEAVE_COMMENT_FOR_CLIENT, // 11
    booking.alfred,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      link_reviewsclient: new URL(`/evaluateClient?booking=${booking._id}&id=${booking.serviceUserId}&client=${booking.user._id}`, get_host_url()),
    },
  )
}

const sendLeaveCommentForAlfred = booking => {
  sendNotification(
    SIB_IDS.LEAVE_COMMENT_FOR_ALFRED, // 12
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      link_reviewsalfred: new URL(`/evaluate?booking=${booking._id}&id=${booking.serviceUserId}`, get_host_url()),
    },
  )
}

const sendResetPassword = (user, token, req) => {
  sendNotification(
    SIB_IDS.RESET_PASSWORD,
    user,
    {
      user_firstname: user.firstname,
      link_initiatenewpassword: new URL(`/resetPassword?token=${token}`, computeUrl(req)),
    },
  )
}

const sendBookingExpiredToAlfred = booking => {
  sendNotification(
    SIB_IDS.BOOKING_EXPIRED_2_ALFRED,
    booking.alfred,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
    },
  )
}

const sendBookingExpiredToClient = booking => {
  sendNotification(
    SIB_IDS.BOOKING_EXPIRED_2_CLIENT,
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      link_booknewalfred: new URL('/search', get_host_url()),
    },
  )
}

const sendBookingDetails = booking => {
  sendNotification(
    SIB_IDS.BOOKING_DETAILS,
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      total_cost: parseFloat(booking.amount).toFixed(2),
    },
  )
}

const sendBookingInfosRecap = booking => {
  sendNotification(
    SIB_IDS.BOOKING_INFOS_RECAP,
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      total_cost: parseFloat(booking.amount).toFixed(2),
      link_requestinformation: new URL(`/reservations/reservations?id=${booking._id}`, computeUrl(req)),
    },
  )
}

const sendNewBooking = (booking, req) => {
  sendNotification(
    SIB_IDS.NEW_BOOKING,
    booking.alfred,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      total_revenue: parseFloat(booking.amount - booking.fees).toFixed(2),
      link_showreservation: new URL(`/reservations/reservations?id=${booking._id}`, computeUrl(req)),

    },
  )
}

const sendShopOnline = (alfred, req) => {
  sendNotification(
    SIB_IDS.SHOP_ONLINE,
    alfred,
    {
      alfred_firstname: alfred.firstname,
      link_manageshop: new URL(`/profile/services?user=${alfred._id}`, computeUrl(req)),
    },
  )
}

const sendBookingRefusedToClient = (booking, req) => {
  sendNotification(
    SIB_IDS.BOOKING_REFUSED_2_CLIENT,
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      link_booknewalfred: new URL('/search', computeUrl(req)),
    },
  )
}

const sendBookingRefusedToAlfred = booking => {
  sendNotification(
    SIB_IDS.BOOKING_REFUSED_2_ALFRED,
    booking.alfred,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
    },
  )
}

const sendAskingInfo = (booking, req) => {
  sendNotification(
    SIB_IDS.ASKING_INFO,
    booking.alfred,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      total_revenue: parseFloat(booking.amount - booking.fees).toFixed(2),
      link_requestinformation: new URL(`/reservations/reservations?id=${booking._id}`, computeUrl(req)),
    },
  )
}

const sendNewMessageToAlfred = (booking, chatroom_id, req) => {
  sendNotification(
    SIB_IDS.NEW_MESSAGE_ALFRED,
    booking.alfred,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      link_showclientmessage: new URL(`/profile/messages?user=${booking.alfred._id}&relative=${booking.user._id}`, computeUrl(req)),
    },
  )
}

const sendNewMessageToClient = (booking, chatroom_id, req) => {
  sendNotification(
    SIB_IDS.NEW_MESSAGE_CLIENT,
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      link_showalfredmessage: new URL(`/profile/messages?user=${booking.user._id}&relative=${booking.alfred._id}`, computeUrl(req)),
    },
  )
}

const sendAskInfoPreapproved = (booking, req) => {
  sendNotification(
    SIB_IDS.ASKINFO_PREAPPROVED,
    booking.user,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      link_confirmbooking: new URL(`/reservations/reservations?id=${booking._id}`, computeUrl(req)),
    },
  )
}

const sendNewBookingManual = (booking, req) => {
  sendNotification(
    SIB_IDS.NEW_BOOKING_MANUAL,
    booking.alfred,
    {
      client_firstname: booking.user.firstname,
      alfred_firstname: booking.alfred.firstname,
      service_label: booking.service,
      service_datetime: booking_datetime_str(booking),
      total_revenue: parseFloat(booking.amount - booking.fees).toFixed(2),
      link_confirmbooking: new URL(`/reservations/reservations?id=${booking._id}`, computeUrl(req)),
    },
  )
}

const sendAlert = (user, subject, message) => {
  sendNotification(
    SIB_IDS.ALERT,
    user,
    {
      alert_subject: subject,
      alert_message: message,
      user_firstname: user.firstname,
    },
  )
}

const sendB2BAccount = (user, email, role, company, token, req) => {
  sendNotification(
    SIB_IDS.B2B_ACCOUNT_CREATED,
    user,
    {
      user_firstname: user.firstname,
      role: role,
      company: company,
      user_email: email,
      link_initiatenewpassword: new URL(`/resetPassword?token=${token}`, computeUrl(req)),
    },
  )
}

const sendB2BRegistration = (user, email, role, company, req) => {
  sendNotification(
    SIB_IDS.B2B_ACCOUNT_CREATED,
    user,
    {
      user_firstname: user.firstname,
      role: role,
      company: company,
      user_email: email,
      link_initiatenewpassword: new URL(`?register=${user._id}`, computeUrl(req)),
    },
  )
}

module.exports = {
  sendVerificationMail,
  sendShopDeleted,
  sendBookingConfirmed,
  sendBookingCancelledByAlfred,
  sendBookingCancelledByClient,
  sendBookingExpiredToAlfred,
  sendBookingExpiredToClient,
  sendBookingDetails,
  sendBookingInfosRecap,
  sendNewBooking,
  sendShopOnline,
  sendBookingRefusedToClient,
  sendAskingInfo,
  sendNewMessageToAlfred,
  sendNewMessageToClient,
  sendAskInfoPreapproved,
  sendResetPassword,
  sendNewBookingManual,
  sendVerificationSMS,
  sendLeaveCommentForClient,
  sendLeaveCommentForAlfred,
  sendB2BAccount,
  sendAlert,
  sendB2BRegistration,
  sendBookingRefusedToAlfred,
}
