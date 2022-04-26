const crypto = require('crypto')
const passport = require('passport')
const express = require('express')
const moment = require('moment')
const lodash = require('lodash')
const axios = require('axios')
const csv_parse = require('csv-parse/lib/sync')
const {ACCOUNT, LINK} = require('../../../utils/feurst/consts')
const {isActionAllowed} = require('../../utils/userAccess')
const Group = require('../../models/Group')
const Company = require('../../models/Company')
const Booking = require('../../models/Booking')
const User = require('../../models/User')
const {EDIT_PROFIL}=require('../../../utils/i18n')
const {IMAGE_FILTER, TEXT_FILTER, createDiskMulter, createMemoryMulter} = require('../../utils/filesystem')

const router = express.Router()
const {computeUrl}=require('../../../config/config')
const {validateCompanyProfile, validateCompanyMember} = require('../../validation/simpleRegister')
moment.locale('fr')
const {ADMIN, MANAGER, EMPLOYEE, ROLES, MICROSERVICE_MODE, CARETAKER_MODE, BOOK_STATUS} = require('../../../utils/consts')
const {addRegistrationProof, createOrUpdateMangoCompany} = require('../../utils/mangopay')
const {getPeriodStart}=require('../../../utils/dateutils')
const {bufferToString, normalize} = require('../../../utils/text')
const {sendB2BRegistration}=require('../../utils/mailing')

axios.defaults.withCredentials = true

// Upload multers
// Profile id card
const uploadIdPicture = createDiskMulter('static/profile/', IMAGE_FILTER)
// Registration proof storage
const uploadRegProof = createDiskMulter('static/profile/registrationProof/', IMAGE_FILTER)
// B2B Employees
const uploadEmployees = createMemoryMulter(TEXT_FILTER)


// @Route GET /myAlfred/api/companies
// Get companies list
// @Access private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (!isActionAllowed(req.user.roles, ACCOUNT, LINK)) {
    return res.status(301)
  }

  Company.find()
    .then(companies => {
      res.json(companies)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route PUT /myAlfred/api/companies/profile/billingAddress
// Set the main address in the profile
// @Access private
router.put('/profile/billingAddress', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  Company.findById(req.user.company)
    .then(company => {
      company.billing_address = {}
      company.billing_address.address = req.body.address
      company.billing_address.zip_code = req.body.zip_code
      company.billing_address.city = req.body.city
      company.billing_address.country = req.body.country
      company.billing_address.gps.lat = req.body.gps.lat
      company.billing_address.gps.lng = req.body.gps.lng
      company.save().then(company => res.json(company)).catch(err => console.error(err))

    })
})

// @Route PUT /myAlfred/api/companies/profile/serviceAddress
// Add an other address in the profile
// @Access private
router.put('/profile/serviceAddress', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  Company.findById(req.user.company)
    .then(company => {
      const address = {
        address: req.body.address,
        city: req.body.city,
        zip_code: req.body.zip_code,
        lat: req.body.lat,
        lng: req.body.lng,
        label: req.body.label,
        floor: req.body.floor,
        note: req.body.note,
        phone_address: req.body.phone,
      }
      company.service_address.push(address)


      company.save().then(company => res.json(company)).catch(err => console.error(err))


    })
})

// @Route GET /myAlfred/api/companies/profile/address/:id
// Get service address by id
// @Access private
router.get('/profile/address/:id', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.user.company)
    .then(company => {
      const index = req.params.id
      const address = company.service_address
      const selected = address.map(item => item.id)
        .indexOf(index)
      const obj = address[selected]
      res.json(obj)
    })
    .catch(err => console.error(err))
})

// @Route PUT /myAlfred/api/companies/profile/address/:id
// Edit service address by id
// @Access private
router.put('/profile/address/:id', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.user.company)
    .then(company => {
      const index = company.service_address
        .map(item => item.id)
        .indexOf(req.params.id)
      company.service_address[index].label = req.body.label
      company.service_address[index].address = req.body.address
      company.service_address[index].zip_code = req.body.zip_code
      company.service_address[index].city = req.body.city
      company.service_address[index].floor = req.body.floor
      company.service_address[index].note = req.body.note
      company.service_address[index].phone_address = req.body.phone
      company.service_address[index].lat = req.body.lat
      company.service_address[index].lng = req.body.lng

      company.save().then(address => res.json(address)).catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

// @Route DELETE /myAlfred/api/companies/profile/address/:id
// Delete service address by id
// @Access private
router.delete('/profile/address/:id', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.user.company)
    .then(company => {
      const index = company.service_address
        .map(item => item.id)
        .indexOf(req.params.id)
      company.service_address.splice(index, 1)

      company.save().then(address => res.json(address)).catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

// @Route PUT /myAlfred/api/companies/profile/picture
// Add a picture profile
// @Access private
router.post('/profile/picture', uploadIdPicture.single('myImage'), passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findByIdAndUpdate(req.company.id, {
    picture: req.file ? req.file.path : '',
  }, {new: true})
    .then(company => {
      res.json(company)
    })
    .catch(err => {
      console.error(err)
    })
})

// @Route PUT /myAlfred/api/companies/profile/pictureLater
// Add a picture profile
// @Access private
router.put('/profile/pictureLater', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findByIdAndUpdate(req.company.id, {picture: req.body.picture}, {new: true})
    .then(company => {
      res.json(company)
    })
    .catch(err => console.error(err))
})

// @Route POST /myAlfred/api/companies/profile/registrationProof/add
// Add a registration proof
// @Access private
router.post('/profile/registrationProof/add', uploadRegProof.single('registrationProof'), passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.company.id)
    .then(company => {
      company.registration_proof = req.file.path
      return company.save()
    })
    .then(company => {
      addRegistrationProof(company)
      res.json(company)
    })
    .catch(err => {
      console.error(err)
    })
})

// @Route DELETE /myAlfred/api/companies/profile/registrationProof
// Deletes a registration proof
// @Access private
router.delete('/profile/registrationProof', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.company.id)
    .then(company => {
      company.registration_proof = null
      return company.save()
    })
    .then(company => {
      res.json(company)
    })
    .catch(err => {
      console.error(err)
    })
})

// @Route GET /myAlfred/api/companies/current
// Get the company for the current logged user
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findById(req.user, 'company')
    .then(user => {
      Company.findById(user.company)
        .then(company => {
          if (!company) {
            return res.status(400).json({msg: 'No company found'})
          }
          return res.json(company)
        })
        .catch(err => {
          console.error(err)
          res.status(404).json({company: 'No company found'})
        })
    })
    .catch(err => {
      console.error(err)
      res.status(404).json({company: 'No company found'})
    })
})

// @Route GET /myAlfred/api/companies/companies/:id
// Get one company
router.get('/companies/:id', (req, res) => {
  Company.findById(req.params.id)
    .then(company => {
      if (!company) {
        return res.status(400).json({msg: 'No company found'})
      }
      res.json(company)

    })
    .catch(err => res.status(404).json({company: 'No company found'}))
})

// @Route PUT /myAlfred/api/companies/alfredViews/:id
// Update number of views for an alfred
router.put('/alfredViews/:id', (req, res) => {
  Company.findByIdAndUpdate(req.params.id, {$inc: {number_of_views: 1}}, {new: true})
    .then(company => {
      if (!company) {
        return res.status(400).json({msg: 'No company found'})
      }
      res.json(company)

    })
    .catch(err => res.status(404).json({company: 'No company found'}))
})

// @Route PUT /myAlfred/api/companies/profile/editProfile
// Edit email, job and phone
// @Access private
router.put('/profile/editProfile', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const {errors, isValid} = validateCompanyProfile(req.body)
  const companyId = req.user.company

  Company.findOne({name: req.body.name})
    .then(company => {
      if (company && JSON.stringify(company._id) !== JSON.stringify(companyId)) {
        return res.status(400).json({name: 'Une société de ce nom existe déjà'})
      }
      else if(!isValid) {
        return res.status(400).json(errors)
      }

      Company.findByIdAndUpdate(companyId, {
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
        activity: req.body.activity,
        size: req.body.size,
        siret: req.body.siret,
        vat_number: req.body.vat_number,
        billing_address: req.body.billing_address,
        vat_subject: req.body.vat_subject,
      }, {new: true})
        .then(company => {
          if(company) {
            res.json({success: 'Entreprise mise à jour !'})
          }
          else{
            res.json({error: 'Entreprise introuvable'})
          }
        })
        .catch(err => console.error(err))

    })
    .catch(err => console.error(err))
})

// @Route GET /myAlfred/api/companies/account/rib
// Get comppany RIBs
// @Access private
router.get('/account/rib', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  Company.findById(req.company.id)
    .then(company => {
      company.account = {}
      company.account.name = req.body.name
      company.account.bank = req.body.bank
      company.account.bic = req.body.bic
      company.account.iban = req.body.iban


      company.save()
        .then(result => res.json(result))
        .catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

// @Route PUT /myAlfred/api/companies/account/rib
// Edit rib
// @Access private
router.put('/account/rib', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  Company.findById(req.company.id)
    .then(company => {
      company.account = {}
      company.account.name = req.body.name
      company.account.bank = req.body.bank
      company.account.bic = req.body.bic
      company.account.iban = req.body.iban


      company.save()
        .then(result => res.json(result))
        .catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

// @Route POST /myAlfred/api/companies/mambers
// Creates a member in the company
// @Access private
router.post('/members', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const {errors, isValid} = validateCompanyMember(req.body)
  if (!isValid) {
    return res.status(400).json({error: errors})
  }

  User.findOne({email: req.body.email})
    .then(user => {
      if (user) {
        return res.status(400).json({error: EDIT_PROFIL.duplicate_email})
      }
      const company_id = req.user.company
      const newUser= {
        firstname: req.body.firstname,
        name: req.body.name,
        email: req.body.email,
        company: company_id,
        password: crypto.randomBytes(10).toString('hex'),
        roles: [EMPLOYEE],
      }
      User.create(newUser)
        .then(newUser => {
          newUser.populate('company')
          return newUser
        })
        .then(newUser => {
          sendB2BRegistration(newUser, newUser.email, ROLES[EMPLOYEE], newUser.company.name, req)
          res.json(newUser)
        })
        .catch(err => {
          console.error(err)
          res.status(500).json({error: err})
        })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route POST /myAlfred/api/companies/mambers
// Creates a member in the company
// @Access private
router.post('/employees', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  uploadEmployees.single('employees')(req, res, err => {
    if (err) {
      console.error(err)
      res.status(404).json(err)
    }
    else {
      const EXPECTED=['nom', 'prénom', 'email']
      User.find({}, 'email')
        .then(users => {
          const contents = bufferToString(req.file.buffer)
          let records = csv_parse(contents, {columns: true, delimiter: ';'})
          if (!records.length) {
            throw new Error('Aucun employé à importer')
          }
          const fields=Object.keys(records[0])
          if (!lodash.isEqual(fields.sort(), EXPECTED.sort())) {
            throw new Error(`Colonnes ${EXPECTED.join(',')} attendues`)
          }
          let messages=[]
          let emails=new Set()
          records.forEach((r, idx) => {
            r.email=normalize(r.email)
            const err=validateCompanyMember({
              firstname: r['prénom'],
              name: r.nom,
              email: r.email,
            })
            if (!err.isValid) {
              messages.push(`Ligne ${idx+2}:${Object.values(err.errors).join(',')}`)
            }
            if (users.find(u => u.email==r.email)) {
              messages.push(`Ligne ${idx+2}:le compte ${r.email} existe déjà`)
            }
            if (emails.has(r.email)) {
              messages.push(`Ligne ${idx+2}:le mail ${r.email} est déjà présent dans le fichier`)
            }
            emails.add(r.email)
          })
          if (messages.length>0) {
            return res.status(400).json(messages.join('\n'))
          }
          User.insertMany(records.map(r => {
            return {
              firstname: r['prénom'],
              name: r.nom,
              email: r.email,
              password: crypto.randomBytes(10).toString('hex'),
              company: req.user.company,
              roles: [EMPLOYEE],
            }
          }))
            .then(users => {
              Company.findById(req.user.company)
                .then(company => {
                  users.forEach(u => {
                    sendB2BRegistration(u, u.email, ROLES[EMPLOYEE], company.name, req)
                  })
                })
              return res.json(`${users.length} collaborateurs importés`)
            })
            .catch(err => {
              console.error(err)
              return res.status(400).json(err)
            })
        })
        .catch(err => {
          console.error(err)
          return res.status(400).json(`Erreur lors de l'import:${err}`)
        })

    }
  })
})

// @Route DELETE /myAlfred/api/companies/mamber/:member_id
// removes member from the copany
// @Access private
router.delete('/members/:member_id', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const member_id = req.params.member_id

  const company_id = req.user.company
  User.find({company: company_id, roles: {'$in': [ADMIN]}, _id: {$ne: member_id}})
    .then(users => {
      if (users.length==0) {
        return res.status(400).json({error: 'Il doit rester au moins un administrateur'})
      }

      User.findByIdAndUpdate(member_id, {roles: [], company: null})
        .then(user => {
          if (!user) {
            return res.status(404).json({error: 'Utilisateur inconnu'})
          }
          return res.json(user)
        })
        .catch(err => {
          console.error(err)
          res.status(500).json({error: err})
        })

    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route GET /myAlfred/api/companies/members
// Returns all meembers from current company
// @Access private
router.get('/members', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  const company_id = req.user.company

  User.find({company: company_id}, 'firstname name email company roles birthday')
    .then(users => {
      res.json(users)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route PUT /myAlfred/api/companies/representative
// Sets the legal representative to this company
// @Access private
router.put('/representative', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  const company_id = req.user.company
  const representative_id = req.body.representative_id

  Company.findByIdAndUpdate(company_id, {representative: representative_id}, {new: true})
    .populate('representative')
    .then(company => {
      if (!company.representative.birthday) {
        res.status(400).json("Indiquer la date de naissance de l'administrateur")
        return
      }
      createOrUpdateMangoCompany(company)
      res.json(company)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route PUT /myAlfred/api/companies/admins
// Adds an admin to this company
// @Access private
router.put('/admin', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  const company_id = req.user.company
  const admin_id = req.body.admin_id

  const new_account = req.body.new_account

  User.findByIdAndUpdate(admin_id, {company: company_id, $addToSet: {roles: ADMIN}}, {new: true})
    .then(user => {
      if (new_account) {
        axios.post(new URL('/myAlfred/api/users/forgotPassword', computeUrl(req)).toString(), {email: user.email, role: ADMIN})
          .then(() => {})
          .catch(err => {})
      }
      res.json(user)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route PUT /myAlfred/api/companies/admins
// Adds an admin to this company
// @Access private
router.delete('/admin/:admin_id', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  const company_id = req.user.company
  const admin_id = req.params.admin_id

  User.count({company: company_id, roles: {'$in': [ADMIN]}, _id: {$ne: admin_id}})
    .then(remainingAdmins => {
      if (remainingAdmins==0) {
        return res.status(400).json({error: 'Il doit rester au moins un administrateur'})
      }

      User.findByIdAndUpdate(admin_id, {$pull: {roles: ADMIN}}, {new: true})
        .then(user => {
          if (!user) {
            return res.status(404).json({error: 'Utilisateur inconnu'})
          }
          return res.json(user)
        })
        .catch(err => {
          console.error(err)
          res.status(500).json({error: err})
        })

    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route GET /myAlfred/api/companies/billings
// Returns bookings having a billing number for current company
// @Access private
router.get('/billings', passport.authenticate('b2badmin', {session: false}),
  (req, res) => {
    const company_id = req.user.company

    User.find({company: company_id})
      .then(users => {
        const user_ids = users.map(u => u._id)
        Booking.find({
          user: {$in: user_ids},
          user_role: {$in: [ADMIN, MANAGER]},
          $where: 'this.billing_number && this.billing_number.length>0',
        })
          .populate('user')
          .populate('alfred')
          .then(bookings => {
            console.log(bookings.length)
            res.json(bookings)
          })
          .catch(err => {
            console.error(err)
            res.status(500).json({error: err})
          })
      })
      .catch(err => {
        console.error(err)
        res.status(500).json({error: err})
      })
  })

// @Route GET /myAlfred/api/companies/budget/:role
// Returns remaining budget for user_id & role in the period
// @Access private user
router.get('/budget/:user_id/:role', passport.authenticate('jwt', {session: false}), (req, res) => {
  // Chercher Groupe suivant rôle
  // Chercher budget
  // Comptabiliser budget utilisé (company_amount)
  // Soutraction budget/company_amount
  const role = req.params.role
  const user_id = req.params.user_id

  if (role==ADMIN || !role) {
    return Number.MAX_SAFE_INTEGER
  }
  Group.findOne({members: user_id, type: role==MANAGER ? MICROSERVICE_MODE : CARETAKER_MODE})
    .then(group => {
      if (!group) {
        return res.status(400).json('Aucun groupe trouvé pour ce user')
      }
      if (!group.budget) {
        console.log('No budget for the group')
        return res.json(0)
      }
      const start_date = getPeriodStart(group.budget_period)
      const user_predicate = role==MANAGER ? {$in: group.members} : user_id
      Booking.find({
        user: user_predicate,
        date: {$gt: start_date},
        user_role: role,
        status: {$nin: [BOOK_STATUS.REFUSED, BOOK_STATUS.CANCELLED, BOOK_STATUS.EXPIRED, BOOK_STATUS.INFO, BOOK_STATUS.PREAPPROVED]},
      })
        .then(bookings => {
          console.log(`Found ${bookings.length} bookings`)
          const consumed = lodash.sumBy(bookings, b => b.amount)
          const remaining = Math.max(group.budget-consumed, 0)
          return res.json(remaining)
        })
        .catch(err => {
          console.error(err)
          return res.status(400).json(err)
        })
    })
    .catch(err => {
      console.error(err)
      res.status(400).json(err)
    })
})

// @Route GET /myAlfred/api/supported/:user_id/:role
// Returns company amount percent for user_id, service_id & role
// @Access private user
router.get('/supported/:user_id/:service_id/:role', passport.authenticate('jwt', {session: false}), (req, res) => {
  // Chercher Groupe suivant rôle
  // Chercher budget
  // Comptabiliser budget utilisé (company_amount)
  // Soutraction budget/company_amount
  const role = req.params.role
  const user_id = req.params.user_id
  const service_id = req.params.service_id

  if (role==ADMIN) {
    return res.json(1.0)
  }
  if (!role) {
    return res.json(0.0)
  }
  Group.findOne({members: user_id, type: role==MANAGER ? MICROSERVICE_MODE : CARETAKER_MODE})
    .then(group => {
      if (!group) {
        return res.status(400).json('Aucun groupe trouvé pour ce user')
      }
      const allowedService=group.allowed_services.find(a => a.service._id.toString()==service_id)
      if (!allowedService) {
        return res.status(400).json('Service introuvable dans le groupe')
      }
      return res.json(allowedService.supported_percent)
    })
    .catch(err => {
      console.error(err)
      return res.status(400).json(err)
    })
})

module.exports = router
