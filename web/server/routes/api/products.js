const {TEXT_FILTER, createMemoryMulter} = require('../../utils/filesystem')
const Product = require('../../models/Product')
const express = require('express')

const router = express.Router()
const passport = require('passport')
const moment = require('moment')
const {validateProduct}=require('../../validation/product')
const {csvImport}=require('../../utils/import')
moment.locale('fr')

// PRODUCTS
const uploadProducts = createMemoryMulter(TEXT_FILTER)

// @Route GET /myAlfred/api/products
// View all products
// optional ?pattern=XX filters on reference
// @Access private
// router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
router.get('/', (req, res) => {
  const filter=req.query.pattern ? {reference: new RegExp(req.query.pattern, 'i')}: {}
  Product.find(filter)
    .then(products => {
      res.json(products)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/products/:product_id
// View one product
// @Access private
router.get('/:product_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Product.findById(req.params.product_id)
    .then(product => {
      if (!product) {
        return res.status(404).json()
      }
      return res.json(product)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route POST /myAlfred/api/products
// Create a product
// @Access private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const {errors, isValid}=validateProduct(req.body)
  if (!isValid) {
    return res.status(400).json(errors)
  }
  Product.create(req.body, {runValidators: true})
    .then(product => {
      return res.json(product)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route PUT /myAlfred/api/products
// Update a product
// @Access private
router.put('/:product_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Product.findByIdAndUpdate(req.params.product_id, req.body, {runValidators: true, new: true})
    .then(product => {
      if (!product) {
        return res.status(404).json()
      }
      return res.json()
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route DELETE /myAlfred/api/products
// Deletes a product
// @Access private
router.delete('/:product_id', passport.authenticate('jwt', {session: false}), (req, res) => {


  Product.findByIdAndDelete(req.params.product_id, {runValidators: true, new: true})
    .then(product => {
      if (!product) {
        return res.status(404).json()
      }
      return res.json()
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route POST /myAlfred/api/products/import
// Imports products from csv
router.post('/import', passport.authenticate('admin', {session: false}), (req, res) => {
  uploadProducts.single('buffer')(req, res, err => {
    if (err) {
      console.error(err)
      return res.status(404).json({errors: err.message})
    }
    // db field => import field
    const DB_MAPPING={
      'reference': 'Code article',
      'description_2': 'Description 2',
      'production_line': 'Ligne prod.',
      'group': 'Grpe',
      'family': 'Famille',
      'description': 'Description',
      'weight': "Poids d'expédition",
    }

    csvImport(Product, req.file.buffer, DB_MAPPING, {delimiter: ',', key: 'reference'})
      .then(result => {
        res.json(result)
      })
      .catch(err => {
        console.error(err)
        res.status(500).error(err)
      })
  })
})

// @Route POST /myAlfred/api/products/import-price
// Imports prices from csv
router.post('/import-price', passport.authenticate('admin', {session: false}), (req, res) => {
  uploadProducts.single('buffer')(req, res, err => {
    if (err) {
      console.error(err)
      return res.status(404).json({errors: err.message})
    }
    // db field => import field
    const DB_MAPPING={
      'reference': 'CODE ARTICCLE',
      'price': 'PRIX 2022',
    }

    csvImport(Product, req.file.buffer, DB_MAPPING, {delimiter: ',', key: 'reference', update: true})
      .then(result => {
        res.json(result)
      })
      .catch(err => {
        console.error(err)
        res.status(500).error(err)
      })
  })
})

// @Route POST /myAlfred/api/products/import-stock
// Imports stock from csv
router.post('/import-stock', passport.authenticate('admin', {session: false}), (req, res) => {
  uploadProducts.single('buffer')(req, res, err => {
    if (err) {
      console.error(err)
      return res.status(404).json({errors: err.message})
    }
    // db field => import field
    const DB_MAPPING={
      'reference': 'Code article',
      'stock': 'FSTMG',
    }

    csvImport(Product, req.file.buffer, DB_MAPPING, {delimiter: ',', key: 'reference', update: true})
      .then(result => {
        res.json(result)
      })
      .catch(err => {
        console.error(err)
        res.status(500).error(err)
      })
  })
})

module.exports = router
