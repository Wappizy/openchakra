const fs=require('fs')
const lodash=require('lodash')
const moment=require('moment')
const path=require('path')
const {extractData, guessFileType, importData, prepareCache, cache}=require('../../../utils/import')
const { guessDelimiter } = require('../../../utils/text')
const Company=require('../../models/Company')
const User=require('../../models/User')
const AppointmentType=require('../../models/AppointmentType')
const { ROLE_EXTERNAL_DIET, ROLE_CUSTOMER, DIET_REGISTRATION_STATUS_ACTIVE, COMPANY_ACTIVITY_ASSURANCE, COMPANY_ACTIVITY_OTHER, CONTENTS_ARTICLE, CONTENTS_DOCUMENT, CONTENTS_VIDEO, CONTENTS_INFOGRAPHY, CONTENTS_PODCAST, QUIZZ_TYPE_PATIENT, QUIZZ_QUESTION_TYPE_ENUM_SINGLE } = require('./consts')
const { CREATED_AT_ATTRIBUTE } = require('../../../utils/consts')
const AppointmentTypeSchema = require('./schemas/AppointmentTypeSchema')
require('../../models/User')
require('../../models/Coaching')
const Key=require('../../models/Key')
const QuizzQuestion = require('../../models/QuizzQuestion')
require('../../models/UserQuizz')
require('../../models/UserQuizzQuestion')
const Quizz = require('../../models/Quizz')
const Coaching = require('../../models/Coaching')
const { idEqual } = require('../../utils/database')

const DEFAULT_PASSWORD='DEFAULT'
const PRESTATION_DURATION=45
const PRESTATION_NAME=`Générique ${PRESTATION_DURATION} minutes`
const PRESTATION_SMARTAGENDA_ID=-1
const KEY_NAME='Clé import'

const QUIZZ_FACTOR=100

const fixDiets = async directory => {
  const CPINDEX=8
  const PATH=path.join(directory, 'smart_diets.csv')
  const contents=fs.readFileSync(PATH).toString()
  const splitted=contents.split('\n').map(l => l.split(';'))
  splitted.forEach((l, idx) => idx !=0 && !lodash.isEmpty(l[CPINDEX]) && l[CPINDEX].length==4 ? l[CPINDEX]+='0' : {})
  // console.log(splitted)
  const fixed_str=splitted.map(l => l.join(';')).join('\n')
  fs.writeFileSync(PATH, fixed_str)
}

const fixPatients = async directory => {
  const REPLACES=[
    [/\\"/g, "'"], [/\\\\/g, ''], [/orange\.f\\\n/g, 'orange.f'],
    [/\@hotmailfr"/g, '@hotmail.fr"'], [/\@orange\.f"/g, '@orange.fr"'], [/\@hotmail\.fr2/g, '@hotmail.fr'],
    [/\@gmailcom"/g, '@gmail.com"'], [/\@gmail\.c"/g, '@gmail.com"'], [/\@aolcom"/g, '@aol.com"'], [/\@orangefr"/g, '@orange.fr"'], 
    [/@sfr"/g, '@sfr.fr"'], [/\@yahoofr/g, "@yahoo.fr"], [/\@hotmailcom"/g, 'hotmail.com"'], [/\@neuffr"/g, '@neuf.fr"'], 
    [/\@msncom"/g, '@msn.com"'], [/\@gmail"/g, '@gmail.com"'], [/\@free.f"/g, '@free.fr"'], [/\@orange,fr/g, 'orange.fr'],
    [/\@live\.f"/g, '@live.fr"'], [/\@yahoo\.f"/g, '@yahoo.fr"'], [/francksurgis\.\@live\.fr/, 'francksurgis@live.fr'],
    [/\@outlook\.f"/g, '@outlook.fr"'], [/\@yahoo"/g, '@yahoo.fr"'], [/\@lapos"/g, '@laposte.net"'],

  ]
  const PATH=path.join(directory, 'smart_patient.csv')
  const contents=fs.readFileSync(PATH).toString()
  let fixed=contents
  REPLACES.forEach(([search, replace]) => fixed=fixed.replace(search, replace))
  fs.writeFileSync(PATH, fixed)
}

const fixAppointments = directory => {
  const REPLACES=[
    [/\\"/g, "'"], [/\\\\/g, ''],
  ]
  const PATH=path.join(directory, 'smart_consultation.csv')
  const contents=fs.readFileSync(PATH).toString()
  let fixed=contents
  REPLACES.forEach(([search, replace]) => fixed=fixed.replace(search, replace))
  fs.writeFileSync(PATH, fixed)
}

const fixQuizz = directory => {
  const REPLACES=[
    [/.quilibre/g, 'Equilibre'], [/\/ Vegan/g, '/Vegan'], [/Apéro \!/g, 'Apéro'], [/Fr.quences/g, 'Fréquences'],
    [/.quivalences/g, 'Equivalences'],
  ]
  const PATH=path.join(directory, 'smart_quiz.csv')
  const contents=fs.readFileSync(PATH).toString()
  let fixed=contents
  REPLACES.forEach(([search, replace]) => fixed=fixed.replace(search, replace))
  fs.writeFileSync(PATH, fixed)
}

const fixQuizzQuestions = directory => {
  const REPLACES=[
    [/\\"/g, "'"], [/\\\\/g, ''],
  ]
  const PATH=path.join(directory, 'smart_question.csv')
  const contents=fs.readFileSync(PATH).toString()
  let fixed=contents
  REPLACES.forEach(([search, replace]) => fixed=fixed.replace(search, replace))
  fs.writeFileSync(PATH, fixed)
}

const fixFiles = async directory => {
  await fixDiets(directory)
  await fixPatients(directory)
  await fixAppointments(directory)
  await fixQuizz(directory)
  await fixQuizzQuestions(directory)
}

const computePseudo = record => {
  const letters=[record.firstname?.slice(0, 1), record.lastname?.slice(0, 2)].filter(v => !!v)
  return letters.join('').toUpperCase() || 'FAK'
}

const COMPANY_MAPPING= {
  name: 'name',
  size: () => 1,
  activity: () => COMPANY_ACTIVITY_OTHER,
  migration_id: 'SDPROJECTID',
}

const COMPANY_KEY='name'
const COMPANY_MIGRATION_KEY='migration_id'

const USER_MAPPING={
  role: () => ROLE_CUSTOMER,
  email: 'emailCanonical',
  firstname: ({record}) => record.firstname || 'inconnu',
  lastname: ({record}) => record.lastname || 'inconnu',
  dataTreatmentAccepted: () => true,
  cguAccepted: () => true,
  password: () => DEFAULT_PASSWORD,
  company: ({cache, record}) => cache('company', record.SDPROJECTID),
  pseudo: ({record}) => computePseudo(record),
  migration_id: 'SDPATIENTID'
}

const USER_KEY='email'
const USER_MIGRATION_KEY='migration_id'

const DIET_MAPPING={
  role: () => ROLE_EXTERNAL_DIET,
  password: () => DEFAULT_PASSWORD,
  firstname: 'PRENOM',
  lastname: 'NOM',
  email: 'EMAIL',
  registration_status: () => DIET_REGISTRATION_STATUS_ACTIVE,
  smartagenda_id: 'ID AGENDA',
  migration_id: 'SDID',
  zip_code: 'CPCAB',
  address: 'VILLECAB',
}

const DIET_MIGRATION_KEY='migration_id'

const COACHING_MAPPING={
  [CREATED_AT_ATTRIBUTE]: ({record}) => moment(record.orderdate),
  user: ({cache, record}) => cache('user', record.SDPATIENTID),
  migration_id: 'SDPROGRAMID',
  diet: ({cache, record}) => cache('user', record.SDDIETID),
}

const COACHING_KEY=['user', CREATED_AT_ATTRIBUTE]
const COACHING_MIGRATION_KEY='migration_id'

const APPOINTMENT_MAPPING= prestation_id => ({
  coaching: ({cache, record}) => cache('coaching', record.SDPROGRAMID),
  start_date: 'date',
  end_date: ({record}) => moment(record.date).add(45, 'minutes'),
  synthesis: 'comments',
  appointment_type: () => prestation_id,
  migration_id: 'SDCONSULTID',
})


const APPOINTMENT_KEY=['coaching', 'start_date']
const APPOINTMENT_MIGRATION_KEY='migration_id'

const MEASURE_MAPPING={
  migration_id: 'SDCONSULTID',
  date: ({cache, record}) => cache('consultation_date', record.SDCONSULTID),
  chest: 'chest',
  waist: 'waist',
  hips: 'pelvis',
  thighs: ({record}) => lodash.mean([parseInt(record.leftthigh), parseInt(record.rightthigh)].filter(v => !!v)) || undefined,
  arms: () => undefined,
  weight: 'weight',
  user:({cache, record}) => cache('consultation_patient', record.SDCONSULTID),
}

const MEASURE_MAPPING_KEY='migration_id'
const MEASURE_MAPPING_MIGRATION__KEY='migration_id'

const QUIZZ_MAPPING={
  migration_id: 'SDQUIZID',
  name: 'name',
  type: () => QUIZZ_TYPE_PATIENT,
}

const QUIZZ_KEY='name'
const QUIZZ_MIGRATION_KEY='migration_id'

const QUIZZQUESTION_MAPPING={
  migration_id: ({record}) => parseInt(record.SDQUIZID)*QUIZZ_FACTOR+parseInt(record.position),
  title: ({record}) => record.question.replace(/[\r\n\\]/g, ''),
  success_message: ({record}) => `Bravo! ${record.comments}`,
  error_message: ({record}) => `Dommage! ${record.comments}`,
  type: () => QUIZZ_QUESTION_TYPE_ENUM_SINGLE,
}

const QUIZZQUESTION_KEY='title'
const QUIZZQUESTION_MIGRATION_KEY='migration_id'

const QUIZZANSWER_1_MAPPING={
  migration_id: ({record}) => (parseInt(record.SDQUIZID)*QUIZZ_FACTOR+parseInt(record.position))*QUIZZ_FACTOR+1,
  quizzQuestion: ({record, cache}) => {
    const question_migration_id=parseInt(record.SDQUIZID)*QUIZZ_FACTOR+parseInt(record.position)
    return cache('quizzQuestion', question_migration_id)
  },
  text: 'firstanswer',
}

const QUIZZANSWER_1_KEY=['text', 'quizzQuestion']
const QUIZZANSWER_1_MIGRATION_KEY='migration_id'

const QUIZZANSWER_2_MAPPING={
  migration_id: ({record}) => (parseInt(record.SDQUIZID)*QUIZZ_FACTOR+parseInt(record.position))*QUIZZ_FACTOR+1,
  quizzQuestion: ({record, cache}) => {
    const question_migration_id=parseInt(record.SDQUIZID)*QUIZZ_FACTOR+parseInt(record.position)
    return cache('quizzQuestion', question_migration_id)
  },
  text: 'secondanswer',
}

const QUIZZANSWER_2_KEY=['text', 'quizzQuestion']
const QUIZZANSWER_2_MIGRATION_KEY='migration_id'

const progressCb = step => (index, total)=> {
  step=step||(total/10)
  if (step && index%step==0) {
    console.log(`${index}/${total}`)
  }
}

const importCompanies = async input_file => {
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => 
      importData({model: 'company', data:records, mapping:COMPANY_MAPPING, identityKey: COMPANY_KEY, 
        migrationKey: COMPANY_MIGRATION_KEY, progressCb: progressCb()}))
}


const importUsers = async input_file => {
  // Deactivate password encryption
  const schema=User.schema
  schema.paths.password.setters=[]
  // End deactivate password encryption
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => 
      importData({model: 'user', data:records, mapping:USER_MAPPING, identityKey: USER_KEY, 
        migrationKey: USER_MIGRATION_KEY, progressCb: progressCb(2000)})
    )
}

const importDiets = async input_file => {
  // Deactivate password encryption
  const schema=User.schema
  schema.paths.password.setters=[]
  // End deactivate password encryption
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => importData({model: 'user', data:records, mapping:DIET_MAPPING, identityKey: USER_KEY, migrationKey: USER_MIGRATION_KEY}))
}

const importCoachings = async input_file => {
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => importData({model: 'coaching', data:records, mapping:COACHING_MAPPING, 
    identityKey: COACHING_KEY, migrationKey: COACHING_MIGRATION_KEY, progressCb: progressCb(1000)}))
}

const importAppointments = async input_file => {
  let prestation=await AppointmentType.findOne({title: PRESTATION_NAME})
  if (!prestation) {
    prestation=await AppointmentType.create({title: PRESTATION_NAME, duration: PRESTATION_DURATION, 
      smartagenda_id: PRESTATION_SMARTAGENDA_ID})
  }
  prestation=prestation._id

  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => 
      importData({model: 'appointment', data:records, mapping:APPOINTMENT_MAPPING(prestation), 
      identityKey: APPOINTMENT_KEY, migrationKey: APPOINTMENT_MIGRATION_KEY, progressCb: progressCb(2000)}
    ))
}

const importMeasures = async input_file => {
  return prepareCache()
    .then(() => {
      const contents=fs.readFileSync(input_file)
      return Promise.all([guessFileType(contents), guessDelimiter(contents)])
      .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
      .then(({records}) => 
        importData({
          model: 'measure', data:records, mapping:MEASURE_MAPPING, identityKey: MEASURE_MAPPING_KEY, 
          migrationKey: MEASURE_MAPPING_MIGRATION__KEY, progressCb: progressCb(2000)
        })
      )
  })
}

const importQuizz = async input_file => {
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => importData({model: 'quizz', data:records, mapping:QUIZZ_MAPPING, 
    identityKey: QUIZZ_KEY, migrationKey: QUIZZ_MIGRATION_KEY, progressCb: progressCb()}))
}
  
const importQuizzQuestions = async input_file => {
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => importData({model: 'quizzQuestion', data:records, mapping:QUIZZQUESTION_MAPPING, 
    identityKey: QUIZZQUESTION_KEY, migrationKey: QUIZZQUESTION_MIGRATION_KEY, progressCb: progressCb(20)})
  )
  // Attach questions to quizzs
  .then(res=> QuizzQuestion.find({migration_id: {$ne: null}})
    .then(questions => lodash(questions)
      .groupBy(q => Math.floor(q.migration_id/QUIZZ_FACTOR))
      .mapValues(quizzQuestions => quizzQuestions.map(q => q._id))
      .value()
    )
    .then(grouped => Object.keys(grouped).map(key => Quizz.findOneAndUpdate({migration_id: key}, {questions: grouped[key]})))
    .then(queries => Promise.all(queries))
    .then(() => res)
  )
}

const importQuizzQuestionAnswer = async input_file => {
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => 
      Promise.all([
        importData({model: 'item', data:records, mapping:QUIZZANSWER_1_MAPPING, 
          identityKey: QUIZZANSWER_1_KEY, migrationKey: QUIZZANSWER_1_MIGRATION_KEY, progressCb: progressCb()}),
        importData({model: 'item', data:records, mapping:QUIZZANSWER_2_MAPPING, 
          identityKey: QUIZZANSWER_2_KEY, migrationKey: QUIZZANSWER_2_MIGRATION_KEY, progressCb: progressCb()}),
      ])
    )
    .then(([res1, res2]) => [...res1, ...res2])
}

const ORDERS=['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth']

const importUserQuizz = async input_file => {
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => Promise.allSettled(records.map(async (record, idx) => {
      console.log(idx, '/', records.length)
      const userId=cache('user', record.SDPATIENTID)
      const quizzId=cache('quizz', record.SDQUIZID)
      const coaching=await Coaching.findOne({user: userId}).sort({ [CREATED_AT_ATTRIBUTE]: -1 }).limit(1)
      if (!coaching) {
        return Promise.reject(`No coaching for user ${record.SDPATIENTID}/${userId}`)
      }
      // Check if template exists
      const hasTemplate=coaching.quizz_templates.some(q => idEqual(q._id, quizzId))
      if (!hasTemplate) {
        coaching.quizz_templates.push(quizzId)
        const quizz=await Quizz.findById(quizzId).populate({path: 'questions', populate: 'available_answers'})
        const cloned=await quizz.cloneAsUserQuizz()
        coaching.quizz.push(cloned._id)
        await coaching.save()
        return Promise.all(ORDERS.map(async (attribute, index) => {
          const answer=parseInt(record[attribute])
          const quizzQuestion=quizz.questions[index]
          const userQuestion=cloned.questions[index]
          if (!lodash.isNaN(answer)) {
            const item_id=quizzQuestion.available_answers[answer]
            userQuestion.single_enum_answer=item_id
            return userQuestion.save()
          }
          else {
            return Promise.resolve(true)
          }
        }))
      }
    })))
}

module.exports={
  importCompanies,
  importUsers,
  importDiets,
  importCoachings,
  importAppointments,
  importMeasures,
  fixFiles,
  importQuizz,
  importQuizzQuestions,
  importQuizzQuestionAnswer,
  importUserQuizz,
}