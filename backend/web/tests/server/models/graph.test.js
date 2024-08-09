const {generateGraph} = require('../../../scripts/generateGraph')
require('../../../server/utils/database')
require('../../../server/utils/schemas')

describe('Grap test', () => {

  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  test('Generate dot format', async () => {
    return generateGraph()
      .then(res => console.log(res))
  })
})