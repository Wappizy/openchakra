const path = require('path');
const { exec } = require('child_process');
const { logFormFields, fillForm, savePDFFile, duplicateFields } = require('../../utils/fillForm');
const Quotation = require('../../server/models/Quotation');
const mongoose = require('mongoose');
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database');
const { StandardFonts } = require('pdf-lib');
const { fillQuotationDetails } = require('../../server/plugins/sosynpl/quotation');
require('../../server/plugins/sosynpl/functions');
require('../../server/models/Sector');
require('../../server/models/Job');
require('../../server/models/Training');
require('../../server/models/Application');
require('../../server/models/Report');
require('../../server/models/JobFile');
require('../../server/models/QuotationDetail');

const ROOT = path.join(__dirname, './../data/pdf');
const FILEPATH = path.join(ROOT, 'template.pdf');
const FONT = StandardFonts.Helvetica;
const FONT_SIZE = 5;

jest.setTimeout(300000);

describe('Fill form test', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS);
  });

  afterAll(async () => {});

  it('must retrieve PDF fields', async () => {
    const fields = await logFormFields(FILEPATH);
    console.log(JSON.stringify(fields, null, 2));
  });

  it('must check how the pdf deals with long input', async () => {
    const data = {
      description: 'aaaa bbbb cccc dddd eeee ffff gggg hhhh jjjj kkkk llll mmmm nnnn oooo pppp qqqq rrrr ssss',
      days: '99999',
      rate: '69696969',
      total: '5555',
      tva: '45454'
    };
    const pdf = await fillForm(FILEPATH, data, FONT, FONT_SIZE);
    await savePDFFile(pdf, '/home/myalfred/test.pdf');
    const res = await exec(`xdg-open /home/myalfred/test.pdf`);
  });

  it('must duplicate fields in PDF', async () => {
    const numberOfDuplicates = 15;
    const pdf = await duplicateFields(FILEPATH, ['description', 'rate', 'days', 'total', 'tva'], numberOfDuplicates, 0, 10, FONT, FONT_SIZE);
    await savePDFFile(pdf, '/home/myalfred/test_duplicate.pdf');
    const res = await exec(`xdg-open /home/myalfred/test_duplicate.pdf`);
  });

  it.only('must duplicate and fill fields from quotation', async () => {
    const id = '668561c4f8aa59121b5cad40';
    const [quotation] = await loadFromDb({ model: 'quotation', id, fields: ['details'] });
  
    const pdf = await fillQuotationDetails(FILEPATH, quotation);
  
    await savePDFFile(pdf, '/home/myalfred/test_duplicate_and_fill.pdf');
    const res = await exec(`xdg-open /home/myalfred/test_duplicate_and_fill.pdf`);
  });
});
