const express = require('express')
const passport = require('passport')
const moment = require('moment')
const xlsx=require('node-xlsx')
const {EXPRESS_SHIPPING} = require('../../../utils/feurst/consts')
const {validateZipCode} = require('../../validation/order')
const {addItem, computeShipFee} = require('../../utils/commands')
const {getDataFilter, isActionAllowed} = require('../../utils/userAccess')

const router = express.Router()
const Order = require('../../models/Order')
const {validateOrder, validateOrderItem}=require('../../validation/order')
const {ORDER, CREATE, UPDATE, VIEW, DELETE}=require('../../../utils/consts')

moment.locale('fr')

const DATA_TYPE=ORDER
const MODEL=Order

router.get('/addresses', passport.authenticate('jwt', {session: false}), (req, res) => {
  Order.find({...getDataFilter(req.user, DATA_TYPE, VIEW)}, {address: 1})
    .then(orders => {
      const uniques=lodash.uniqBy(orders, lodash.isEqual)
      return res.json(uniques)
    })
})


// @Route GET /myAlfred/api/orders/template
// Returns an order xlsx template for import
// @Access private
router.get('/template', passport.authenticate('jwt', {session: false}), (req, res) => {
  const data = [
    ['Réference', 'Quantité'],
    ['AAAXXXZ', 6],
  ]
  let buffer = xlsx.build([{data: data}])
  res.setHeader('Content-Type', 'application/vnd.openxmlformats')
  res.setHeader('Content-Disposition', 'attachment; filename=order_template.xlsx')
  res.end(buffer, 'binary')
})

// @Route POST /myAlfred/api/orders/
// Add a new order
// @Access private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, CREATE)) {
    return res.status(301)
  }

  const {errors, isValid}=validateOrder(req.body)
  if (!isValid) {
    return res.status(500).json(errors)
  }

  if (!req.body.user) {
    req.body.user=req.user._id
  }

  MODEL.create(req.body)
    .then(data => {
      return res.json(data)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route PUT /myAlfred/api/orders/:id
// Add item to a order {address_id?, reference?}
// @Access private
router.put('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE)) {
    return res.status(301)
  }

  const order_id=req.params.id

  Order.findOneAndUpdate({_id: order_id, ...getDataFilter(req.user, DATA_TYPE, UPDATE)}, req.body, {new: true})
    .then(result => {
      if (!result) {
        return res.status(404).json(`Order #${order_id} not found`)
      }
      if (lodash.isEmpty(result.address) || lodash.isEmpty(result.shipping_mode)) {
        return Promise.resolve(result)
      }
      const department=parseInt(String(zipCode).slice(0, -3))
      return computeShipFee(department, result.total_weight, result.shipping_mode==EXPRESS_SHIPPING)
        .then(fee => {
          return Order.findOneAndUpdate({_id: order_id}, {shipping_fee: fee}, {new: true})
        })
    })
    .then(result => {
      return res.json(result)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})


// @Route PUT /myAlfred/api/orders/:id/item
// Add item to a order {product_id, quantity, discount?}
// @Access private
router.put('/:id/items', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE)) {
    return res.status(301).json()
  }

  const {errors, isValid}=validateOrderItem(req.body)
  if (!isValid) {
    return res.status(500).json(errors)
  }

  const order_id=req.params.id
  const {product, quantity}=req.body

  Order.findOne({_id: order_id, ...getDataFilter(req.user, DATA_TYPE, UPDATE)})
    .then(data => {
      if (!data) {
        console.error(`No order #${order_id}`)
        return res.status(404)
      }
      return addItem(data, product, quantity)
    })
    .then(data => {
      return data.save()
    })
    .then(data => {
      return res.json(data)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route DELETE /myAlfred/api/orders/:id/item
// Removes item from a order
// @Access private
router.delete('/:order_id/items/:item_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE)) {
    return res.status(301)
  }

  const order_id=req.params.order_id
  const item_id=req.params.item_id

  Order.findOneAndUpdate({_id: order_id, ...getDataFilter(req.user, DATA_TYPE, DELETE)}, {$pull: {items: {_id: item_id}}})
    .then(result => {
      if (!result) {
        return res.status(404).json(`Order #${order_id} not found`)
      }
      return res.json()
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/orders
// View all orders
// @Access private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, VIEW)) {
    return res.status(401)
  }

  Order.find(getDataFilter(req.user, DATA_TYPE, VIEW))
    .populate('items.product')
    .then(orders => {
      return res.json(orders)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/orders/:id
// View one booking
// @Access public
router.get('/:order_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, VIEW)) {
    return res.status(301)
  }

  Order.findOne({_id: req.params.order_id, ...getDataFilter(req.user, DATA_TYPE, VIEW)})
    .populate('items.product')
    .then(order => {
      if (order) {
        return res.json(order)
      }
      return res.status(404).json({msg: 'No order found'})
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route DELETE /myAlfred/orders/:id
// Delete one order
// @Access private
router.delete('/:order_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, DELETE)) {
    return res.status(301)
  }

  Order.findOneAndDelete({_id: req.params.order_id, ...getDataFilter(req.user, DATA_TYPE, VIEW)})
    .then(() => {
      return res.json()
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/orders/:id/shipping-fee?zipcode
// Computes shipping fees
// @Access private
router.get('/:id/shipping-fee', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, VIEW)) {
    return res.status(301)
  }

  const zipCode=req.query.zipcode

  const {errors, isValid}=validateZipCode(zipCode)
  if (!isValid) {
    return res.status(500).json(errors)
  }

  const department=parseInt(String(zipCode).slice(0, -3))

  const fee={express: 0, standard: 0}
  let order=null
  Order.findOne({_id: req.params.id, ...getDataFilter(req.user, DATA_TYPE, UPDATE)})
    .populate('items.product')
    .then(result => {
      if (!result) {
        return res.status(404).json()
      }
      order=result
      return computeShipFee(department, order.total_weight, false)
    })
    .then(standard => {
      fee.standard=standard
      return computeShipFee(department, order.total_weight, true)
    })
    .then(express => {
      fee.express=express
      return res.json(fee)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})


module.exports = router
