const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { forceDataModelSmartdiet } = require('../utils')
const { importQuizz } = require('../../scripts/smartdiet/importQuizz')
const mongoose = require('mongoose')

forceDataModelSmartdiet()

const quizzs=require('./data/export_quizzs.json')
const questions=require('./data/export_quizz_questions.json')

describe('Prospects', () => {

  beforeAll(async () => {
    //await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    //await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must import quizz', async() => {
    return importQuizz({quizzs: quizzs, questions: questions})
      .then(console.log)
      .catch(console.error)
  })
})