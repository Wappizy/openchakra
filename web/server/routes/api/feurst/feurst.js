const {computePrecos} = require('../../../utils/feurst/xl_db')

const router = require('express').Router()
const {getDatabase}=require('../../../utils/feurst/xl_db')
const lodash=require('lodash')

// @Route GET /feurst/api/database
// Google callback
router.get('/database', (req, res) => {
  getDatabase()
    .then(db => {
      const grounds=lodash.uniq(Object.keys(db.grounds).map(k => k.split(',')[2])).sort()
      res.json({...db, grounds: grounds})
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

router.post('/preconisations', (req, res) => {
  computePrecos(req.body)
    .then(precos => {
      res.json(precos)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

module.exports = router
