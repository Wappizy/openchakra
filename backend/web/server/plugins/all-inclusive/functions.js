const { datetime_str } = require('../../../utils/dateutils')
const {
  sendAskContact,
  sendCommentReceived,
  sendMissionAskedReminder,
  sendMissionAskedSummary,
  sendMissionReminderCustomer,
  sendMissionReminderTI,
  sendNewMission,
  sendProfileOnline,
  sendProfileReminder,
  sendTipiSearch,
  sendUsersExtract
} = require('./mailing')
const {isDevelopment} = require('../../../config/config')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const {
  AVAILABILITY,
  BOOLEAN,
  COACHING,
  COACH_ALLE,
  COMPANY_ACTIVITY,
  COMPANY_SIZE,
  COMPANY_STATUS,
  CONTACT_STATUS,
  CONTRACT_TYPE,
  DEPARTEMENTS,
  EXPERIENCE,
  GENDER,
  MISSING_QUOTATION_DELAY,
  MISSION_FREQUENCY,
  MISSION_REMINDER_DELAY,
  MISSION_STATUS_ASKING,
  MISSION_STATUS_FINISHED,
  MISSION_STATUS_QUOT_ACCEPTED,
  MISSION_STATUS_QUOT_SENT,
  MISSION_STATUS_TI_REFUSED,
  PAYMENT_STATUS,
  PENDING_QUOTATION_DELAY,
  QUOTATION_STATUS,
  ROLES,
  ROLE_ALLE_ADMIN,
  ROLE_ALLE_SUPER_ADMIN,
  ROLE_COMPANY_ADMIN,
  ROLE_COMPANY_BUYER,
  ROLE_TI,
  UNACTIVE_REASON,
} = require('./consts')
const {
  declareComputedField,
  declareEnumField,
  declareVirtualField,
  getModel,
  idEqual,
  loadFromDb,
  setFilterDataUser,
  setPostCreateData,
  setPostPutData,
  setPreCreateData,
  setPreprocessGet,
} = require('../../utils/database')
const Contact = require('../../models/Contact')
const AdminDashboard = require('../../models/AdminDashboard')
const mongoose = require('mongoose')
const cron=require('node-cron')
const { paymentPlugin } = require('../../../config/config')
const { BadRequestError } = require('../../utils/errors')
const moment = require('moment')
const Mission = require('../../models/Mission')
const User = require('../../models/User')
const { CREATED_AT_ATTRIBUTE } = require('../../../utils/consts')
const lodash=require('lodash')
const Message = require('../../models/Message')
const JobUser = require('../../models/JobUser')
const NATIONALITIES = require('./nationalities.json')

const postCreate = ({model, params, data}) => {
  if (model=='mission') {
    return loadFromDb({model: 'mission', id: data._id, fields:['user.full_name','job.user.full_name']})
      .then(([mission]) => {
        if (!!mission.job) {
          sendNewMission(mission)
          sendMissionAskedSummary(mission)
        }
        else {
          User.find({role: {$in: [ROLE_ALLE_ADMIN, ROLE_ALLE_SUPER_ADMIN]}})
            .then(admins => Promise.allSettled(admins.map(admin => sendTipiSearch({admin, mission}))))
        }
    })
  }
  if (model=='contact') {
    const contact=data
    const attachment=contact.document ? {url: contact.document} : null
    // TODO check sendMail return
    User.find({role: {$in: [ROLE_ALLE_ADMIN, ROLE_ALLE_SUPER_ADMIN]}})
      .then(users => Promise.allSettled(users.map(u => sendAskContact({
        user:{email: u.email},
        fields:{...contact.toObject({virtuals: true}), urgent: contact.urgent ? 'Oui':'Non', status: CONTACT_STATUS[contact.status]},
        attachment,
      }))))
  }

  if (model=='comment') {
    loadFromDb({model: 'mission', id: data.mission._id, fields:['user','job.user']})
      .then(([mission]) => sendCommentReceived(mission))
  }

  return Promise.resolve(data)
}

setPostCreateData(postCreate)

const preprocessGet = ({model, fields, id, user}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }

  if (model == 'jobUser') {
    fields = lodash([...fields, 'user.hidden', 'user']).uniq().value()
  }

  if (model=='conversation') {
    const getPartner= (m, user) => {
      return idEqual(m.sender._id, user._id) ? m.receiver : m.sender
    }

    return Message.find({$or: [{sender: user._id}, {receiver: user._id}]})
      .populate({path: 'sender', populate: {path: 'company'}})
      .populate({path: 'receiver', populate: {path: 'company'}})
      .sort({CREATED_AT_ATTRIBUTE: 1})
      .then(messages => {
        if (id) {
          messages=messages.filter(m => idEqual(getPartner(m, user)._id, id))
          // If no messages for one parner, forge it
          if (lodash.isEmpty(messages)) {
            return User.findById(id).populate('company')
              .then(partner => {
                const data=[{_id: partner._id, partner, messages: []}]
                return {model, fields, id, data}
              })
          }
        }
        const partnerMessages=lodash.groupBy(messages, m => getPartner(m, user)._id)
        const convs=lodash(partnerMessages)
          .values()
          .map(msgs => { const partner=getPartner(msgs[0], user); return ({_id: partner._id, partner, messages: msgs}) })
          .sortBy(CREATED_AT_ATTRIBUTE, 'asc')
        return {model, fields, id, data: convs}
      })
  }

  return Promise.resolve({model, fields, id})

}

setPreprocessGet(preprocessGet)

const preCreate = ({model, params, user}) => {
  if (['jobUser', 'request', 'mission', 'comment'].includes(model)) {
    params.user=user
  }
  if (model=='quotation' && 'mission' in params) {
    return Mission.findById(params.mission)
      .populate('user')
      .populate('quotations')
      .then(mission => {
        if (mission.quotations.length>0) {
          throw new BadRequestError(`Un devis est déjà attaché à cette mission`)
        }
        params.name=`Devis du ${moment().format('L')}`
        params.firstname=mission.user.firstname
        params.lastname=mission.user.lastname
        params.email=mission.user.email
        params.company_name=mission.user.company_name
        params.mission=mission._id
        return ({model, params})
      })
  }
  if (model=='quotationDetail' && 'quotation' in params) {
    params.quotation=params.quotation
  }

  if (model=='user' && !params.role) {
    params.role=ROLE_TI
  }

  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postPutData = ({model, id, attribute, data, user}) => {
  if (model=='user') {
    return User.findById(user._id)
      .then(account => {
        if (attribute=='hidden' && value==false) {
          sendProfileOnline(account)
        }
        if (account.role==ROLE_TI) {
          return !isDevelopment() && paymentPlugin.upsertProvider(account)
        }
        if (account.role==ROLE_COMPANY_BUYER) {
          return !isDevelopment() && paymentPlugin.upsertCustomer(account)
        }
      })
  }
  return Promise.resolve(data)
}

setPostPutData(postPutData)


const USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(m => {
  declareVirtualField({model: m, field: 'full_name', instance: 'String', requires: 'firstname,lastname'})
  declareEnumField({model: m, field: 'role', enumValues: ROLES})
  declareVirtualField({model: m, field: 'profile_progress', instance: 'Number', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareEnumField({model: m, field: 'coaching', enumValues: COACHING})
  declareVirtualField({model: m, field: 'password2', instance: 'String'})
  declareEnumField({model: m, field: 'availability', enumValues: AVAILABILITY})
  declareVirtualField({model: m, field: 'quotations', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'quotation'}}
  })
  declareVirtualField({model: m, field: 'jobs', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'jobUser'}}
  })
  declareEnumField({model: m, field: 'nationality', enumValues: NATIONALITIES})
  declareEnumField({model: m, field: 'company_status', enumValues: COMPANY_STATUS})
  declareEnumField({model: m, field: 'company_activity', enumValues: COMPANY_ACTIVITY})
  declareEnumField({model: m, field: 'company_size', enumValues: COMPANY_SIZE})
  declareVirtualField({model: m, field: 'requests', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'request'}}
  })
  declareVirtualField({model: m, field: 'qualified_str', instance: 'String'})
  declareVirtualField({model: m, field: 'visible_str', instance: 'String'})
  declareVirtualField({model: m, field: 'finished_missions_count', instance: 'Number', requires: '_missions'})
  declareVirtualField({model: m, field: '_missions', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'mission'}}
  })
  declareVirtualField({model: m, field: 'missions', instance: 'Array', multiple: true,
    requires: '_missions,_missions.user.full_name,_missions.user.company_name,_missions.job.user.full_name,_missions.quotations,_missions.quotations.details,_missions.comments,missions,missions.user,missions.job,missions.job.user,missions.quotations,missions.comments,\
_missions.comments.mission.job.user.full_name,_missions.comments.mission.user.company_name,_missions.comments.user.picture,_missions.comments.mission.job.user.picture',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'mission'}}
  })
  declareVirtualField({model: m, field: 'missions_with_bill', instance: 'Array', multiple: true,
    requires: '_missions,_missions.user,_missions.job,_missions.job.user,_missions.quotations',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'mission'}}
  })
  declareVirtualField({model: m, field: 'recommandations', instance: 'Array', multiple: true,
    requires: '_all_recommandations.job',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'recommandation'}}
  })
  declareVirtualField({model: m, field: 'recommandations_count', instance: 'Number', requires: 'jobs'})
  declareVirtualField({model: m, field: 'recommandations_note', instance: 'Number', requires: 'jobs'})
  declareVirtualField({model: m, field: 'comments_count', instance: 'Number', requires: 'missions.comments'})
  declareVirtualField({model: m, field: 'comments_note', instance: 'Number', requires: 'jobs'})

  declareVirtualField({model: m, field: 'revenue', instance: 'Number',
    requires: 'role,_missions.quotations.ti_total,_missions.status,missions.quotations.ti_total,missions.status'})
  declareVirtualField({model: m, field: 'revenue_to_come', instance: 'Number',
    requires: 'role,_missions.quotations.ti_total,_missions.status,missions.quotations.ti_total,missions.status'})
  declareVirtualField({model: m, field: 'accepted_quotations_count', instance: 'Number', requires: 'role,_missions.status,missions.status'})
  declareVirtualField({model: m, field: 'pending_quotations_count', instance: 'Number', requires: 'role,_missions.status,missions.status'})
  declareVirtualField({model: m, field: 'pending_bills_count', instance: 'Number', requires: 'role,_missions.status,missions.status'})
  declareVirtualField({model: m, field: 'spent', instance: 'Number',
    requires: 'role,_missions.quotations.customer_total,_missions.status,missions.quotations.customer_total,missions.status'})
  declareVirtualField({model: m, field: 'spent_to_come', instance: 'Number',
    requires: 'role,_missions.quotations.customer_total,_missions.status,missions.quotations.customer_total,missions.status'})
  declareVirtualField({model: m, field: 'pending_bills', instance: 'Number',
    requires: 'role,_missions.status,_missions.quotations.customer_total,missions.status,missions.quotations.customer_total'})

  declareVirtualField({model: m, field: 'profile_shares_count', instance: 'Number', requires: ''})
  declareEnumField({model: m, field: 'unactive_reason', enumValues: UNACTIVE_REASON})
  declareVirtualField({model: m, field: 'missing_attributes', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareVirtualField({model: m, field: 'missing_attributes_step_1', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareVirtualField({model: m, field: 'missing_attributes_step_2', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareVirtualField({model: m, field: 'missing_attributes_step_3', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareVirtualField({model: m, field: 'missing_attributes_step_4', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareEnumField({model: m, field: 'zip_code', enumValues: DEPARTEMENTS})
  declareVirtualField({model: m, field: '_all_jobs', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'jobUser'}}
  })
  declareVirtualField({model: m, field: 'pinned_jobs', instance: 'Array', multiple: true,
    // TODO: _all_jobs_pins should be enough to display jibusers if required
    requires:'_all_jobs.user',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'jobUser'}}
  })
  declareVirtualField({model: m, field: '_all_recommandations', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'recommandation'}}
  })
  declareVirtualField({model: m, field: 'search_text', type: 'String',
    requires:'firstname,lastname,qualified_str,visible_str,company_name,coaching,zip_code,admin_validated'
  })
  declareEnumField({model: m, field: 'gender', instance: 'String', enumValues: GENDER})
})



declareEnumField({model: 'company', field: 'status', enumValues: COMPANY_STATUS})
declareEnumField({model: 'jobUser', field: 'experience', enumValues: EXPERIENCE})
declareVirtualField({model: 'jobUser', field: 'activities', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'activity'}}
})
declareVirtualField({model: 'jobUser', field: 'skills', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'skill'}}
})
declareVirtualField({model: 'jobUser', field: 'location_str', instance: 'String', requires: 'customer_location,foreign_location'})
declareVirtualField({model: 'jobUser', field: 'search_field', instance: 'String', requires: 'name,skills.name,activities.name'})
declareVirtualField({model: 'jobUser', field: 'experiences', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'experience'}}
})
declareVirtualField({model: 'jobUser', field: 'diploma', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'diploma'}}
})
declareVirtualField({model: 'jobUser', field: 'photos', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'photo'}}
})
declareVirtualField({model: 'jobUser', field: 'recommandations', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'recommandation'}}
})
declareVirtualField({model: 'jobUser', field: 'missions', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'mission'}}
})
declareVirtualField({model: 'jobUser', field: 'comments', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'comment'}}
})
declareVirtualField({model: 'jobUser', field: 'pinned', instance: 'Boolean', requires:'pins'})
declareVirtualField({model: 'jobUser', field: 'recommandations_count', instance: 'Number', requires:'recommandations'})
declareVirtualField({model: 'jobUser', field: 'rate_str', instance: 'String', requires:'on_quotation,rate'})


declareEnumField({model: 'experience', field: 'contract_type', enumValues: CONTRACT_TYPE})

declareVirtualField({model: 'mission', field: 'status', instance: 'String', enumValues: QUOTATION_STATUS,
    requires: 'job,customer_accept_bill_date,customer_refuse_bill_date,bill_sent_date,ti_finished_date,customer_refuse_quotation_date,customer_accept_quotation_date,ti_refuse_date,quotation_sent_date,job,customer_refuse_bill_date,customer_refuse_quotation_date,customer_cancel_date'})
declareVirtualField({model: 'mission', field: 'quotations', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'quotation'}}
})
declareEnumField({model: 'mission', field: 'frequency', enumValues: MISSION_FREQUENCY})
declareVirtualField({model: 'mission', field: 'location_str', instance: 'String', requires: 'customer_location,foreign_location'})
declareVirtualField({model: 'mission', field: 'ti_tip', instance: 'String', requires: ''})
declareVirtualField({model: 'mission', field: 'customer_tip', instance: 'String', requires: ''})
declareVirtualField({model: 'mission', field: 'comments', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'comment'}}
})
declareEnumField({model: 'mission', field: 'payin_status', enumValues: PAYMENT_STATUS})
declareEnumField({model: 'mission', field: 'recurrent', instance: 'String', enumValues: BOOLEAN})
// Biling
declareVirtualField({model: 'mission', field: 'aa_ht', instance: 'Number', requires: 'quotations.aa_ht'})
declareVirtualField({model: 'mission', field: 'aa_total', instance: 'Number', requires: 'quotations.aa_total'})
declareVirtualField({model: 'mission', field: 'aa_vat', instance: 'Number', requires: 'quotations.aa_vat'})
declareVirtualField({model: 'mission', field: 'customer_total', instance: 'Number', requires: 'quotations.customer_total'})
declareVirtualField({model: 'mission', field: 'customer_vat', instance: 'Number', requires: 'quotations.customer_vat'})
declareVirtualField({model: 'mission', field: 'customer_ht', instance: 'Number', requires: 'quotations.customer_ht'})
declareVirtualField({model: 'mission', field: 'gross_ht', instance: 'Number', requires: 'quotations.gross_ht'})
declareVirtualField({model: 'mission', field: 'gross_total', instance: 'Number', requires: 'quotations.gross_total'})
declareVirtualField({model: 'mission', field: 'gross_vat', instance: 'Number', requires: 'quotations.gross_vat'})
declareVirtualField({model: 'mission', field: 'mer_ht', instance: 'Number', requires: 'quotations.mer_ht'})
declareVirtualField({model: 'mission', field: 'mer_total', instance: 'Number', requires: 'quotations.mer_total'})
declareVirtualField({model: 'mission', field: 'mer_vat', instance: 'Number', requires: 'quotations.mer_vat'})
declareVirtualField({model: 'mission', field: 'ti_total', instance: 'Number', requires: 'quotations.ti_total'})
declareVirtualField({model: 'mission', field: 'ti_vat', instance: 'Number', requires: 'quotations.ti_vat'})


declareVirtualField({model: 'quotation', field: 'details', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'quotationDetail'}}
})
declareVirtualField({model: 'quotation', field: 'customer_ht', instance: 'Number', requires: 'gross_ht,mer_ht'})
declareVirtualField({model: 'quotation', field: 'customer_vat', instance: 'Number', requires: 'gross_vat,mer_vat'})
declareVirtualField({model: 'quotation', field: 'gross_vat', instance: 'Number', requires: 'details.vat_total'})
declareVirtualField({model: 'quotation', field: 'gross_ht', instance: 'Number', requires: 'details.ht_total'})
declareVirtualField({model: 'quotation', field: 'customer_total', instance: 'Number', requires: 'gross_total,mer_total,gross_ht'})
declareVirtualField({model: 'quotation', field: 'mer_total', instance: 'Number', requires: 'mer_ht,mer_vat'})
declareVirtualField({model: 'quotation', field: 'mer_ht', instance: 'Number', requires: 'mission.job.user,gross_ht'})
declareVirtualField({model: 'quotation', field: 'mer_vat', instance: 'Number', requires: 'mer_ht'})
declareVirtualField({model: 'quotation', field: 'gross_total', instance: 'Number', requires: 'details.total'})
declareVirtualField({model: 'quotation', field: 'aa_ht', instance: 'Number', requires: 'gross_ht'})
declareVirtualField({model: 'quotation', field: 'aa_vat', instance: 'Number', requires: 'aa_ht'})
declareVirtualField({model: 'quotation', field: 'aa_total', instance: 'Number', requires: 'aa_ht,aa_vat'})
declareVirtualField({model: 'quotation', field: 'ti_vat', instance: 'Number', requires: 'gross_vat,aa_vat'})
declareVirtualField({model: 'quotation', field: 'ti_total', instance: 'Number', requires: 'gross_total,aa_total,ti_vat'})

declareVirtualField({model: 'quotationDetail', field: 'total', instance: 'Number', requires: 'quantity,ht_price,vat'})
declareVirtualField({model: 'quotationDetail', field: 'vat_total', instance: 'Number', requires: 'quantity,ht_price,vat'})
declareVirtualField({model: 'quotationDetail', field: 'ht_total', instance: 'Number', requires: 'quantity,ht_price,vat'})

declareEnumField({model: 'contact', field: 'status', enumValues: CONTACT_STATUS})
declareEnumField({model: 'contact', field: 'region', enumValues: DEPARTEMENTS})

declareVirtualField({model: 'adminDashboard', field: 'contact_sent', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'refused_bills', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'accepted_bills', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'visible_ti', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'hidden_ti', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'qualified_ti', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'visible_tipi', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'hidden_tipi', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'qualified_tipi', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'missions_requests', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'refused_missions', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'sent_quotations', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'quotation_ca_total', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'commission_ca_total', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'tipi_commission_ca_total', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'tini_commission_ca_total', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'customer_commission_ca_total', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'ti_registered_today', instance: 'Number'})
declareVirtualField({model: 'adminDashboard', field: 'customers_registered_today', instance: 'Number'})


const filterDataUser = ({model, data, user}) => {
  // ALL-E admins have whole visibility
  if (user?.role==ROLE_ALLE_ADMIN) {
    return Promise.resolve(data)
  }
  if (model == 'jobUser') {
    // Hide jobUser.user.hidden
    return Promise.all(data.map(job => JobUser.findById(job._id).populate('user')
        .then(dbJob => {
          if (dbJob?.user?.hidden==false || idEqual(user?._id, dbJob?.user?._id)) {
            return job
          }
          return null
        })
      ))
      .then(jobs => jobs.filter(v => !!v))
  }
  return data
}

setFilterDataUser(filterDataUser)


const getDataPinned = (user, params, data) => {
  const pinned=data?.pins?.some(l => idEqual(l._id, user?._id))
  return Promise.resolve(pinned)
}

const setDataPinned = ({id, attribute, value, user}) => {
  console.log(`Pinnning:${value}`)
  return getModel(id, ['jobUser'])
    .then(model => {
      if (value) {
        // Set liked
        return mongoose.models[model].findByIdAndUpdate(id, {$addToSet: {pins: user._id}})
      }
      else {
        // Remove liked
        return mongoose.models[model].findByIdAndUpdate(id, {$pullAll: {pins: [user._id]}})
      }
    })
}

declareComputedField('jobUser', 'pinned', getDataPinned, setDataPinned)


declareComputedField('adminDashboard', 'contact_sent', () => Contact.countDocuments())
declareComputedField('adminDashboard', 'refused_bills', () =>
  Mission.countDocuments({customer_refuse_bill_date: {$ne: null}})
)
declareComputedField('adminDashboard', 'accepted_bills', () =>
  Mission.countDocuments({customer_accept_bill_date: {$ne: null}})
)
declareComputedField('adminDashboard', 'visible_ti',
  () => User.countDocuments({role: ROLE_TI, hidden:false})
)
declareComputedField('adminDashboard', 'hidden_ti',
  () => User.countDocuments({role: ROLE_TI, hidden:true})
)
declareComputedField('adminDashboard', 'qualified_ti',
  () => User.countDocuments({role: ROLE_TI, qualified:true})
)
declareComputedField('adminDashboard', 'visible_tipi',
  () => User.countDocuments({role: ROLE_TI, coaching: COACH_ALLE, hidden:false})
)
declareComputedField('adminDashboard', 'hidden_tipi',
  () => User.countDocuments({role: ROLE_TI, coaching: COACH_ALLE, hidden:true})
)
declareComputedField('adminDashboard', 'qualified_tipi',
  () => User.countDocuments({role: ROLE_TI, coaching: COACH_ALLE, qualified:true})
)
declareComputedField('adminDashboard', 'missions_requests', () =>
  loadFromDb({model: 'mission', fields:['status']})
    .then(missions => missions.filter(m => m.status==MISSION_STATUS_ASKING).length)
)
declareComputedField('adminDashboard', 'refused_missions', () =>
loadFromDb({model: 'mission', fields:['status']})
  .then(missions => missions.filter(m => m.status==MISSION_STATUS_TI_REFUSED).length)
)
declareComputedField('adminDashboard', 'sent_quotations', () =>
  Mission.countDocuments({quotation_sent_date: {$ne: null}})
)

declareComputedField('adminDashboard', 'quotation_ca_total',
  () => {
    return loadFromDb({model: 'mission', fields:['status','quotations.customer_total']})
      .then(missions => {
        return lodash(missions)
          .filter(m => m.status==MISSION_STATUS_QUOT_SENT)
          .sumBy(m => m.quotations[0].gross_total)
      })
  }
)

//*****************************************************************
// TODO: Compute actual AA & MER commissions
//*****************************************************************

// TODO: WTF is that value ??
declareComputedField('adminDashboard', 'commission_ca_total',
() => {
  return loadFromDb({model: 'mission', fields:['status','quotations.aa']})
    .then(missions => {
      return lodash(missions)
        .filter(m => m.status==MISSION_STATUS_FINISHED)
        .sumBy(m => m.quotations[0].aa)
    })
}
)

declareComputedField('adminDashboard', 'tipi_commission_ca_total',
() => {
  return loadFromDb({model: 'mission', fields:['name','status','quotations.aa','job.user.coaching','job.user.coaching']})
    .then(missions => {
      return lodash(missions)
        .filter(m => m.status==MISSION_STATUS_FINISHED)
        .filter(m => m.job?.user?.coaching==COACH_ALLE)
        .sumBy(m => m.quotations[0].aa)
    })
}
)

declareComputedField('adminDashboard', 'tini_commission_ca_total',
() => {
  return loadFromDb({model: 'mission', fields:['status','quotations.aa','job.user.coaching']})
    .then(missions => {
      return lodash(missions)
        .filter(m => m.status==MISSION_STATUS_FINISHED)
        .filter(m => m.job?.user?.coaching!=COACH_ALLE)
        .sumBy(m => m.quotations[0].aa)
    })
}
)

declareComputedField('adminDashboard', 'customer_commission_ca_total',
() => {
  return loadFromDb({model: 'mission', fields:['status','quotations.mer']})
    .then(missions => {
      return lodash(missions)
        .filter(m => m.status==MISSION_STATUS_FINISHED)
        .sumBy(m => m.quotations[0].mer)
    })
}
)

declareComputedField('adminDashboard', 'ti_registered_today', () =>
  User.find({role:ROLE_TI}, {[CREATED_AT_ATTRIBUTE]:1})
    .then(users => users.filter(u => moment(u[CREATED_AT_ATTRIBUTE]).isSame(moment(), 'day')).length))
declareComputedField('adminDashboard', 'customers_registered_today', () =>
  User.find({role:ROLE_COMPANY_BUYER}, {[CREATED_AT_ATTRIBUTE]:1})
  .then(users => users.filter(u => moment(u[CREATED_AT_ATTRIBUTE]).isSame(moment(), 'day')).length))


/** Upsert ONLY adminDashboard */
AdminDashboard.exists({})
  .then(exists => !exists && AdminDashboard.create({}))
  .then(()=> console.log(`Only adminDashboard`))
  .catch(err=> console.error(`Only adminDashboard:${err}`))

const getUsersList = () => {
  const HEADERS=[
    {title: 'Créé le', id:'created_format'},
    {title: 'Prénom', id:'firstname'},
    {title: 'Nom', id:'lastname'},
    {title: 'Email', id:'email'},
    {title: 'Département', id:'zip_code'},
    {title: 'Métiers', id: 'job'},
    {title: 'Masqué', id: 'visible_str'},
    {title: 'Qualifié', id: 'qualified_str'},
    {title: 'Accompagnement', id: 'coaching_alle'},
    {title: '% complétude', id: 'profile_progress'},
    {title: 'Assurance', id: 'insurance_type'},
    {title: 'Document assurance', id: 'insurance_report'},
  ]
  return User.find().populate('jobs').lean({virtuals:true}).sort({creation_date:1})
    .then(users => {
      return users.map(u => ({
        ...u,
        job: u.jobs.map(j => j.name).join(','),
        coaching_alle: u.coaching==COACH_ALLE ? 'oui':'non',
        created_format: moment(u[CREATED_AT_ATTRIBUTE]).format('DD/MM/YY hh:mm'),
      }))
    })
    .then(users => {
      const csvStringifier = createCsvWriter({
        header: HEADERS,
        fieldDelimiter: ';',
        path: 'AllTipis.csv',
      });
      return csvStringifier.csvStringifier.getHeaderString() + csvStringifier.csvStringifier.stringifyRecords(users)
    })
}

const sendUsersList = () => {
  return Promise.all([
    User.find({role: {$in: [ROLE_ALLE_ADMIN, ROLE_ALLE_SUPER_ADMIN]}}),
    getUsersList(),
  ])
  .then(([admins, contents]) => {
    // TODO: contact only. Later will send to SUPER_ADMIN roles only
    admins=admins.filter(a => /contact/.test(a.email))
    const name=`Extraction TIPI du ${moment().format('DD/MM/YY HH:mm')}.csv`
    const content=Buffer.from(contents).toString('base64')
    const attachment={name, content}
    return Promise.allSettled(admins.map(admin => sendUsersExtract(admin, attachment)))
  })
  .then(console.log)
}

!isDevelopment() && cron.schedule('0 0 8 * * *', async() => {
  // Send each monday and thursday
  const DAYS=[1,4]
  const today=moment().startOf('day').day()
  if (DAYS.includes(today)) {
    return sendUsersList()
      .then(console.log)
      .catch(console.error)
  }
})
// Check payment status
// Poll every minute
cron.schedule('*/5 * * * * *', async() => {
  return Mission.findOne({payin_id: {$ne:null}, payin_achieved: null})
    .then(mission => paymentPlugin.getCheckout(mission.payin_id))
    .then(payment => {
      if (payment.status=='expired'  || (payment.status=='complete' && payment.payment_status=='unpaid')) {
        console.log(`Payment ${payment.id} failed`)
        return Mission.findOneAndUpdate({payin_id: payment.id}, {$unset: {payin_id:true, payin_achieved:true}})
      }
      if (payment.status=='complete'  && (payment.payment_status=='paid' || payment.payment_status=='no_payment_required')) {
        console.log(`Payment ${payment.id} succeded`)
        return Mission.findOneAndUpdate({payin_id: payment.id}, {payin_achieved:true})
      }
    })
})

// Daily notifications (every day at 8AM) for missions/quotations reminders
cron.schedule('0 0 8 * * *', async() => {
  console.log('crnoning')
  // Pending quoations: not accepted after 2 days
  loadFromDb({model: 'mission', fields: ['user.firstname','user.email','status','job.user','job.user.full_name']})
    .then(missions => {
      const pendingQuotations=missions.filter(m => m.status==MISSION_STATUS_QUOT_SENT && moment().diff(moment(m.quotation_sent_date), 'days')==PENDING_QUOTATION_DELAY)
      Promise.allSettled(pendingQuotations.map(m => sendPendingQuotation(m)))
      const noQuotationMissions=missions.filter(m => m.status==MISSION_STATUS_ASKING && moment().diff(moment(m[CREATED_AT_ATTRIBUTE]), 'days')==MISSING_QUOTATION_DELAY)
      Promise.allSettled(noQuotationMissions.map(m => sendMissionAskedReminder(m)))
      const soonMissions=missions.filter(m => m.status==MISSION_STATUS_QUOT_ACCEPTED && moment().diff(moment(m[CREATED_AT_ATTRIBUTE]), 'days')==MISSION_REMINDER_DELAY)
      Promise.allSettled(soonMissions.map(m => sendMissionReminderCustomer(m)))
      Promise.allSettled(soonMissions.map(m => sendMissionReminderTI(m)))
    })
})


// Daily notifications (every day at 9PM) to complete profile
cron.schedule('0 0 19 * * *', () => {
  const today=moment().startOf('day')
  const isTuesday=today.day()==2
  console.log(`Checking uncomplete profiles, today is tuesday:${isTuesday}`)
  // Pending quoations: not accepted after 2 days
  return loadFromDb({model: 'user', fields: ['role', 'creation_date', 'email', 'profile_progress','missing_attributes']})
    .then(users => {
      const uncompleteProfiles=users
        .filter(u => u.role==ROLE_TI)
        .filter(u => isTuesday || today.diff(moment(u.creation_date).startOf('day'), 'days')==2)
        .filter(u => u.profile_progress < 100)
        .forEach(u => {
          console.log(`Sending reminder mail to ${u.email}:${u.missing_attributes}`)
          sendProfileReminder(u)
        })
    })
})

module.exports={
  getUsersList,
  sendUsersList,
}
