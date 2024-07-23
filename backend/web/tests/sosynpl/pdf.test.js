const path=require('path')
const { exec } = require('child_process')    
const { logFormFields, fillForm, savePDFFile } = require('../../utils/fillForm')

const ROOT = path.join(__dirname, './../data/pdf')
const FILEPATH = path.join(ROOT, 'template.pdf')

describe('Fill form test', () => {

  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  it('must retrieve PDF fields', async() => {
    const fields=await logFormFields(FILEPATH)
    console.log(JSON.stringify(fields,null,2))
  })
  it('must check how the pdf deals with long input', async() => {
    const data={
        description: 'aaaa bbbb cccc dddd eeee ffff gggg hhhh jjjj kkkk llll mmmm nnnn oooo pppp qqqq'
    }
    const pdf=await fillForm(FILEPATH, data)
    await savePDFFile(pdf, '/home/myalfred/test.pdf')
    const res=await exec(`xdg-open /home/myalfred/test.pdf`)
  })
})
