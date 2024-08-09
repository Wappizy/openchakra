const {
  WORKFLOWS,
  computeWorkflowLists,
  mapContactToMailJet} = require('../../server/plugins/smartdiet/workflows')
const {
  COMPANY_ACTIVITY_ASSURANCE} = require('../../server/plugins/smartdiet/consts')
const {
  APPOINTMENT_DATA,
  COACHING_DATA} = require('./data/modelsBaseData')
const lodash=require('lodash')
const Appointment = require('../../server/models/Appointment')
const Coaching = require('../../server/models/Coaching')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const moment = require('moment')
const mongoose = require('mongoose')
const {forceDataModelSmartdiet}=require('../utils')

forceDataModelSmartdiet()
const MAIL_HANDLER=require('../../server/utils/mailjet')

require('../../server/models/Target')
require('../../server/models/UserQuizz')
require('../../server/models/Key')
require('../../server/models/Association')
require('../../server/models/Category')
require('../../server/models/Item')
require('../../server/models/Question')

jest.setTimeout(50000)

describe('Worflows', () => {

  const LEADONLY='leadonly@wappizy.com'
  const LEADUSER='leadanduser@wappizy.com'
  const DIET='diet@wappizy.com'

  let company
  let leadUser
  let diet
  let offer
  let appointmentType

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  afterEach(async() => {
  })

  const emailContained = email => {
    return expect.arrayContaining([expect.objectContaining( {Email: email})])
  }


  it('must filter CL_SALAR_LEAD_NOCOA_NOGROUP', async() => {
    const result=await computeWorkflowLists()
    expect(result.CL_SALAR_LEAD_NOCOA_NOGROUP.add).toEqual(emailContained(LEADONLY))
    expect(result.CL_SALAR_LEAD_NOCOA_NOGROUP.add).not.toEqual(emailContained(LEADUSER))
    expect(result.CL_SALAR_LEAD_NOCOA_NOGROUP.add).not.toEqual(emailContained(DIET))
  })

  it('must filter CL_SALAR_LEAD_NOCOA_GROUP', async() => {
    offer.groups_unlimited=true
    await offer.save()
    const result=await computeWorkflowLists()
    expect(result.CL_SALAR_LEAD_NOCOA_GROUP.add).toEqual(emailContained(LEADONLY))
    expect(result.CL_SALAR_LEAD_NOCOA_GROUP.add).not.toEqual(emailContained(LEADUSER))
    expect(result.CL_SALAR_LEAD_NOCOA_GROUP.add).not.toEqual(emailContained(DIET))
  })

  it('must filter CL_SALAR_LEAD_COA_NOGROUP', async() => {
    offer.coaching_credit=12
    await offer.save()
    const result=await computeWorkflowLists()
    expect(result.CL_SALAR_LEAD_COA_NOGROUP.add).toEqual(emailContained(LEADONLY))
    expect(result.CL_SALAR_LEAD_COA_NOGROUP.add).not.toEqual(emailContained(LEADUSER))
    expect(result.CL_SALAR_LEAD_COA_NOGROUP.add).not.toEqual(emailContained(DIET))
  })

  it('must filter CL_SALAR_LEAD_COA_GROUP', async() => {
    offer.groups_unlimited=true
    offer.coaching_credit=12
    await offer.save()
    const result=await computeWorkflowLists()
    expect(result.CL_SALAR_LEAD_COA_GROUP.add).toEqual(emailContained(LEADONLY))
    expect(result.CL_SALAR_LEAD_COA_GROUP.add).not.toEqual(emailContained(LEADUSER))
    expect(result.CL_SALAR_LEAD_COA_GROUP.add).not.toEqual(emailContained(DIET))
  })

  it('must filter CL_REGISTERED', async() => {
    const result=await computeWorkflowLists()
    expect(result.CL_REGISTERED).not.toEqual(emailContained(LEADONLY))
    expect(result.CL_REGISTERED.add).toEqual(emailContained(LEADUSER))
    expect(result.CL_REGISTERED.add).not.toEqual(emailContained(DIET))
  })

  it('must filter CL_SALAR_REGISTERED_COLL_CHALL', async() => {
    const result=await computeWorkflowLists()
    expect(result.CL_SALAR_REGISTERED_COLL_CHALL.add).not.toEqual(emailContained(LEADONLY))
    expect(result.CL_SALAR_REGISTERED_COLL_CHALL.add).toEqual(emailContained(LEADUSER))
    expect(result.CL_SALAR_REGISTERED_COLL_CHALL.add).not.toEqual(emailContained(DIET))
  })

  it('must filter CL_SALAR_REGISTERED_FIRST_COA_APPT', async() => {
    const coaching=await Coaching.create({...COACHING_DATA, user: leadUser})
    await Appointment.create({...APPOINTMENT_DATA, appointment_type: appointmentType, user: leadUser, diet,
      start_date: moment().add(-3, 'hour'), end_date:moment().add(-2, 'hour'), coaching,
    })
    const result=await computeWorkflowLists()
    expect(result.CL_SALAR_REGISTERED_FIRST_COA_APPT.add).not.toEqual(emailContained(LEADONLY))
    expect(result.CL_SALAR_REGISTERED_FIRST_COA_APPT.add).toEqual(emailContained(LEADUSER))
    expect(result.CL_SALAR_REGISTERED_FIRST_COA_APPT.add).not.toEqual(emailContained(DIET))
  })

  it('must filter CL_ADHER_LEAD_COA_NOGROUP', async() => {
    offer.coaching_credit=12
    await offer.save()
    company.activity=COMPANY_ACTIVITY_ASSURANCE
    await company.save()
    const result=await computeWorkflowLists()
    expect(result.CL_ADHER_LEAD_COA_NOGROUP.add).toEqual(emailContained(LEADONLY))
    expect(result.CL_ADHER_LEAD_COA_NOGROUP.add).not.toEqual(emailContained(LEADUSER))
    expect(result.CL_ADHER_LEAD_COA_NOGROUP.add).not.toEqual(emailContained(DIET))
  })

  it.only('Must compute workflows list', async() => {
    const res=await computeWorkflowLists()
    const removed=Object.values(res).find(v => v.remove.length>0).remove
    const added=Object.values(res).find(v => v.remove.length>0).remove
    expect(added.every(item => lodash.isObject(item))).toBe(true)
    expect(removed.every(item => lodash.isObject(item))).toBe(true)
    const accept = c => /ouvreur/.test(c.Email) && !/ouvreurinscrit/i.test(c.Email)
    Object.values(res)
      .filter(d => d.add.some(accept))
      .map(d => ({
        ...d, 
        add: d.add.filter(accept).map(c => c.Email), 
        remove: d.remove.filter(accept).map(c => c.Email)
      }))
      .map(({id, name, add, remove}) => console.log(id, name, 'add', add, 'remove', remove))
      // .map(({id, name, add, remove}) => console.log(id, name, 'add', add.length, 'remove', remove.length))
  })

  it('Must update workflows', async() => {
  })

  it('must add to list with parameters', async() => {
    const list=WORKFLOWS.CL_SALAR_LEAD_COA_NOGROUP.id
    //const properties={codeentreprise: 'Com hop12', credit_consult: 19, Client:'La compagnie', logo: 'hophophop'}
    const properties={codeentreprise: 'Com hop12', credit_consult: 19, client: 'compagnie', logo: false}
    const contacts=[mapContactToMailJet({email: 'hello+testeasninogroup@wappizy.com', properties})]
    await MAIL_HANDLER.addContactsToList({contacts, list})
  })

  it('Must display groups', async() => {
    //console.log(allLists.filter(l => /adh/i.test(l.Name)))
  })

  it('Must display contacts list', async() => {
    const email='sebastien.auvray@wappizy.com'
    const result=await MAIL_HANDLER.getContactsLists()
    console.log(result)
    const listId=result[0].ID
    const id=await MAIL_HANDLER.getContactId(email)
    console.log('ID is', id)
    console.log(listId)
    // const campaigns=await MAIL_HANDLER.getWorkflowsForContactsList({list:listId}).catch(console.error)
    // console.log(campaigns, campaigns.length, 'workflows', campaigns.map(c => c.WorkflowID))
    await MAIL_HANDLER.removeContactsFromList({contacts: [{Email:email}], list: listId})
  })
})