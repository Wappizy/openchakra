const express = require('express');
const router = express.Router();
const passport = require('passport');
const _ = require('lodash');

const Service = require('../../models/Service');
const Category = require('../../models/Category');
const Prestation = require('../../models/Prestation');
const Job = require('../../models/Job');
const ServiceUser = require('../../models/ServiceUser');
router.get('/test', (req, res) => res.json({msg: 'Service Works!'}));

const mongoose = require('mongoose');
const {createQuery} = require('../../../utils/text');

// @Route GET /myAlfred/api/service/all
// View all service
router.get('/all', (req, res) => {
  Service.find()
    .sort({'label': 1})
    .populate('tags')
    .populate('equipments')
    .populate('category')
    .then(service => {
      if (typeof service !== 'undefined' && service.length > 0) {
        res.json(service);
      } else {
        return res.status(400).json({msg: 'No service found'});
      }
    })
    .catch(err => res.status(404).json({service: 'No service found'}));
});

// @Route GET /myAlfred/api/service/pro
// View all pro service
router.get('/pro', (req, res) => {
  Service.find({ professional_access: true}, 'label')
  .sort({'label': 1})
    .then(services => {
      if (typeof services !== 'undefined' && services.length > 0) {
        res.json(services);
      } else {
        return res.status(400).json({msg: 'No service found'});
      }
    })
    .catch(err => res.status(404).json({service: 'No service found'}));
});

// @Route GET /myAlfred/api/service/allCount
// View all service with count of serviceUser
router.get('/allCount', (req, res) => {
  // FIX : only for Mongo V4
  /**
   Service.aggregate().lookup({
    from: "serviceusers", localField: "_id", foreignField: "service", as:'serviceusers'
    })
   .then(services => {
      if(typeof services !== 'undefined' && services.length > 0){
        var counts=[]
        services.forEach( s => {
          counts.push({ _id: s._id, label: `${s.label} (${s.serviceusers.length})` })
        });
        res.json(counts)
      }
      else {
        return res.status(400).json({msg: 'No service found'});
      }
    })
   .catch(err => {
      console.error(err)
      res.status(404).json({ service: 'No service found' })
    });
   */
  Service.find({})
    .sort({label: 1})
    .then(services => {
      ServiceUser.find({})
        .then(sus => {
          var counts = [];
          services.forEach(service => {
            const suCount = sus.filter(su => su.service._id.equals(service._id)).length;
            counts.push({_id: service._id, label: `${service.label} (${suCount})`});
          });
          res.json(counts);
        })
        .catch(err => {
          console.error(err);
          res.status(404).json({service: 'No service found'});
        });
    })
    .catch(err => {
      console.error(err);
      res.status(404).json({service: 'No service found'});
    });
});

// @Route GET /myAlfred/api/service/random/home
// View random service homepage
router.get('/random/home', (req, res) => {

  Service.countDocuments().exec(function (err, count) {

    let limitrecords = 6;

    function getRandomArbitrary(min, max) {
      return Math.ceil(Math.random() * (max - min) + min);
    }

    let skipRecords = getRandomArbitrary(1, count - limitrecords);

    let random = Math.floor(Math.random() * count);


    Service.find().populate('category').limit(6).skip(random).exec(
      function (err, result) {

        res.json(result);
      });
  });


});

// @Route GET /myAlfred/api/service/:id
// View one service
router.get('/:id', (req, res) => {

  Service.findById(req.params.id)
    .populate('tags')
    .populate('equipments')
    .populate('category')
    .then(service => {
      if (Object.keys(service).length === 0 && service.constructor === Object) {
        return res.status(400).json({msg: 'No service found'});
      } else {
        res.json(service);
      }

    })
    .catch(err => res.status(404).json({service: 'No service found'}));

});

// @Route GET /myAlfred/api/service/all/:category
// View all service per category
router.get('/all/:category', (req, res) => {

  Service.find({category: req.params.category})
    .sort({'label': 1})
    .populate('tags')
    .populate('equipments')
    .populate('category')
    .then(service => {
      if (typeof service !== 'undefined' && service.length > 0) {
        res.json(service);
      } else {
        return res.status(400).json({msg: 'No service found'});
      }

    })
    .catch(err => res.status(404).json({service: 'No service found'}));

});

// @Route GET /myAlfred/api/service/currentAlfred/:category
// View all service per category filtered by already provided Alfred's services
router.get('/currentAlfred/:category', passport.authenticate('jwt', {session: false}), async (req, res) => {

  let serviceUsers = await ServiceUser.find({user: req.user});
  serviceUsers = serviceUsers.map(s => s.service);

  Service.find({category: req.params.category, _id: {$nin: serviceUsers}})
    .sort({'label': 1})
    .populate('tags')
    .populate('equipments')
    .populate('category')
    .then(services => {
      if (typeof services !== 'undefined' && services.length > 0) {
        res.json(services);
      } else {
        return res.status(400).json({msg: 'No service found'});
      }

    })
    .catch(err => res.status(404).json({service: 'No service found:error'}));

});

// @Route GET /myAlfred/api/service/all/tags/:tags
// View all service per tags
router.get('/all/tags/:tags', (req, res) => {

  Service.find({tags: req.params.tags})
    .sort({'label': 1})
    .populate('tags')
    .populate('equipments')
    .populate('category')
    .then(service => {
      if (typeof service !== 'undefined' && service.length > 0) {
        res.json(service);
      } else {
        return res.status(400).json({msg: 'No service found'});
      }

    })
    .catch(err => res.status(404).json({service: 'No service found'}));

});

// @Route GET /myAlfred/api/service/keyword/:kw
// Get services by keyword
// Search into category(label/description), service(label/description/job), prestation(label/dsecription)
// Return { category_name : { services} }
router.get('/keyword/:kw', (req, res) => {

  const kw = req.params.kw;

  console.log(`Search service keyword:${kw}`);
  var result = {};
  var keywords = {};
  var query = createQuery(kw)
  // Exclude private prestations
  query['private_alfred']=null
  Category.find(query)
    .then(categories => {
        Service.find({$or: [{category: {$in: categories.map(c => c._id)}}, query]})
          .populate('category')
          .then(services => {
            services.forEach(s => {
              result[s.category.label] ? result[s.category.label].push({
                label: s.label,
                id: s._id,
              }) : result[s.category.label] = [{label: s.label, id: s._id}];
              let key = s.category.label + s.label;
              keywords[key] ? keywords[key].push(s.category.label) : keywords[key] = [s.category.label];
            });
            Prestation.find(query)
              .populate({path: 'service', populate: {path: 'category'}}).then(prestations => {
              prestations.forEach(p => {
                let s = p.service;
                result[s.category.label] ? result[s.category.label].push({
                  label: s.label,
                  id: s._id,
                }) : result[s.category.label] = [{label: s.label, id: s._id}];
                let key = s.category.label + s.label;
                keywords[key] ? keywords[key].push(p.label) : keywords[key] = [p.label];
              });
              Prestation.find()
                .populate({path: 'service', populate: {path: 'category'}})
                .populate({path: 'job', match: query})
                .then(prestations => {
                  prestations.forEach(p => {
                    if ('job' in p && p['job'] != null) {
                      let s = p.service;
                      result[s.category.label] ? result[s.category.label].push({
                        label: s.label,
                        id: s._id,
                      }) : result[s.category.label] = [{label: s.label, id: s._id}];
                      let key = s.category.label + s.label;
                      keywords[key] ? keywords[key].push(p['job'].label) : keywords[key] = [p['job'].label];
                    }
                  });
                  Object.keys(result).forEach(k => {
                    result[k] = _.uniqWith(result[k], _.isEqual);
                    result[k] = _.sortBy(result[k], ['label']);
                  });
                  var ordered = {};
                  Object.keys(result).sort().forEach(key => {
                    result[key].forEach(s => {
                      s.keywords = _.uniqWith(keywords[key + s.label], _.isEqual);
                    });
                    ordered[key] = result[key];
                  });
                  result = ordered;

                  res.json(result);
                });

            });
          });
      },
    )
    .catch((err) => {
      console.error(err);
      res.json('Error:' + JSON.stringify(err));
    });
});

module.exports = router;
