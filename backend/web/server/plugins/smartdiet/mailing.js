const {
  sendNotification,
  setNotificationsContents,
  setSmsContents
} = require('../../utils/mailing')
const {datetime_str} = require('../../../utils/dateutils')

const SIB_IDS={
  // Firebase notifications
  INACTIVITY_15_DAYS:1,
  INACTIVITY_30_DAYS:2,
  INACTIVITY_45_DAYS:3,
  IND_CHALLENGE_1_DAY:4,
  IND_CHALLENGE_2_DAY:5,
  IND_CHALLENGE_3_DAY:6,
  IND_CHALLENGE_5_DAY:7,
  IND_CHALLENGE_6_DAY:8,
  TARGET_NEW_CONTENT:9,
  DEFAULT_NEW_CONTENT:10,
  NEW_WEBINAR:11,
  WEBINAR_3_DAYS_BEFORE:12,
  NEW_GROUP:13,
  SATURDAY_1:14,
  SATURDAY_2:15,
  SATURDAY_3:16,
  SATURDAY_4:17,
  NEW_MESSAGE:18,
  // CUSTOMERS
  FORGOT_PASSWORD: 4995801, // OK
  LEAD_ONBOARDING: 4982108,
  /**
  SATISFY_SURVEY: 4996126,
  CONSULTATION_BOUGHT_OK: 4830569,
  CONSULTATION_BOUGHT_ERROR: 4830717,
  BASKET_CANCELED: 4995332,
  COLL_CHALLENGE_DONE: 5002734,
  COACHING_END: 5013370, // J+2 after last coaching appointment
  UNUSED_COACHING_CREDIT: 5013424, // 1 month after last appt if credit>0
  MEASURES_REMAINER: 5010216,
  */
  // DIETS
  DIET_PREREGISTER_2_DIET: 4852839,
  DIET_PREREGISTER_2_ADMIN: 5034812,
  /**
  DIET_VALIDATED_2_DIET: 5027161,
  DIET_NOT_VALIDATED_TO_DIET: 5033315,
  DIET_ACTIVATED_2_DIET:5033406,
  DIET_SELECT_2_DIET: 5034852,
  APPOINTMENT_CHANGED_2_DIET: 5034955,
  APPOINTMENT_CANCELLED_2_DIET: 5034997,
  APPOINTEMNT_REMINDER_2_DIET: 5035052, // reminds at 7PM the day before
  DIET_ACTIVATED_2_DIET: 5035013, // 1 week after activated
  */
}

const NOTIFICATIONS_CONTENTS={
  [SIB_IDS.INACTIVITY_15_DAYS]:{title: 'Smartdiet', message: `En panne d'idée ? Et si veniez prendre de l'inspiration pour vos prochains repas dans nos Top recettes`},
  [SIB_IDS.INACTIVITY_30_DAYS]:{title: 'Smartdiet', message: `Qu'est-ce qu'on mange ce soir ? Si vous cherchez de l'inspiration, on a des idées pour vous`},
  [SIB_IDS.INACTIVITY_45_DAYS]:{title: 'Smartdiet', message: `"Marre de manger toujours la même chose ? Venez chercher le bonheur de vos assiettes dans nos recettes"`},
  [SIB_IDS.IND_CHALLENGE_1_DAY]:{title: 'Smartdiet', message: `Pendant la durée du challenge, on reste près de vous et on vous enverra 1 notification par jour pour vous aider à garder la motivation.`},
  [SIB_IDS.IND_CHALLENGE_2_DAY]:{title: 'Smartdiet', message: `On est dans les starting-blocks pour relever le challenge ! 👌`},
  [SIB_IDS.IND_CHALLENGE_3_DAY]:{title: 'Smartdiet', message: `Alors, avez-vous réussi à relever le challenge hier ? Même si ce n'est pas le cas, on continue aujourd'hui 🙌`},
  [SIB_IDS.IND_CHALLENGE_5_DAY]:{title: 'Smartdiet', message: `On reste motivé, c'est la veille du dernier jour 🤙`},
  [SIB_IDS.IND_CHALLENGE_6_DAY]:{title: 'Smartdiet', message: `Allez, on ne fléchit pas, c'est le dernier jour pour relever le challenge 💪`},
  [SIB_IDS.TARGET_NEW_CONTENT]:{title: 'Smartdiet', message: `Un nouveau contenu vous concernant a été ajouté, regardez, c'est par ici 😉`},
  [SIB_IDS.DEFAULT_NEW_CONTENT]:{title: 'Smartdiet', message: `On ne s'arrête pas de vous créer des contenus, rendez-vous sur l'application pour les consulter 👌`},
  [SIB_IDS.NEW_WEBINAR]:{title: 'Smartdiet', message: `Le webinaire {{params.title}} a été programmé {{params.datetime}}, inscrivez-vous pour ne pas le rater 🎥`},
  [SIB_IDS.WEBINAR_3_DAYS_BEFORE]:{title: 'Smartdiet', message: `Rendez-vous sur le lien d'inscription pour participer au nouveau webinaire {{params.title}} {{params.datetime}} 📹`},
  [SIB_IDS.NEW_GROUP]:{title: 'Smartdiet', message: `Pour garder la motivation, rejoignez un groupe de discussion et échangez avec des diététicien(ne) et des personnes ayant le même centre d'intérêt que vous.`},
  [SIB_IDS.SATURDAY_1]:{title: 'Smartdiet', message: `Un nouveau menu vous attend`},
  [SIB_IDS.SATURDAY_2]:{title: 'Smartdiet', message: `Et une nouvelle semaine de menu, une !`},
  [SIB_IDS.SATURDAY_3]:{title: 'Smartdiet', message: `Vous l'attendiez ? Le voilà, le nouveau menu de la semaine`},
  [SIB_IDS.SATURDAY_4]:{title: 'Smartdiet', message: `Rendez-vous sur votre application pour retrouver votre nouveau menu de la semaine`},
  [SIB_IDS.NEW_MESSAGE]:{title: 'Smartdiet', message: `Vous avez reçu un nouveau message !`},
}

setNotificationsContents(NOTIFICATIONS_CONTENTS)

const sendForgotPassword = ({user, password}) => {
  return sendNotification({
    notification: SIB_IDS.FORGOT_PASSWORD,
    destinee: user,
    params: {
      FIRSTNAME: user.firstname,
      PASSWORD: password,
    },
  })
}

const sendDietPreRegister2Diet = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.DIET_PREREGISTER_2_DIET,
    destinee: user,
    params: {
      FIRSTNAME: user.firstname,
    },
  })
}

const sendDietPreRegister2Admin = ({user, admin}) => {
  return sendNotification({
    notification: SIB_IDS.DIET_PREREGISTER_2_ADMIN,
    destinee: admin,
    params: {
      FIRSTNAME: user.firstname,
      LASTNAME: user.lastname,
    },
  })
}

const sendLeadOnboarding = ({lead}) => {
  return sendNotification({
    notification: SIB_IDS.LEAD_ONBOARDING,
    destinee: lead,
    params: {
      FIRSTNAME: lead.firstname,
      CODEENTREPRISE: lead.company_code,
    },
  })
}

const sendInactivity15 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.INACTIVITY_15_DAYS,
    destinee: user,
    params: {},
  })
}

const sendInactivity30 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.INACTIVITY_30_DAYS,
    destinee: user,
    params: {},
  })
}

const sendInactivity45 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.INACTIVITY_45_DAYS,
    destinee: user,
    params: {},
  })
}

const sendIndChallenge1 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.IND_CHALLENGE_1_DAY,
    destinee: user,
    params: {},
  })
}

const sendIndChallenge2 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.IND_CHALLENGE_2_DAY,
    destinee: user,
    params: {},
  })
}

const sendIndChallenge3 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.IND_CHALLENGE_3_DAY,
    destinee: user,
    params: {},
  })
}
const sendIndChallenge5 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.IND_CHALLENGE_5_DAY,
    destinee: user,
    params: {},
  })
}

const sendIndChallenge6 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.IND_CHALLENGE_6_DAY,
    destinee: user,
    params: {},
  })
}

const sendNewWebinar = ({user, title, datetime}) => {
  return sendNotification({
    notification: SIB_IDS.NEW_WEBINAR,
    destinee: user,
    params: {title, datetime},
  })
}

const sendWebinarIn3Days = ({user, title, datetime}) => {
  return sendNotification({
    notification: SIB_IDS.WEBINAR_3_DAYS_BEFORE,
    destinee: user,
    params: {title, datetime},
  })
}

const sendSaturday1 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.SATURDAY_1,
    destinee: user,
    params: {},
  })
}

const sendSaturday2 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.SATURDAY_2,
    destinee: user,
    params: {},
  })
}

const sendSaturday3 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.SATURDAY_3,
    destinee: user,
    params: {},
  })
}

const sendSaturday4 = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.SATURDAY_4,
    destinee: user,
    params: {},
  })
}

const sendNewMessage = ({user}) => {
  return sendNotification({
    notification: SIB_IDS.NEW_MESSAGE,
    destinee: user,
    params: {},
  })
}

module.exports = {
  sendForgotPassword,
  sendDietPreRegister2Diet,
  sendDietPreRegister2Admin,
  sendLeadOnboarding,
  sendInactivity15, sendInactivity30, sendInactivity45,
  sendIndChallenge1, sendIndChallenge2, sendIndChallenge3, sendIndChallenge5,
  sendIndChallenge6,
  sendNewWebinar, sendWebinarIn3Days,
  sendSaturday1, sendSaturday2, sendSaturday3, sendSaturday4,
  sendNewMessage,
}
