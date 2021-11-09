const mongoose = require('mongoose')
const moment = require('moment')
const {BOOK_STATUS, ROLES} = require('../../utils/consts')
const Schema = mongoose.Schema

const BookingSchema = new Schema({
  reference: {
    type: String,
    required: true,
  },
  address: {
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    zip_code: {
      type: String,
    },
    country: {
      type: String,
    },
    gps: {
      lat: Number,
      lng: Number,
    },
  },
  service: {
    type: String,
    required: true,
  },
  equipments: [{
    type: Schema.Types.ObjectId,
    ref: 'Equipment',
  }],
  // Total amount
  amount: {
    type: Number,
    required: true,
  },
  // Company supported amount
  company_amount: {
    type: Number,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  prestation_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },
  alfred: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  prestations: [{
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  }],
  option: {
    label: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  chatroom: {
    type: Schema.Types.ObjectId,
    ref: 'ChatRoom',
  },
  fileUpload: [{
    type: Schema.Types.Mixed,
  }],
  customer_fee: {
    type: Number,
    default: 0,
  },
  provider_fee: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: Object.values(BOOK_STATUS),
  },
  serviceUserId: {
    type: String,
  },
  alfred_evaluated: {
    type: Boolean,
    default: false,
  },
  user_evaluated: {
    type: Boolean,
    default: false,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  date_payment: {
    type: Date,
  },
  travel_tax: {
    type: Number,
    required: true,
    default: 0,
  },
  pick_tax: {
    type: Number,
    required: true,
    default: 0,
  },
  // Customer payin id
  mangopay_payin_id: {
    type: String,
  },
  // Transfer from customer to provider
  mangopay_transfer_id: {
    type: String,
  },
  // Payout for provider
  mangopay_payout_id: {
    type: String,
  },
  // Client refund id
  mangopay_refund_id: {
    type: String,
  },
  // Transfer from customer to provider fee recipient (ex: all-inclusive)
  provider_fee_transfer_id: {
    type: String,
  },
  // Payout for provider fee recipient (ex: all-inclusive)
  provider_fee_payout_id: {
    type: String,
  },
  // Transfer from customer to client fee recipient (ex: My Alfred)
  customer_fee_transfer_id: {
    type: String,
  },
  // Payout for client fee recipient (ex: My Alfred)
  customer_fee_payout_id: {
    type: String,
  },
  cesu_amount: {
    type: Number,
    default: 0,
  },
  // User role when booking
  user_role: {
    type: String,
    enum: [null, ...Object.keys(ROLES)],
  },
  billing_number: {
    type: String,
  },
  receipt_number: {
    type: String,
  },
  myalfred_billing_number: {
    type: String,
  },
  // Réservation par un client Avocotés
  company_customer: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
  // Réservation du client dans le cas de la réservation par l'Afred pour avocotes
  customer_booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
  },
}, {toJSON: {virtuals: true, getters: true}})

BookingSchema.virtual('alfred_amount').get(function() {
  return this.amount - this.customer_fee - this.provider_fee
})

BookingSchema.virtual('date_prestation_moment').get(function() {
  if (!this.prestation_date) {
    return null
  }
  return moment(`${moment(this.prestation_date, 'DD/MM/YYYY').format('YYYY-MM-DD') } ${ moment(this.prestation_date).format('HH:mm')}`)
})


BookingSchema.virtual('calendar_display').get(function() {
  if (!this.status) {
    return false
  }
  if ([BOOK_STATUS.CANCELLED, BOOK_STATUS.EXPIRED, BOOK_STATUS.REFUSED].includes(this.status)) {
    return false
  }
  return true
})


module.exports = BookingSchema
