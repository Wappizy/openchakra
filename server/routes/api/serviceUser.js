const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const ServiceUser = require('../../models/ServiceUser');
const Shop = require('../../models/Shop');
const User = require('../../models/User');
const Availability = require('../../models/Availability');
const axios = require('axios');
const https = require('https');
const multer = require("multer");
const crypto = require('crypto');
const geolib = require('geolib');
const _ = require('lodash');
const moment = require('moment');
const isEmpty = require('../../validation/is-empty');
const {data2ServiceUser} = require('../../../utils/mapping');
const emptyPromise = require('../../../utils/promise');
const { config } = require('../../../config/config');
const { filterServicesGPS} = require('../../../utils/filters');


moment.locale('fr');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/profile/diploma/')
    },
    filename: function (req, file, cb) {
        let datetimestamp = Date.now();
        let key = crypto.randomBytes(5).toString('hex');
        cb(null, datetimestamp + '_' + key + '_' + file.originalname)
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.pdf' && ext !== '.jpeg') {
            return callback(new Error('Error extension'))
        }
        callback(null, true)
    }
});

// @Route POST /myAlfred/api/serviceUser/add
// Connect an alfred to a service
// @Access private
router.post('/add', upload.fields([{ name: 'diploma', maxCount: 1 }, { name: 'certification', maxCount: 1 }]), passport.authenticate('jwt', { session: false }), (req, res) => {


    ServiceUser.findOne({
            user: req.user.id,
            service: req.body.service
        })
        .then(service => {
            const fields = {};
            fields.user = req.user.id;
            fields.service = mongoose.Types.ObjectId(req.body.service);
            fields.city = req.body.city;
            fields.perimeter = req.body.perimeter;
            fields.minimum_basket = req.body.minimum_basket;
            fields.deadline_before_booking = req.body.deadline_before_booking;
            fields.prestations = JSON.parse(req.body.prestations);
            fields.option = JSON.parse(req.body.option);
            fields.experience_years = req.body.experience_years;
            if (req.body.graduated === 'true') {
                fields.graduated = true;
            }
            else {
                fields.graduated = false;
            }

            const diploma = 'diploma';
            const certification = 'certification';
            if (diploma in req.files) {
                fields.diploma = {};
                fields.diploma.name = req.body.diplomaLabel;
                fields.diploma.year = req.body.diplomaYear;
                fields.diploma.file = req.files['diploma'][0].path;
            }
            else {
                console.log(req.files);
                console.log('No file uploaded');
            }
            if (req.body.is_certified === 'true') {
                fields.is_certified = true;
            }
            else {
                fields.is_certified = false;
            }
            if (certification in req.files) {
                fields.certification = {};
                fields.certification.name = req.body.certificationLabel;
                fields.certification.year = req.body.certificationYear;
                fields.certification.file = req.files['certification'][0].path;
            }
            else {
                console.log('No file uploaded');
            }
            fields.description = req.body.description;
            fields.equipments = JSON.parse(req.body.equipments);
            fields.majoration = {};
            if (req.body.active === 'true') {
                fields.majoration.active = true;
            }
            else {
                fields.majoration.active = false;
            }

            fields.service_address = {};
            fields.service_address.address = req.body.address;
            fields.service_address.zip_code = req.body.zip_code;
            fields.service_address.city = req.body.city;
            fields.service_address.country = req.body.country;

            fields.service_address.gps = {};
            fields.service_address.gps.lat = req.body.lat;
            fields.service_address.gps.lng = req.body.lng;

            fields.majoration.price = parseInt(req.body.price);
            fields.location = {}
            fields.location.home = req.body.home === 'true';
            fields.location.alfred = req.body.alfred === 'true';
            fields.location.visio = req.body.visio === 'true';

            fields.travel_tax = req.body.travel_tax === "null" ? null : req.body.travel_tax;
            fields.pick_tax = req.body.pick_tax === "null" ? null : req.body.pick_tax;

            const newService = new ServiceUser(fields);
            newService.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(error => {
            console.log(error)
        });
});

// @Route POST /myAlfred/api/serviceUser/myShop/add
// SAU : Add serviceUser in the shop
// @Access private
router.post('/myShop/add', upload.fields([{ name: 'file_diploma', maxCount: 1 }, { name: 'file_certification', maxCount: 1 }]), passport.authenticate('jwt', { session: false }), (req, res) => {

    console.log("myShop/add received:" + JSON.stringify(req.body));

    req.body.prestations=JSON.parse(req.body.prestations);
    req.body.equipments=JSON.parse(req.body.equipments);
    ServiceUser.findOne({ user: req.user.id, service: req.body.service })
        .then(su => {

            if (su) {
                return res.status(400).json({
                    msg: "Ce service existe déjà"
                });
            }
            const data = req.body;
            var su = data2ServiceUser(data, new ServiceUser()); 
            su.user = req.user.id;

            // FIX : créer les prestations custom avant
            let newPrestations = Object.values(req.body.prestations).filter(p => p._id == null);
            let newPrestaModels = newPrestations.map(p => Prestation({ ...p, service: req.body.service, billing: [p.billing], filter_presentation: null, private_alfred: req.user.id }));

            const r = newPrestaModels.length > 0 ? Prestation.collection.insert(newPrestaModels) : emptyPromise({ insertedIds: [] });
            r.catch(error => console.log("Error insert many" + JSON.stringify(error, null, 2)))
             .then(result => {
               var newIds = result.insertedIds;
               // Update news prestations ids
               newPrestations.forEach((p, idx) => { p._id = newIds[idx]; console.log("Presta sauvegardée : " + JSON.stringify(p)); });
               Object.values(req.body.prestations).forEach(presta => {
                 const newp = { prestation: presta._id, billing: presta.billing, price: presta.price };
                 su.prestations.push(newp);
               });
               
               su.save().then((su) => {
                 Shop.findOne({ alfred: req.user.id })
                   .then(shop => {
                     shop.services.unshift(su._id);
                     shop.save().then(newShop => res.json(su)).catch(err => console.log(err));
                   })
                   .catch(error => console.log(error))
                })
                .catch(err => console.log(err));
             })


        })
        .catch(error => {
            console.log(error)
        });
});

// @Route PUT /myAlfred/api/serviceUser/editStatus
// Update status serviceUser
// @Access private
router.put('/editStatus',passport.authenticate('jwt',{session:false}),(req,res) => {
    ServiceUser.updateMany({user: req.user.id},{status:req.body.status})
        .then(serviceUser => {
            res.json(serviceUser)
        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/serviceUser/edit/:id
// Update a serviceUser
// SAU : Update serviceUser in the shop
// @Access private
router.put('/edit/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    console.log("Update ServiceUser, received:" + JSON.stringify(req.body, null, 2));
    req.body.prestations=JSON.parse(req.body.prestations);
    req.body.equipments=JSON.parse(req.body.equipments);

    ServiceUser.findById(req.params.id)
        .then(serviceUser => {
            let data = req.body;

            su = data2ServiceUser(data, serviceUser);
            su.prestations = [];

            // FIX : créer les prestations custom avant
            let newPrestations = Object.values(req.body.prestations).filter(p => p._id == null);
            let newPrestaModels = newPrestations.map(p => Prestation({ ...p, service: req.body.service, billing: [p.billing], filter_presentation: null, private_alfred: req.user.id }));

            const r = newPrestaModels.length > 0 ? Prestation.collection.insert(newPrestaModels) : emptyPromise({ insertedIds: [] });
            r.catch(error => console.log("Error insert many" + JSON.stringify(error, null, 2)))
             .then(result => {
               var newIds = result.insertedIds;
               // Update news prestations ids
               newPrestations.forEach((p, idx) => { p._id = newIds[idx]; console.log("Presta sauvegardée : " + JSON.stringify(p)); });
               Object.values(req.body.prestations).forEach(presta => {
                 const newp = { prestation: presta._id, billing: presta.billing, price: presta.price };
                 su.prestations.push(newp);
               });     
               su.save().then((su) => {
                  res.json(su); 
                })
             })

        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/serviceUser/editWithCity/:id
// Update a serviceUser
// @Access private
router.put('/editWithCity/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {

            serviceUser.prestations = req.body.prestations;
            serviceUser.option = req.body.options;
            serviceUser.service_address.address = req.body.address;
            serviceUser.service_address.zip_code = req.body.zip_code;
            serviceUser.service_address.city = req.body.city;
            serviceUser.service_address.country = req.body.country;
            serviceUser.service_address.gps.lat = req.body.lat;
            serviceUser.service_address.gps.lng = req.body.lng;
            serviceUser.perimeter = req.body.perimeter;
            serviceUser.minimum_basket = req.body.minimum_basket;
            serviceUser.deadline_before_booking = req.body.deadline_before_booking;
            serviceUser.equipments = req.body.equipments;
            serviceUser.description = req.body.description;
            serviceUser.level = req.body.level;


            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/serviceUser/addPrestation
// Add a prestation for a service
// @Access private
router.put('/addPrestation/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {


            const newPrestation = {
                prestation: mongoose.Types.ObjectId(req.body.prestation),
                price: req.body.price
            };
            serviceUser.prestations.unshift(newPrestation);


            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/serviceUser/editPrestation
// Edit the price of a prestation for a service
// @Access private
router.put('/editPrestation/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {


            const index = serviceUser.prestations
                .map(item => item.id)
                .indexOf(req.body.prestation);

            serviceUser.prestations[index].price = req.body.price;


            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => console.log(err))
});

// @Route POST /myAlfred/api/serviceUser/addDiploma/:id
// Add a diploma for a service
// @Access private
router.post('/addDiploma/:id', upload.single('file_diploma'), passport.authenticate('jwt', { session: false }), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {
            serviceUser.diploma.name = req.body.name;
            serviceUser.diploma.year = req.body.year;
            const diploma = 'file_diploma';
            console.log("Diploma req.file:"+JSON.stringify(req.file));
            if (req.file !== undefined && req.file !== null) {
                serviceUser.diploma.file = req.file.path;
            }
            serviceUser.graduated = true;

            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));
        })
        .catch(err => console.log(err))
});

// @Route POST /myAlfred/api/serviceUser/addCertification/:id
// Add a certification for a service
// @Access private
router.post('/addCertification/:id', upload.single('file_certification'), passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {
            serviceUser.certification.name = req.body.name;
            serviceUser.certification.year = req.body.year;
            if (req.file !== undefined) {
                serviceUser.certification.file = req.file.path;
            }
            serviceUser.is_certified = true;

            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));
        })
        .catch(err => console.log(err))
});

// @Route GET /myAlfred/api/serviceUser/all
// View all service per user
// @Access private
router.get('/all', (req, res) => {

    ServiceUser.find()
        .populate('user','-id_card')
        .populate('service')
        .then(service => {
            if (typeof service !== 'undefined' && service.length > 0) {
                res.json(service);
            }
            else {
                return res.status(400).json({
                    msg: 'No service found'
                });
            }

        })
        .catch(err => res.status(404).json({
            service: 'No service found'
        }));
});

// @Route GET /myAlfred/api/serviceUser/all/category/:category
// View all service user per category
// @Access private
router.get('/all/category/:category',(req,res)=> {
    let allServices = [];
    ServiceUser.find()
        .populate('user','-id_card')
        .populate('service')
        .then(service => {
            if(typeof service !== 'undefined' && service.length > 0){
                service.forEach(e => {
                    if (e.service.category == req.params.category) {
                        allServices.push(e)
                    }
                });
            } else {
                return res.status(400).json({msg: 'No service found'});
            }
            res.json(allServices);

        })
        .catch(err => res.status(404).json({ service: 'No service found' }));
});

// @Route GET /myAlfred/api/serviceUser/category/:id
// Count number of service per category
router.get('/category/:id', (req, res) => {

    ServiceUser.find()
        .populate('user','-id_card')
        .populate('service')
        .then(service => {
            if (typeof service !== 'undefined' && service.length > 0) {
                service.forEach(e => {
                    if (e.service.category == req.params.id) {
                        res.json({
                            length: service.length
                        })
                    }
                    else {
                        res.json({
                            length: 0
                        })
                    }
                });
            }
            else {
                return res.status(400).json({
                    msg: 'No service found'
                });
            }

        })
        .catch(err => console.log(err));
});

// @Route GET /myAlfred/api/serviceUser/near
// View all service by city
// @Access private
router.get('/near', passport.authenticate('jwt', { session: false }), (req, res) => {

    User.findById(req.user.id)
        .then(user => {
            ServiceUser.find()
                .populate('user','-id_card')
                .populate('service')
                .then(service => {
                    const gps = user.billing_address.gps;
                    const latUser = gps.lat;
                    const lngUser = gps.lng;
                    const allService = [];
                    service.forEach(e => {
                        //console.log("Service:"+e.perimeter,JSON.stringify(service));
                        const gpsAlfred = e.service_address.gps;
                        //console.log("GPS service:"+JSON.stringify(gpsAlfred));
                        const latAlfred = gpsAlfred.lat;
                        const lngAlfred = gpsAlfred.lng;
                        if (latAlfred==null || lngAlfred==null) {
                          //console.warn("Incorect GPS in "+e._id+":"+JSON.stringify(gpsAlfred));
                        }
                        else {

                          /*const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(e.perimeter*1000));

                          if(!isNear) {
                            const removeIndex = service.findIndex(i => i._id == e._id);
                            service.splice(removeIndex, 1);
                          }*/
                          var distance = geolib.convertDistance( geolib.getDistance( {latitude:latUser,longitude:lngUser}, {latitude:latAlfred, longitude: lngAlfred}), 'km').toFixed(2);
                          if(distance < e.perimeter) {
                            allService.push(e)
                          }
                        }

                    });
                    console.log("Got services:"+allService.length);
                    res.json(allService);

                })
                .catch(err => { console.log(err); res.status(404).json({ service: 'No service found' })});
        });

});

// @Route GET /myAlfred/api/serviceUser/near/:service
// View all serviceUser by address and service
// @Access private
router.get('/near/:service',passport.authenticate('jwt',{session:false}),(req,res)=> {

    User.findById(req.user.id)
        .then(user => {
            ServiceUser.find({service:req.params.service})
                .populate('user','-id_card')
                .populate('service')
                .then(service => {
                    const gps = user.billing_address.gps;
                    const latUser = gps.lat;
                    const lngUser = gps.lng;

                    service.forEach(e => {
                        const gpsAlfred = e.service_address.gps;
                        const latAlfred = gpsAlfred.lat;
                        const lngAlfred = gpsAlfred.lng;

                        const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(e.perimeter*1000));

                        if(!isNear) {
                            const removeIndex = service.findIndex(i => i._id === e._id);
                            service.splice(removeIndex, 1);
                        }




                    });

                    res.json(service);

                })
                .catch(err => res.status(404).json({ service: 'No service found' }));
        });

});

// @Route POST /myAlfred/api/serviceUser/search
// Search serviceUser according to optional coordinates, dates, etc...
// FIX : filter availabilities
// FIX : filter status (pro or individual)
// TODO : include services if visio or @alfred
router.post('/search',(req,res)=> {

    url = "https://"+req.headers.host;
    console.log("ServiceUSer search with filter:"+JSON.stringify(req.body));
    const instance = axios.create({
      httpsAgent: new https.Agent({rejectUnauthorized: false})
    });

    var kwUrl = `${url}/myAlfred/api/service/keyword/${req.body.keyword}`;
    var keywordPromise = 'keyword' in req.body ?  instance.get(kwUrl) : emptyPromise({data: null});

    var datesPromise = emptyPromise({data: null});
    if ('startDate' in req.body || 'endDate' in req.body) {
      const begin = req.body.startDate || null;
      const end = req.body.endDate || null;
      const beginDay =  begin ? moment(begin).format('dddd') : null;
      const endDay =  end ? moment(end).format('dddd') : null;

      const obj = {begin,end,beginDay,endDay};

      datesPromise=axios.post(url+'/myAlfred/api/availability/filterDate',obj) 
    }

    keywordPromise.then( result => {
      var allowedServices=result.data;
      // Result is object category => [arr of services] or null
      if (allowedServices!=null) {
        allowedServices= Object.values(allowedServices);
        if (allowedServices.length>0) {
          allowedServices=allowedServices.reduce( (acc, arr) => acc.concat(arr));
          allowedServices=allowedServices.map( service => service.id.toString());
        }
      }
      ServiceUser.find()
        .populate('user','-id_card')
        .populate({
            path: 'service',
            populate: {
                path: 'category'
            }
        })
        .then(services => {
          if ('gps' in req.body) {
            services = filterServicesGPS(services, req.body.gps);
          }
          if (allowedServices!=null) {
            services = services.filter( su => allowedServices.includes(su.service._id.toString()) );
          }
          if ('category' in req.body) {
            console.log(services[0].service.category);
            services = services.filter( su => su.service.category._id==req.body.category );
          }
          console.log("Returned services:"+services.length);
          res.json(services);
        })
        .catch(err => { console.error(err); res.status(404).json({ service: 'No service found' })});
    });
});

// @Route GET /myAlfred/api/serviceUser/near/:city
// View all serviceUser by city
router.post('/nearCity',(req,res)=> {
    const dat = req.body.city;
    const data = dat.replace(new RegExp(/[eéèêaàoôuù]/g), "[eéèêaàoôuù]");
            ServiceUser.find({'service_address.city':{ $regex : data, $options : 'i' }})
                .populate('user','-id_card')
                .populate('service')
                .then(service => {
                    res.json(service);
                })
                .catch(err => res.status(404).json({ service: 'No service found' }));

});

// @Route GET /myAlfred/api/serviceUser/nearOther
// View all service around other address
// @Access private
router.get('/nearOther/:id',passport.authenticate('jwt',{session:false}),(req,res)=> {

    User.findById(req.user.id)
        .then(user => {
            ServiceUser.find()
                .populate('user','-id_card')
                .populate('service')
                .then(service => {
                    const addressIndex = user.service_address.findIndex(i =>i._id == req.params.id);
                    const gps = user.service_address[addressIndex];
                    const latUser = gps.lat;
                    const lngUser = gps.lng;
                    const allService = [];

                    service.forEach(e => {
                        const gpsAlfred = e.service_address.gps;
                        const latAlfred = gpsAlfred.lat;
                        const lngAlfred = gpsAlfred.lng;

                        /*const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(e.perimeter*1000));

                        if(!isNear) {
                            const removeIndex = service.findIndex(i => i._id === e._id);
                            service.splice(removeIndex, 1);
                        }*/
                        if(geolib.convertDistance(
                            geolib.getDistance(
                                {latitude:latUser,longitude:lngUser},
                                {latitude:latAlfred, longitude: lngAlfred}
                            ),
                            'km'
                        ).toFixed(2) < e.perimeter) {
                            allService.push(e)
                        }
                    });
                    res.json(allService);
                })
                .catch(err => res.status(404).json({ service: 'No service found' }));
        });

});

// @Route GET /myAlfred/api/serviceUser/all/:service
// View all serviceUser by service
// @Access private
router.get('/all/nearOther/:id/:service',passport.authenticate('jwt',{session:false}),(req,res)=> {

    User.findById(req.user.id)
        .then(user => {
            ServiceUser.find({service: req.params.service})
                .populate('user','-id_card')
                .populate('service')
                .then(service => {
                    const addressIndex = user.service_address.findIndex(i =>i._id == req.params.id);
                    const gps = user.service_address[addressIndex];
                    const latUser = gps.lat;
                    const lngUser = gps.lng;

                    service.forEach(e => {
                        const gpsAlfred = e.service_address.gps;
                        const latAlfred = gpsAlfred.lat;
                        const lngAlfred = gpsAlfred.lng;

                        const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(e.perimeter*1000));

                        if(!isNear) {
                            const removeIndex = service.findIndex(i => i._id === e._id);
                            service.splice(removeIndex, 1);
                        }
                    });
                    res.json(service);
                })
                .catch(err => res.status(404).json({
                    service: 'No service found'
                }));
        });

});

// @Route GET /myAlfred/api/serviceUser/home
// View service for home
// @Access private
router.get('/home', (req, res) => {

    ServiceUser.find()
        .populate('user',['picture','firstname'])
        .populate('service')
        .then(service => {
            if (typeof service !== 'undefined' && service.length > 0) {
                res.json(service);
            }
            else {
                return res.status(400).json({
                    msg: 'No service found'
                });
            }

        })
        .catch(err => res.status(404).json({
            service: 'No service found'
        }));
});

// @Route GET /myAlfred/api/serviceUser/currentAlfred
// View all service for the current alfred
// @Access private
router.get('/currentAlfred', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    ServiceUser.find({
            user: req.user.id
        })
        .populate('service')
        .populate('user')
        .populate({
            path: 'service',
            populate: {
                path: 'category'
            }
        })
        .populate('prestations.prestation')
        .populate('equipments')
        .then(service => {
            if (Object.keys(service).length === 0 && service.constructor === Object) {
                return res.status(400).json({
                    msg: 'No service found'
                });
            }
            else {
                res.json(service);
            }

        })
        .catch(err => res.status(404).json({
            service: 'No service found'
        }));
});

// @Route POST /myAlfred/api/serviceUser/home/search
// Get services with home search
// @Access private
router.post('/home/search',(req,res)=> {
    const service = req.body.service;
    const serviceLabel = req.body.serviceLabel;
    const city = req.body.city;
    const date = req.body.date;
    const dateISO = req.body.dateISO;
    const hour = parseInt(req.body.hour.slice(0,2));
    const allServices = [];
    const day = req.body.day.toLowerCase();

    ServiceUser.find({service: service,'service_address.city':city})
        .populate('service')
        .populate('user','-id_card')
        .populate({path: 'service', populate: { path: 'category' }})
        .then(serviceUser => {
            serviceUser.forEach(s => {
                Availability.find({user:s.user._id})
                    .then(a => {

                        a.forEach(p => {

                            if(!p.period.active && p[day].event.length){
                                p[day].event.forEach(z => {
                                    const begin = new Date(z.begin).getHours();
                                    const end = new Date(z.end).getHours();
                                    if(hour >= begin && hour <= end){

                                        if(z.all_services === true){
                                            allServices.push(s);

                                        } else {
                                            z.services.forEach(t => {
                                                if(t.label === serviceLabel){

                                                    allServices.push(s);
                                                }
                                            })
                                        }
                                    }
                                })
                            } else {
                                let begin = p.period.month_begin;
                                let end = p.period.month_end;
                                const between = moment(new Date(dateISO)).isBetween(begin,end);
                                if(between && p[day].event.length){
                                    p[day].event.forEach(z => {
                                        const begin = new Date(z.begin).getHours();
                                        const end = new Date(z.end).getHours();
                                        if(hour >= begin && hour <= end){
                                            if(z.all_services){
                                                allServices.push(s)
                                            } else {
                                                z.services.forEach(t => {
                                                    if(t.label === serviceLabel){
                                                        allServices.push(s)
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    })
                    .catch(errors => console.log(errors))
            });
            res.json(allServices);

        })
        .catch(err => res.status(404).json({ service: 'No service found' }));
});


// @Route GET /myAlfred/api/serviceUser/:id
// View one serviceUser
// @Access private
router.get('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    ServiceUser.findById(req.params.id)
        .populate('user','-id_card')
        .populate('service')
        .populate({
            path: 'prestations.prestation',
            populate: {
                path: 'filter_presentation'
            }
        })
        .populate('equipments')
        .populate('service.equipments')
        .then(service => {
            if (Object.keys(service).length === 0 && service.constructor === Object) {
                return res.status(400).json({
                    msg: 'No service found'
                });
            }
            else {
                res.json(service);
            }

        })
        .catch(err => res.status(404).json({
            service: 'No service found'
        }));
});

// @Route GET /myAlfred/api/serviceUser/:id
// View one serviceUser
// @Access private
router.get('/allUserServices/:id', (req, res) => {
    let userId = mongoose.Types.ObjectId(req.params.id);
    ServiceUser.find({user: userId})
        .populate('service')
        .then(services => {
            res.json(services);
        })
        .catch(err => console.log(err))
})


// @Route PUT /myAlfred/serviceUser/deletePrestation/:id
// Delete one prestation from the list
// @Access private
router.put('/deletePrestation/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {
            const removeIndex = serviceUser.prestations
                .map(item => item.id)
                .indexOf(req.body.prestation);

            serviceUser.prestations.splice(removeIndex, 1);


            serviceUser.save().then(list => res.json(list));
        })
        .catch(err => res.status(404).json(err));
});

// @Route PUT /myAlfred/api/serviceUser/views/:id
// Update number of views for a service
router.put('/views/:id', (req, res) => {
    ServiceUser.findByIdAndUpdate(req.params.id, {
            $inc: {
                number_of_views: 1
            }
        }, {
            new: true
        })
        .then(service => {
            if (!service) {
                return res.status(400).json({
                    msg: 'No service found'
                });
            }
            res.json(service);

        })
        .catch(err => res.status(404).json({
            user: 'No service found'
        }));
});

// @Route DELETE /myAlfred/api/serviceUser/delete/diploma/:id
// Delete diploma for a service
// @Access private
router.delete('/delete/diploma/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(services => {
            services.diploma = undefined;
            services.graduated = false;

            services.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => res.status(404).json({
            servicenotfound: 'No service found'
        }));
});

// @Route DELETE /myAlfred/api/serviceUser/delete/certification/:id
// Delete certification for a service
// @Access private
router.delete('/delete/certification/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(services => {
            services.certification = undefined;
            services.is_certified = false;

            services.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => res.status(404).json({
            servicenotfound: 'No service found'
        }));
});

// @Route DELETE /myAlfred/api/serviceUser/current/allServices
// Delete all the service for an alfred
// @Access private
router.delete('/current/allServices', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.deleteMany({
            user: req.user.id
        })
        .then(() => {
            res.json({
                success: true
            });

        })
        .catch(err => res.status(404).json({
            servicenotfound: 'No service found'
        }));
});

// @Route DELETE /myAlfred/api/serviceUser/:id
// Delete a service for an alfred
// @Access private
router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(event => {
            event.remove().then(() => {
                Shop.findOne({
                        alfred: req.user.id
                    })
                    .then(shop => {
                        const removeIndex = shop.services
                            .indexOf(req.params.id);

                        shop.services.splice(removeIndex, 1);


                        shop.save().then(newShop => res.json(newShop)).catch(err => console.log(err));
                    })
            });
        })
        .catch(err => res.status(404).json({
            eventnotfound: 'No event found'
        }));
});


module.exports = router;
