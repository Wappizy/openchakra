const {
  EVENT_STATUS,
  EVENT_VAT_RATE,
  FUMOIR_MEMBER,
  MAX_EVENT_GUESTS,
  PAYMENT_STATUS,
  PAYMENT_SUCCESS,
  PLACES,
  ROLES,
} = require('../../../../utils/fumoir/consts');
const { initiatePayment } = require('../../../plugins/payment/vivaWallet');
const Payment = require('../../../models/Payment');
const { addAction } = require('../actions');
const mongoose = require('mongoose')
const lodash=require('lodash')
const moment=require('moment')
const {
  declareComputedField,
  declareEnumField,
  declareVirtualField,
  getModel,
  setFilterDataUser,
  setPostCreateData,
  setPreCreateData,
  setPreprocessGet,
} = require('../../database')
const UserSessionData = require('../../../models/UserSessionData')
const User = require('../../../models/User')
const Booking = require('../../../models/Booking')
const {generate_id} = require('../../../../utils/consts')
const Message = require('../../../models/Message')
const Guest = require('../../../models/Guest')
const {BadRequestError, NotFoundError} = require('../../errors')
const OrderItem = require('../../../models/OrderItem')
const Product = require('../../../models/Product')
const Event = require('../../../models/Event')

const inviteGuest = ({eventOrBooking, email, phone}, user) => {
  return getModel(eventOrBooking)
    .then(modelName => {
      if (!['booking', 'event'].includes(modelName)) {
        throw new BadRequestError(`Found model ${modelName} for ${eventOrBooking}, should be event or booking`)
      }
      if (modelName=='booking') {
        return Booking.findById(eventOrBooking)
          .populate('guests')
          .then(booking => {
            if (booking.guests.find(g => g.email==email)) {
              throw new BadRequestError(`${email} est déjà invité pour cet événement`)
            }
            if (booking.guests.length>=booking.guests_count) {
              throw new BadRequestError(`Vous avez déjà envoyé ${booking.guests.length} invitations`)
            }
            return Guest.create({email, phone})
              .then(guest => {
                booking.guests.push(guest._id)
                return booking.save()
              })
          })
        return Guest.create({email, phone})
          .then(guest => Booking.findByIdAndUpdate(eventOrBooking, {$push: {guests: guest}}))
      }
      if (modelName=='event') {
        return UserSessionData.findOneAndUpdate({user: user._id},
          {user: user._id},
          {upsert: true, runValidators: true, new: true},
        )
          .populate({path: 'guests', populate: 'guest'})
          .then(r => {
            // Must not invite the same email twice
            if (r.guests.find(g => g.guest.email==email)) {
              throw new BadRequestError(`${email} est déjà invité pour cet événement`)
            }
            // Must not invite too many people
            const actualGuestsCount=r.guests.filter(g => g.event._id.toString()==eventOrBooking).length
            if (actualGuestsCount+1>MAX_EVENT_GUESTS) {
              throw new BadRequestError(`Le nombre d'invités maximum est ${MAX_EVENT_GUESTS} pour un événement`)
            }
            return getEventGuestsCount(user, null, {_id: eventOrBooking})
              .then(count => {
                if (actualGuestsCount+1>count) {
                  throw new BadRequestError(`Nombre d'invités (${count}) déjà atteint`)
                }
                return Guest.create({email, phone})
                  .then(guest => {
                    r.guests.push({event: eventOrBooking, guest: guest._id})
                    return r.save()
                  })
              })
          })
      }
    })
}

const setOrderItem = ({order, product, quantity}) => {
  return Booking.findById(order)
    .populate('items')
    .then(order => {
      if (!order) {
        throw new NotFoundError(`Commande ${order} introuvable`)
      }
      const item = order.items.find(i => i.product.toString() == product)
      if (item) {
        item.quantity = parseInt(quantity)
        return item.save()
      }
      return Product.findById(product)
        .then(product =>
          OrderItem.create({
            product: product,
            price: product.price,
            vat_rate: product.vat_rate,
            quantity,
          }),
        )
        .then(item =>
          Booking.findByIdAndUpdate(
            order,
            {$push: {items: item}},
            {new: true},
          ),
        )
    })
}

const removeOrderItem = ({order, item}) => {
  return Booking.findByIdAndUpdate(order, {$pull: {items: item}})
    .then(() => {
      return OrderItem.findByIdAndRemove(item)
    })
}

const payEvent=({context, redirect, color}, user) => {
  const eventId=context
  return getModel(eventId, 'event')
   .then(model => {
     return Promise.all([
       Event.findOne({_id: eventId, members: user}),
       UserSessionData.findOne({user: user, 'guests_count.event': eventId}),
       Payment.find({event: eventId, event_member: user, status: PAYMENT_SUCCESS})
     ])
   })
   .then(([ev, usd, payments]) => {
     if (!ev) { return false }
     const guests_count=usd ? usd.guests_count.find(gc => gc.event._id.toString()==eventId).count : 0
     const remainingToPay=ev.price*guests_count-lodash(payments).map('amount').sum()
     if (remainingToPay==0) {
       throw new BadRequestError(`Il n'y a rien à payer sur cet événement'`)
     }
     const vat=EVENT_VAT_RATE*remainingToPay
     return Payment.create({event: eventId, event_member: user, member:user, amount:remainingToPay, vat_amount:vat})
   })
   .then(payment => {
     return initiatePayment({amount: payment.amount, email: user.email, color})
   })
   .then(redirect => {
     return ({redirect})
   })
}

const payOrder=({context, redirect, color}, user) => {
  const bookingId=context
  return getModel(bookingId, 'booking')
   .then(model => {
     return Booking.findById(bookingId)
      .populate('items')
      .populate('payments')
      .then(booking => {
        if (!booking) { throw new NotFoundError(`Réservation ${bookingId} introuvable`) }
        if (booking.remaining_total==0) {
          throw new BadRequestError(`Réservation ${bookingId} déjà payée`)
        }
        console.log(`Remaining total: ${booking.remaining_total}`)
        const params={
          booking: booking._id, member:user._id,
          amount:booking.remaining_total, vat_amount:booking.remaining_vat_amount
        }
        console.log(`Params:${JSON.stringify(params)}`)
        return Payment.create(params)
      })
      .then(payment => {
        return initiatePayment({amount: payment.amount, email: user.email, color})
      })
      .then(redirect => {
        return ({redirect})
      })
  })
}

const cashOrder=({context, guest, amount, redirect}, user) => {
  const bookingId=context
  return getModel(bookingId, 'booking')
   .then(model => {
    return Booking.findById(bookingId)
      .populate('items')
      .populate('payments')
      .then(booking => {
        if (!booking) { throw new NotFoundError(`Réservation ${bookingId} not found`) }
        if (amount>booking.remaining_total) {
          throw new BadRequestError(`Il ne reste que ${booking.remaining_total}€ à payer`)
        }
        const customer=guest ? {guest}: {member: user}
        const remaining=booking.total_remaining
        const remaining_vat=booking.remaining_vat_amount
        const payment_tva=amount*remaining_vat/remaining_total
        return Payment.create({booking, ...customer, total_amount:amount, vat_amount:payment_tva})
      })
      .then(() => ({redirect}))
  })
}

addAction('payEvent', payEvent)
addAction('payOrder', payOrder)
addAction('cashOrder', cashOrder)

const registerToEvent = ({event, user}) => {
  console.log(`Adding ${user} to event ${event}`)
  return Event.findByIdAndUpdate(event, {$addToSet: {members: user}})
}

const preCreate = ({model, params}) => {
  if (model=='user') {
    return User.findOne({email: params.email})
      .then(user => {
        if (user) {
          throw new BadRequestError(`Le compte ${params.email} existe déjà`)
        }
        params={...params, password: generate_id()}
        return Promise.resolve({model, params})
      })
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postCreate = ({model, params, data}) => {
  if (model=='user') {
    console.log(`Sending mail to ${params.email} with temp password ${params.password}`)
  }

  return Promise.resolve(data)
}

setPostCreateData(postCreate)

const filterDataUser = ({model, data, id, user}) => {

  // List mode
  if (!id) {
    if (model == 'category') {
      const allChildren=lodash.flattenDeep(data.map(d => (d.children||[]).map(c => c._id)))
      return data.filter(d => !allChildren.includes(d._id))
    }
    // for sub categories, return top level first
    if (/.*Category/.test(model)) {
      return lodash.sortBy(data, d => (d.parent? 1: 0))
    }
    if (model=='user') {
      if ([FUMOIR_MEMBER].includes(user.role)) {
        return data.filter(d => d.role==FUMOIR_MEMBER)
      }
    }
    if (model=='message') {
      if ([FUMOIR_MEMBER].includes(user.role)) {
        data=data.filter(d => [d.sender._id, d.receiver._id].includes(user._id.toString()))
        return lodash.orderBy(data, ['creation_date'], ['asc'])
      }
    }
    if (model=='booking') {
      if ([FUMOIR_MEMBER].includes(user.role)) {
        data=data.filter(d => d.booking_user?._id?.toString()==user._id.toString())
      }
      return lodash.orderBy(data, ['start_date'], ['desc'])
    }
  }

  return data
}

setFilterDataUser(filterDataUser)

const preprocessGet = ({model, fields, id, user}) => {
  if (/.*Category/i.test(model)) {
    fields = lodash([...fields, 'parent']).uniq().value()
  }
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }

  if (model=='user') {
    fields.push('role')
  }

  if (model=='conversation') {
    const getPartner= (m, user) => {
      return m.sender._id.toString()==user._id.toString() ? m.receiver : m.sender
    }

    return Message.find({$or: [{sender: user._id}, {receiver: user._id}]})
      .populate({path: 'sender', populate: {path: 'company'}})
      .populate({path: 'receiver', populate: {path: 'company'}})
      .sort({'creation_date': 1})
      .then(messages => {
        if (id) {
          messages=messages.filter(m => getPartner(m, user)._id.toString()==id)
          // If no messages for one parner, forge it
          if (lodash.isEmpty(messages)) {
            return User.findById(id).populate('company')
              .then(partner => {
                const data=[{_id: partner._id, partner, messages: []}]
                return {model, fields, id, data}
              })
          }
        }
        const partnerMessages=lodash.groupBy(messages, m => getPartner(m, user)._id)
        const convs=lodash(partnerMessages)
          .values()
          .map(msgs => { const partner=getPartner(msgs[0], user); return ({_id: partner._id, partner, messages: msgs}) })
          .sortBy('creation_date', 'asc')
        return {model, fields, id, data: convs}
      })
  }
  return Promise.resolve({model, fields, id})
}

setPreprocessGet(preprocessGet)

const USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(m => {
  declareEnumField({model: m, field: 'role', enumValues: ROLES})
  declareVirtualField({model: m, field: 'full_name', instance: 'String', requires: 'firstname,lastname'})
  declareVirtualField({model: m, field: 'is_active', instance: 'Boolean', requires: 'subscription_start,subscription_end'})
  declareVirtualField({model: m, field: 'is_active_str', instance: 'String', requires: 'subscription_start,subscription_end'})
  declareVirtualField({model: m, field: 'posts', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'post'}}})

  declareVirtualField({model: m, field: 'bookings', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'booking'}}})

  declareVirtualField({model: m, field: 'events', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'event'}}})

})


declareEnumField({model: 'booking', field: 'place', enumValues: PLACES})
declareVirtualField({model: 'booking', field: 'end_date', instance: 'Date', requires: ''})
declareVirtualField({model: 'booking', field: 'paid', instance: 'Boolean', requires: 'items,payments'})
declareVirtualField({model: 'booking', field: 'paid_str', instance: 'String', requires: 'items,payments'})
declareVirtualField({model: 'booking', field: 'status', instance: 'String', requires: 'start_date,end_date', enumValues: EVENT_STATUS})
declareVirtualField({model: 'booking', field: 'people_count', instance: 'Number', requires: 'guests_count'})
declareVirtualField({model: 'booking', field: 'total_price', instance: 'Number', requires: 'items'})
declareVirtualField({model: 'booking', field: 'remaining_total', instance: 'Number', requires: 'items,payments'})
declareVirtualField({model: 'booking', field: 'payments', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'payment'}}})
declareVirtualField({model: 'booking', field: 'total_vat_amount', instance: 'Number', requires: 'items,payments'})
declareVirtualField({model: 'booking', field: 'total_net_price', instance: 'Number', requires: 'items'})
declareVirtualField({model: 'booking', field: 'remaining_vat_amount', instance: 'Number', requires: 'items,payments'})

declareVirtualField({model: 'payment', field: 'net_amount', instance: 'Number', requires: 'total_amount,vat_amount'})
declareEnumField({model: 'payment', field: 'status', enumValues: PAYMENT_STATUS})


const PRODUCT_MODELS=['product', 'cigar', 'drink', 'meal']
PRODUCT_MODELS.forEach(m => {
  declareVirtualField({model: m, field: 'net_price', instance: 'Number', requires: 'price,vat_rate'})
  declareVirtualField({model: m, field: 'reviews', instance: 'review', requires: ''})
})
declareVirtualField({model: 'company', field: 'full_name', instance: 'String', requires: 'name'})

const CAT_MODELS=['category', 'cigarCategory', 'mealCategory', 'drinkCategory']
CAT_MODELS.forEach(m => {
  declareVirtualField({model: m, field: 'children', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'category'},
    },
  })
  declareVirtualField({model: m, field: 'products', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'product'},
    },
  })
})

declareEnumField({model: 'event', field: 'place', enumValues: PLACES})
declareVirtualField({model: 'event', field: 'members_count', instance: 'Number', requires: 'guests_count,members'})
declareVirtualField({model: 'event', field: 'status', instance: 'String', requires: 'start_date,end_date', enumValues: EVENT_STATUS})
declareVirtualField({model: 'event', field: 'guests', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'guest'}}})
declareVirtualField({model: 'event', field: 'guests_count', instance: 'Number', requires: ''})
declareVirtualField({model: 'event', field: 'payments', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'payment'}}})

declareVirtualField({model: 'orderItem', field: 'net_price', instance: 'Number', requires: 'price,vat_rate'})
declareVirtualField({model: 'orderItem', field: 'vat_amount', instance: 'Number', requires: 'price,vat_rate'})
declareVirtualField({model: 'orderItem', field: 'total_net_price', instance: 'Number', requires: 'price,vat_rate,quantity'})
declareVirtualField({model: 'orderItem', field: 'total_vat_amount', instance: 'Number', requires: 'price,vat_rate,quantity'})
declareVirtualField({model: 'orderItem', field: 'total_price', instance: 'Number', requires: 'price,quantity'})
declareVirtualField({model: 'subscription', field: 'is_active', instance: 'Boolean', requires: 'start,end'})

const getEventGuests = (user, params, data) => {
  return UserSessionData.findOne({user: user._id, 'guests.event': data._id})
    .populate({path: 'guests', populate: 'guest'})
    .then(usd => {
      if (!usd) {return [] }
      const guests=usd.guests
        .filter(g => g.event._id.toString()==data._id.toString())
        .map(g => g.guest)
      return guests
    })
}

declareComputedField('event', 'guests', getEventGuests)

const getEventGuestsCount = (user, params, data) => {
  return UserSessionData.findOne({user: user._id, 'guests_count.event': data._id})
    .then(usd => {
      if (!usd) { return 0}
      return usd.guests_count.find(gc => gc.event._id.toString()==data._id).count
    })
}

const setEventGuestsCount = ({id, attribute, value,user}) => {
  if (value>MAX_EVENT_GUESTS) {
    throw new BadRequestError(`Vous ne pouvez inviter plus de ${MAX_EVENT_GUESTS} personnes`)
  }
  return getEventGuests(user, null, {_id: id})
    .then(guests => {
      if (guests.length>value) {
        throw new BadRequestError(`Vous avez déjà envoyé ${guests.length} invitations`)
      }
      return UserSessionData.findOneAndUpdate({user: user._id},
        {user: user._id},
        {upsert: true, runValidators: true, new: true},
      )
    })
    .then(usd => {
      const guests_count=usd.guests_count.find(gc => gc.event._id.toString()==id)
      if (guests_count) {
        guests_count.count=value
      }
      else {
        usd.guests_count.push({event: id, count: value})
      }
      return usd.save()
    })
}

declareComputedField('event', 'guests_count', getEventGuestsCount, setEventGuestsCount)

module.exports = {
  inviteGuest,
  setOrderItem,
  removeOrderItem,
  registerToEvent,
  payOrder,
}
