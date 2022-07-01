const passport = require('passport')
const express = require('express')
const {HTTP_CODES} = require('../../utils/errors')
const Prestation = require('../../models/Prestation')

const router = express.Router()

router.get('/test', (req, res) => res.json({msg: 'Prestation Works!'}))

// @Route GET /myAlfred/api/prestation/all
// Get all prestations
router.get('/all', (req, res) => {
  Prestation.find()
    .sort({'label': 1})
    .populate('category')
    .populate('job')
    .populate('service')
    .populate('billing')
    .populate('filter_presentation')
    .then(prestation => {
      if (typeof prestation !== 'undefined' && prestation.length > 0) {
        res.json(prestation)
      }
      else {
        return res.status(400).json({msg: 'No prestation found'})
      }
    })
    .catch(err => {
      console.error(err)
      res.status(HTTP_CODES.NOT_FOUND).json({prestation: `No prestation found:${err}`})
    })
})

// @Route GET /myAlfred/api/prestation/home
// Get all prestations
router.get('/home', (req, res) => {
  Prestation.find().sort({'label': 1})
    .populate('category')
    .populate('job')
    .populate('service')
    .populate('billing')
    .populate('filter_presentation')
    .limit(4)
    .then(prestation => {
      if (typeof prestation !== 'undefined' && prestation.length > 0) {
        res.json(prestation)
      }
      else {
        return res.status(400).json({msg: 'No prestation found'})
      }

    })
    .catch(err => {
      console.error(err)
      res.status(HTTP_CODES.NOT_FOUND).json({prestation: `No prestation found:${err}`})
    })
})

// @Route GET /myAlfred/api/prestation/:service
// View all prestations per service
router.get('/:service', (req, res) => {

  Prestation.find({service: req.params.service}).sort({'label': 1})
    .populate('category')
    .populate('service')
    .populate('filter_presentation')
    .populate('billing')
    .then(prestation => {
      if (typeof prestation !== 'undefined' && prestation.length > 0) {
        res.json(prestation)
      }
      else {
        return res.status(400).json({msg: 'No prestation found'})
      }
    })
    .catch(err => {
      console.error(err)
      res.status(HTTP_CODES.NOT_FOUND).json({prestation: `No prestation found:${err}`})
    })
})

// @Route GET /myAlfred/api/prestation/:service/:filter
// View all prestations per service and filter
router.get('/:service/:filter', passport.authenticate('jwt', {session: false}), (req, res) => {
  Prestation.find({
    service: req.params.service,
    filter_presentation: req.params.filter,
  })
    .sort({'label': 1})
    .populate('billing')
    .then(prestation => {
      if (prestation.length > 0) {
        return res.json(prestation)
      }
      return res.status(400).json({msg: 'No prestation found'})
    })
    .catch(err => {
      return res.status(HTTP_CODES.NOT_FOUND).json({prestation: `No prestation found:${err}`})
    })
})

// @Route GET /myAlfred/api/prestation/:id
// View one prestation
router.get('/:id', (req, res) => {
  Prestation.findById(req.params.id)
    .populate('category')
    .populate('job')
    .populate('service')
    .populate('billing')
    .populate('filter_presentation')
    .then(prestation => {
      if (Object.keys(prestation).length === 0 && prestation.constructor === Object) {
        return res.status(400).json({msg: 'No prestation found'})
      }
      res.json(prestation)
    })
    .catch(err => {
      res.status(HTTP_CODES.NOT_FOUND).json({prestation: `No prestation found:${err}`})
    })
})


module.exports = router
