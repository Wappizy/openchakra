const express = require('express')
const router = express.Router()
const passport = require('passport')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')
const geolib = require('geolib')
const _ = require('lodash')
const moment = require('moment')
const {data2ServiceUser} = require('../../utils/mapping')
const {emptyPromise} = require('../../../utils/promise')
const serviceFilters = require('../../utils/filters')
const {GID_LEN, PRO, MANAGER, MICROSERVICE_MODE} = require('../../../utils/consts')
const {normalize} = require('../../../utils/text')
const parse = require('url-parse')
const {getRole, get_logged_id} = require('../../utils/serverContext')
const {ensureDirectoryExists} = require('../../utils/filesystem')

moment.locale('fr')

ensureDirectoryExists('static/profile/diploma/')
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'static/profile/diploma/')
  },
  filename: function(req, file, cb) {
    let key = crypto.randomBytes(5).toString('hex')
    cb(null, `${datetimestam }_${key}_${file.originalname}`)
  },
})
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, callback) {
    let ext = path.extname(file.originalname).toLowerCase()
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.pdf' && ext !== '.jpeg') {
      return callback(new Error('Error extension'))
    }
    callback(null, true)
  },
})

// @Route POST /myAlfred/api/serviceUser/add
// Connect an alfred to a service
// @Access private
router.post('/add', upload.fields([{name: 'diploma', maxCount: 1}, {
  name: 'certification',
  maxCount: 1,
}]), passport.authenticate('jwt', {session: false}), (req, res) => {


  req.context.getModel('ServiceUser').findOne({
    user: req.user.id,
    service: req.body.service,
  })
    .then(service => {
      const fields = {}
      fields.user = req.user.id
      fields.service = mongoose.Types.ObjectId(req.body.service)
      fields.city = req.body.city
      fields.perimeter = req.body.perimeter
      fields.minimum_basket = req.body.minimum_basket
      fields.deadline_before_booking = req.body.deadline_before_booking
      fields.prestations = JSON.parse(req.body.prestations)
      fields.option = JSON.parse(req.body.option)
      fields.experience_years = req.body.experience_years
      if (req.body.graduated === 'true') {
        fields.graduated = true
      }
      else {
        fields.graduated = false
      }

      const diploma = 'diploma'
      const certification = 'certificatio'
      if (diploma in req.files) {
        fields.diploma = {}
        fields.diploma.name = req.body.diplomaLabel
        fields.diploma.year = req.body.diplomaYear
        fields.diploma.file = req.files.diploma[0].path
      }
      else {
        console.log('No file uploaded')
      }
      if (req.body.is_certified === 'true') {
        fields.is_certified = true
      }
      else {
        fields.is_certified = false
      }
      if (certification in req.files) {
        fields.certification = {}
        fields.certification.name = req.body.certificationLabel
        fields.certification.year = req.body.certificationYear
        fields.certification.file = req.files.certification[0].path
      }
      else {
        console.log('No file uploaded')
      }
      fields.description = req.body.description
      fields.equipments = JSON.parse(req.body.equipments)
      fields.majoration = {
        active: Boolean(req.body.active),
        price: parseInt(req.body.price),
      }
      fields.service_address = {
        address: req.body.address,
        zip_code: req.body.zip_code,
        city: req.body.city,
        country: req.body.country,
        gps: {
          lat: req.body.lat,
          lng: req.body.lng,
        },
      }

      fields.location = {
        home: req.body.home === 'true',
        alfred: req.body.alfred === 'true',
        visio: req.body.visio === 'true',
      }

      fields.travel_tax = req.body.travel_tax === 'null' ? null : req.body.travel_tax
      fields.pick_tax = req.body.pick_tax === 'null' ? null : req.body.pick_tax

      req.context.getModel('ServiceUser').create(fields)
        .then(service => {
          res.json(service)
        })
        .catch(err => {
          console.error(err)
        })

    })
    .catch(error => {
      console.error(error)
    })
})

// @Route POST /myAlfred/api/serviceUser/addUpdate
// SAU : Add or update serviceUser in the shop
// @Access private
router.post('/addUpdate/:serviceuser_id?', passport.authenticate('jwt', {session: false}), (req, res) => {

  req.context.getModel('ServiceUser').findOne({ _id : req.params.serviceuser_id})
    .then(su => {
      if (!su) {
        su = {}
      }
      const data = req.body
      su = data2ServiceUser(data, su)
      su.user = req.user.id

      // FIX : créer les prestations custom avant
      let newPrestations = Object.values(req.body.prestations).filter(p => p._id && p._id.length == GID_LEN)
      let newPrestaModels = newPrestations.map(p => Prestation({
        ...p,
        s_label: normalize(p.label),
        service: req.body.service,
        billing: [p.billing],
        filter_presentation: null,
        private_alfred: req.user.id,
        particular_access: req.body.particular_access,
        professional_access: req.body.professional_access,
      }))

      const r = newPrestaModels.length > 0 ? req.context.getModel('Prestation').insertMany(newPrestaModels) : emptyPromise({insertedIds: []})
      r.catch(error => console.log('Error insert many' + JSON.stringify(error, null, 2)))
        .then(result => {
          var newIds = result.insertedIds
          // Update news prestations ids
          newPrestations.forEach((p, idx) => {
            p._id = newIds[idx]
            console.log('Presta sauvegardée : ' + JSON.stringify(p))
          })
          su.prestations=[]
          Object.values(req.body.prestations).forEach(presta => {
            const newp = {prestation: presta._id, billing: presta.billing, price: presta.price}
            su.prestations.push(newp)
          })

          const promise = req.params.serviceuser_id ? req.context.getModel('ServiceUser').findByIdAndUpdate(su._id, su, {new: true})  : req.context.getModel('ServiceUser').create(su)
          promise
            .then(su => {
              if (req.params.serviceuser_id) {
                return res.json(su)
              }
              else {
                req.context.getModel('Shop').update({alfred: req.user.id}, { $push: { services: su}})
                  .then(shop => {
                    return res.json(su)
                  })
                  .catch(error => {
                    console.error(error)
                    res.status(400).json(error)
                  })
                }
            })
            .catch(err => {
              console.error(err)
              res.status(400).json(error)
            })
        })


    })
    .catch(error => {
      console.error(error)
    })
})

// @Route PUT /myAlfred/api/serviceUser/editStatus
// Update status serviceUser
// @Access private
router.put('/editStatus', passport.authenticate('jwt', {session: false}), (req, res) => {
  req.context.getModel('ServiceUser').updateMany({user: req.user.id}, {status: req.body.status})
    .then(serviceUser => {
      res.json(serviceUser)
    })
    .catch(err => console.error(err))
})

// @Route PUT /myAlfred/api/serviceUser/editWithCity/:id
// Update a serviceUser
// @Access private
router.put('/editWithCity/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(serviceUser => {

      serviceUser.prestations = req.body.prestations
      serviceUser.option = req.body.options
      serviceUser.service_address.address = req.body.address
      serviceUser.service_address.zip_code = req.body.zip_code
      serviceUser.service_address.city = req.body.city
      serviceUser.service_address.country = req.body.country
      serviceUser.service_address.gps.lat = req.body.lat
      serviceUser.service_address.gps.lng = req.body.lng
      serviceUser.perimeter = req.body.perimeter
      serviceUser.minimum_basket = req.body.minimum_basket
      serviceUser.deadline_before_booking = req.body.deadline_before_booking
      serviceUser.equipments = req.body.equipments
      serviceUser.description = req.body.description
      serviceUser.level = req.body.level


      serviceUser.save()
        .then(service => {
          res.json(service)
        })
        .catch(err => {
          console.error(err)
          res.status(404).json(err)
        })
    })
    .catch(err => {
      console.error(err)
      res.status(404).json(err)
    })
})

// @Route PUT /myAlfred/api/serviceUser/addPrestation
// Add a prestation for a service
// @Access private
router.put('/addPrestation/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(serviceUser => {


      const newPrestation = {
        prestation: mongoose.Types.ObjectId(req.body.prestation),
        price: req.body.price,
      }
      serviceUser.prestations.unshift(newPrestation)


      serviceUser.save().then(service => res.json(service)).catch(err => console.error(err))

    })
    .catch(err => console.error(err))
})

// @Route PUT /myAlfred/api/serviceUser/editPrestation
// Edit the price of a prestation for a service
// @Access private
router.put('/editPrestation/:id', passport.authenticate('jwt', {session: false,}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(serviceUser => {
      const index = serviceUser.prestations
        .map(item => item.id)
        .indexOf(req.body.prestation)
      serviceUser.prestations[index].price = req.body.price
      serviceUser.save().then(service => res.json(service)).catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

// @Route POST /myAlfred/api/serviceUser/addDiploma/:id
// Add a diploma for a service
// @Access private
router.post('/addDiploma/:id', upload.single('file_diploma'), passport.authenticate('jwt', {session: false}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(serviceUser => {
      serviceUser.diploma = {}
      serviceUser.diploma.name = req.body.name
      serviceUser.diploma.year = req.body.year
      serviceUser.diploma.skills = JSON.parse(req.body.skills)
      const diploma = 'file_diploma'
      if (req.file) {
        serviceUser.diploma.file = req.file.path
      }
      serviceUser.graduated = true

      serviceUser.save().then(service => res.json(service)).catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

// @Route POST /myAlfred/api/serviceUser/addCertification/:id
// Add a certification for a service
// @Access private
router.post('/addCertification/:id', upload.single('file_certification'), passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(serviceUser => {
      serviceUser.certification.name = req.body.name
      serviceUser.certification.year = req.body.year
      serviceUser.certification.skills = JSON.parse(req.body.skills)
      if (req.file) {
        serviceUser.certification.file = req.file.path
      }
      serviceUser.is_certified = true

      serviceUser.save().then(service => res.json(service)).catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

// @Route GET /myAlfred/api/serviceUser/all
// View all service per user
// @Access private
router.get('/all', (req, res) => {

  req.context.getModel('ServiceUser').find()
    .populate('user', '-id_card')
    .populate('service')
    .then(service => {
      if (typeof service !== 'undefined' && service.length > 0) {
        res.json(service)
      } else {
        return res.status(400).json({
          msg: 'No service found',
        })
      }

    })
    .catch(err => res.status(404).json({
      service: 'No service found',
    }))
})

// @Route GET /myAlfred/api/serviceUser/all/category/:category
// View all service user per category
// @Access private
router.get('/all/category/:category', (req, res) => {
  let allServices = []
  req.context.getModel('ServiceUser').find()
    .populate('user', '-id_card')
    .populate('service')
    .then(service => {
      if (typeof service !== 'undefined' && service.length > 0) {
        service.forEach(e => {
          if (e.service.category == req.params.category) {
            allServices.push(e)
          }
        })
      } else {
        return res.status(400).json({msg: 'No service found'})
      }
      res.json(allServices)

    })
    .catch(err => res.status(404).json({service: 'No service found'}))
})

// @Route GET /myAlfred/api/serviceUser/category/:id
// Count number of service per category
router.get('/category/:id', (req, res) => {

  req.context.getModel('ServiceUser').find()
    .populate('user', '-id_card')
    .populate('service')
    .then(service => {
      if (typeof service !== 'undefined' && service.length > 0) {
        service.forEach(e => {
          if (e.service.category == req.params.id) {
            res.json({
              length: service.length,
            })
          } else {
            res.json({
              length: 0,
            })
          }
        })
      } else {
        return res.status(400).json({
          msg: 'No service found',
        })
      }

    })
    .catch(err => console.error(err))
})

// @Route GET /myAlfred/api/serviceUser/near
// View all service by city
// @Access private
router.get('/near', passport.authenticate('jwt', {session: false}), (req, res) => {

  req.context.getModel('User').findById(req.user.id)
    .then(user => {
      req.context.getModel('ServiceUser').find()
        .populate('user', '-id_card')
        .populate('service')
        .then(service => {
          const gps = user.billing_address.gps
          const latUser = gps.lat
          const lngUser = gps.lng
          const allService = []
          service.forEach(e => {
            const gpsAlfred = e.service_address.gps
            const latAlfred = gpsAlfred.lat
            const lngAlfred = gpsAlfred.lng
            if (latAlfred == null || lngAlfred == null) {
              //console.warn("Incorect GPS in "+e._id+":"+JSON.stringify(gpsAlfred))
            } else {

              /*const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(e.perimeter*1000))

              if(!isNear) {
                const removeIndex = service.findIndex(i => i._id == e._id)
                service.splice(removeIndex, 1)
              }*/
              var distance = geolib.convertDistance(geolib.getDistance({
                latitude: latUser,
                longitude: lngUser,
              }, {latitude: latAlfred, longitude: lngAlfred}), 'km').toFixed(2)
              if (distance < e.perimeter) {
                allService.push(e)
              }
            }

          })
          res.json(allService)

        })
        .catch(err => {
          console.error(err)
          res.status(404).json({service: 'No service found'})
        })
    })

})

// @Route GET /myAlfred/api/serviceUser/near/:service
// View all serviceUser by address and service
// @Access private
router.get('/near/:service', passport.authenticate('jwt', {session: false}), (req, res) => {

  req.context.getModel('User').findById(req.user.id)
    .then(user => {
      req.context.getModel('ServiceUser').find({service: req.params.service})
        .populate('user', '-id_card')
        .populate('service')
        .then(service => {
          const gps = user.billing_address.gps
          const latUser = gps.lat
          const lngUser = gps.lng

          service.forEach(e => {
            const gpsAlfred = e.service_address.gps
            const latAlfred = gpsAlfred.lat
            const lngAlfred = gpsAlfred.lng

            const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser}, {
              latitude: latAlfred,
              longitude: lngAlfred,
            }, (e.perimeter * 1000))

            if (!isNear) {
              const removeIndex = service.findIndex(i => i._id === e._id)
              service.splice(removeIndex, 1)
            }


          })

          res.json(service)

        })
        .catch(err => res.status(404).json({service: 'No service found'}))
    })

})

// @Route POST /myAlfred/api/serviceUser/search
// Search serviceUser according to optional coordinates, keyword, cat/service/prestation
router.post('/search', (req, res) => {
  const start2 = process.hrtime()
  const kw = req.body.keyword
  const gps = req.body.gps
  const category = req.body.category
  const service = req.body.service
  const prestation = req.body.prestation
  const restrictPerimeter = req.body.perimeter
  const status = req.body.status; // PRO or PART

  console.log(`Searching ${JSON.stringify(req.body)}`)

  const filter = status==PRO ? {'professional_access': true} : {'particular_access': true}
  req.context.getModel('ServiceUser').find(filter, 'prestations.prestation service_address location perimeter description')
    .populate({path: 'user', select: 'firstname'})
    .populate({
      path: 'service', select: 'label s_label description',
      populate: {path: 'category', select: status==PRO ? 's_professional_label':'s_particular_label'},
    })
    .populate({
      path: 'prestations.prestation', match: filter,
      populate: {path: 'job', select: 's_label'},
    })
    .then(result => {
      let sus=result
      console.log(`Found ${sus.length} before filtering`)
      if (category) {
        sus = sus.filter(su => su.service.category._id.toString() == category)
      }
      if (service) {
        sus = sus.filter(su => su.service._id.toString() == service)
      }
      if (prestation) {
        sus = sus.filter(su => su.prestations.some(p => p.prestation && p.prestation._id.toString() == prestation))
      }
      if (kw) {
        sus = serviceFilters.filterServicesKeyword(sus, kw, status)
      }
      console.log(`Remaining ${sus.length} after keyword filtering`)

      sus = serviceFilters.filterPartnerServices(sus, req.context.isAdmin())
      console.log(`Remaining ${sus.length} after keyword filtering`)

      if (gps) {
        try {
          sus = serviceFilters.filterServicesGPS(sus, JSON.parse(req.body.gps), restrictPerimeter)
        }
        catch (err) {
          sus = serviceFilters.filterServicesGPS(sus, req.body.gps, restrictPerimeter)
        }
      }
      console.log(`Remaining ${sus.length} after gps filtering`)

      // Manager : filtrer les services autorisés
      if (getRole(req)==MANAGER) {
        req.context.getModel('Group').findOne({members: get_logged_id(req), type: MICROSERVICE_MODE}, 'allowed_services')
          .then(group => {
            const manager_sus = serviceFilters.filterServicesIds(sus, group.allowed_services.map(s => s.service._id))
            return res.json(manager_sus)
          })
          .catch(err => {
            console.error(err)
            return res.status(400).json(err)
          })
      }
      else {
        const elapsed = process.hrtime(start2)
        console.log(`Fast Search found ${sus.length} services in ${elapsed[0]}s ${elapsed[1] / 1e6}ms`)
        return res.json(sus)
      }
    })
    .catch(err => {
      console.error(err)
      return res.status(404).json(err)
    })
})

// @Route GET /myAlfred/api/serviceUser/near/:city
// View all serviceUser by city
router.post('/nearCity', (req, res) => {
  const dat = req.body.city
  const data = dat.replace(new RegExp(/[eéèêaàoôuù]/g), '[eéèêaàoôuù]')
  req.context.getModel('ServiceUser').find({'service_address.city': {$regex: data, $options: 'i'}})
    .populate('user', '-id_card')
    .populate('service')
    .then(service => {
      res.json(service)
    })
    .catch(err => res.status(404).json({service: 'No service found'}))

})

// @Route GET /myAlfred/api/serviceUser/cardPreview/:id
// Data fro serviceUser cardPreview
// @Access private
router.get('/cardPreview/:id', (req, res) => {
  const suId = mongoose.Types.ObjectId(req.params.id)
  req.context.getModel('ServiceUser').findOne(suId, 'label picture alfred service service_address.city service_address.gps graduated is_certified level description')
    .populate({path: 'service', select: 'picture label'})
    .populate({path: 'user', select: 'firstname picture avatar_letters'})
    .catch(err => {
      console.error(err)
      res.status(404).json({error: err})
    })
    .then(su => {
      req.context.getModel('Shop').findOne({alfred: su.user}, 'is_professional')
        .then(shop => {
          req.context.getModel('Review').find({alfred: su.user, note_client: undefined, serviceUser: su._id})
            .then(reviews => {
              const result = {
                _id: su._id, label: su.service.label, picture: su.service.picture,
                alfred: su.user, city: su.service_address ? su.service_address.city : '', graduated: su.graduated,
                is_certified: su.is_certified, level: su.level, is_professional: shop.is_professional,
                gps: su.service_address ? su.service_address.gps : null, reviews: reviews, description: su.description
              }
              res.json(result)
            })
        })
        .catch(err => {
          console.error(err)
          res.status(404).json({error: err})
        })
    })
})
// @Route GET /myAlfred/api/serviceUser/nearOther
// View all service around other address
// @Access private
router.get('/nearOther/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

  req.context.getModel('User').findById(req.user.id)
    .then(user => {
      req.context.getModel('ServiceUser').find()
        .populate('user', '-id_card')
        .populate('service')
        .then(service => {
          const addressIndex = user.service_address.findIndex(i => i._id == req.params.id)
          const gps = user.service_address[addressIndex]
          const latUser = gps.lat
          const lngUser = gps.lng
          const allService = []

          service.forEach(e => {
            const gpsAlfred = e.service_address.gps
            const latAlfred = gpsAlfred.lat
            const lngAlfred = gpsAlfred.lng

            /*const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(e.perimeter*1000))

            if(!isNear) {
                const removeIndex = service.findIndex(i => i._id === e._id)
                service.splice(removeIndex, 1)
            }*/
            if (geolib.convertDistance(
              geolib.getDistance(
                {latitude: latUser, longitude: lngUser},
                {latitude: latAlfred, longitude: lngAlfred},
              ),
              'km',
            ).toFixed(2) < e.perimeter) {
              allService.push(e)
            }
          })
          res.json(allService)
        })
        .catch(err => res.status(404).json({service: 'No service found'}))
    })

})

// @Route GET /myAlfred/api/serviceUser/all/:service
// View all serviceUser by service
// @Access private
router.get('/all/nearOther/:id/:service', passport.authenticate('jwt', {session: false}), (req, res) => {

  req.context.getModel('User').findById(req.user.id)
    .then(user => {
      req.context.getModel('ServiceUser').find({service: req.params.service})
        .populate('user', '-id_card')
        .populate('service')
        .then(service => {
          const addressIndex = user.service_address.findIndex(i => i._id == req.params.id)
          const gps = user.service_address[addressIndex]
          const latUser = gps.lat
          const lngUser = gps.lng

          service.forEach(e => {
            const gpsAlfred = e.service_address.gps
            const latAlfred = gpsAlfred.lat
            const lngAlfred = gpsAlfred.lng

            const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser}, {
              latitude: latAlfred,
              longitude: lngAlfred,
            }, (e.perimeter * 1000))

            if (!isNear) {
              const removeIndex = service.findIndex(i => i._id === e._id)
              service.splice(removeIndex, 1)
            }
          })
          res.json(service)
        })
        .catch(err => res.status(404).json({
          service: 'No service found',
        }))
    })

})

// @Route GET /myAlfred/api/serviceUser/home(?gps=XXX)
// View service for home, sorted according to GPS if provided
// @Access public
router.get('/home/:partpro', (req, res) => {
  const query=parse(req.originalUrl, true).query

  var gps=null
  // Sort according to GPS coordinates
  if (query.gps) {
    gps=JSON.parse(query.gps)
  }

  const shuffleArray = array => {
    let i = array.length - 1
    for (; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array
  }

  const filter= req.params.partpro==PRO ? { 'professional_access':true} : { 'particular_access':true}
  req.context.getModel('ServiceUser').find(filter, 'user service service_address')
    // {e.service.picture} title={e.service.label} alfred={e.user.firstname} user={e.user} score={e.user.score} /
    .populate('user', 'picture firstname score billing_address')
    .populate('service', 'label picture')
    .then(services => {
      if (typeof services !== 'undefined' && services.length > 0) {
        if (gps) {
          services.sort(serviceFilters.distanceComparator(gps))
          services = _.uniqBy(services, su => su.user)
        }
        else {
          services = shuffleArray(services)
        }
        res.json(services.slice(0, 6))
      } else {
        return res.status(400).json({
          msg: 'No service found',
        })
      }

    })
    .catch(err => {
      console.error(err)
      res.status(404).json({service: 'No service found'})
    })
})

// @Route GET /myAlfred/api/serviceUser/currentAlfred
// View all service for the current alfred
// @Access private
router.get('/currentAlfred', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {

  req.context.getModel('ServiceUser').find({
    user: req.user.id,
  })
    .populate('service')
    .populate('user')
    .populate({
      path: 'service',
      populate: {
        path: 'category',
      },
    })
    .populate('prestations.prestation')
    .populate('equipments')
    .then(service => {
      if (Object.keys(service).length === 0 && service.constructor === Object) {
        return res.status(400).json({
          msg: 'No service found',
        })
      } else {
        res.json(service)
      }

    })
    .catch(err => res.status(404).json({
      service: 'No service found',
    }))
})

// @Route GET /myAlfred/api/serviceUser/:id
// View one serviceUser
// @Access private
router.get('/:id', (req, res) => {

  req.context.getModel('ServiceUser').findById(req.params.id)
    .populate('user', '-id_card')
    .populate('service')
    .populate({
      path: 'prestations.prestation',
      populate: {
        path: 'filter_presentation',
      },
    })
    .populate({
      path: 'prestations.billing',
    })
    .populate('equipments')
    .populate('service.equipments')
    .then(service => {
      if (Object.keys(service).length === 0 && service.constructor === Object) {
        return res.status(400).json({
          msg: 'No service found',
        })
      } else {
        res.json(service)
      }

    })
    .catch(err => res.status(404).json({
      service: 'No service found' + err,
    }))
})

// @Route GET /myAlfred/api/serviceUser/:id
// View one serviceUser
// @Access private
router.get('/allUserServices/:id', (req, res) => {
  let userId = mongoose.Types.ObjectId(req.params.id)
  req.context.getModel('ServiceUser').find({user: userId})
    .populate('service')
    .then(services => {
      res.json(services)
    })
    .catch(err => console.error(err))
})


// @Route PUT /myAlfred/serviceUser/deletePrestation/:id
// Delete one prestation from the list
// @Access private
router.put('/deletePrestation/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(serviceUser => {
      const removeIndex = serviceUser.prestations
        .map(item => item.id)
        .indexOf(req.body.prestation)

      serviceUser.prestations.splice(removeIndex, 1)


      serviceUser.save().then(list => res.json(list))
    })
    .catch(err => res.status(404).json(err))
})

// @Route PUT /myAlfred/api/serviceUser/views/:id
// Update number of views for a service
router.put('/views/:id', (req, res) => {
  req.context.getModel('ServiceUser').findByIdAndUpdate(req.params.id, {
    $inc: {
      number_of_views: 1,
    },
  }, {
    new: true,
  })
    .then(service => {
      if (!service) {
        return res.status(400).json({
          msg: 'No service found',
        })
      }
      res.json(service)

    })
    .catch(err => res.status(404).json({
      user: 'No service found',
    }))
})

// @Route DELETE /myAlfred/api/serviceUser/delete/diploma/:id
// Delete diploma for a service
// @Access private
router.delete('/delete/diploma/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(services => {
      services.diploma = undefined
      services.graduated = false

      services.save().then(service => res.json(service)).catch(err => console.error(err))

    })
    .catch(err => res.status(404).json({
      servicenotfound: 'No service found',
    }))
})

// @Route DELETE /myAlfred/api/serviceUser/delete/certification/:id
// Delete certification for a service
// @Access private
router.delete('/delete/certification/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(services => {
      services.certification = undefined
      services.is_certified = false

      services.save().then(service => res.json(service)).catch(err => console.error(err))

    })
    .catch(err => res.status(404).json({
      servicenotfound: 'No service found',
    }))
})

// @Route DELETE /myAlfred/api/serviceUser/current/allServices
// Delete all the service for an alfred
// @Access private
router.delete('/current/allServices', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  req.context.getModel('ServiceUser').deleteMany({
    user: req.user.id,
  })
    .then(() => {
      res.json({
        success: true,
      })

    })
    .catch(err => res.status(404).json({
      servicenotfound: 'No service found',
    }))
})

// @Route DELETE /myAlfred/api/serviceUser/:id
// Delete a service for an alfred
// @Access private
router.delete('/:id', passport.authenticate('jwt', {
  session: false,
}), (req, res) => {
  req.context.getModel('ServiceUser').findById(req.params.id)
    .then(event => {
      event.remove().then(() => {
        req.context.getModel('Shop').findOne({
          alfred: req.user.id,
        })
          .then(shop => {
            const removeIndex = shop.services
              .indexOf(req.params.id)

            shop.services.splice(removeIndex, 1)


            shop.save().then(newShop => res.json(newShop)).catch(err => console.error(err))
          })
      })
    })
    .catch(err => res.status(404).json({
      eventnotfound: 'No event found',
    }))
})


module.exports = router
