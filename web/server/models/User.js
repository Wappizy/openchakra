const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {getMangopayMessage} = require('../../utils/i18n')
const {hideIllegal} = require('../../utils/text')
const moment = require('moment')
const {ACCOUNT_MIN_AGE, ROLES}=require('../../utils/consts')

const maxBirth=new Date(moment().add(-ACCOUNT_MIN_AGE, 'years'))

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  firstname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    set: v => v.toLowerCase().trim(),
  },
  password: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    max: maxBirth,
    // required: true,
  },
  phone: {
    type: String,
  },
  sms_code: {
    type: String,
  },
  billing_address: {
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
  service_address: [{
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    zip_code: {
      type: String,
    },
    lat: {
      type: Number,

    },
    lng: {
      type: Number,
    },
    label: {
      type: String,
    },
    floor: {
      type: String,
    },
    note: {
      type: String,
    },
    phone_address: {
      type: String,
    },
  }],
  picture: {
    type: String,
  },
  creation_date: {
    type: Date,
    default: Date.now,
  },
  job: {
    type: String,
  },
  diplomes: {
    type: String,
  },
  school: {
    type: String,
  },
  languages: [{
    type: String,
  }],
  emergency_phone: {
    type: String,
  },
  description: {
    type: String,
    set: text => hideIllegal(text),
  },
  id_card: {
    recto: {
      type: String,
    },
    verso: {
      type: String,
    },
  },
  registration_proof: {
    type: String,
  },
  account: {
    bank: {
      type: String,
    },
    name: {
      type: String,
    },
    iban: {
      type: String,
    },
    bic: {
      type: String,
    },
  },
  notifications_message: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: true,
    },
  },
  notifications_rappel: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: true,
    },
  },
  notifications_promotions: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: true,
    },
  },
  notifications_community: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: true,
    },
  },
  notifications_assistance: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: true,
    },
  },
  score: {
    type: Number,
    default: 0,
  },
  score_client: {
    type: Number,
    default: 0,
  },
  number_of_reviews: {
    type: Number,
    default: 0,
  },
  number_of_reviews_client: {
    type: Number,
    default: 0,
  },
  number_of_views: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  is_confirmed: {
    type: Boolean,
    default: false,
  },
  id_confirmed: {
    type: Boolean,
    default: false,
  },
  phone_confirmed: {
    type: Boolean,
    default: false,
  },
  last_login: [{
    type: Date,
  }],
  is_alfred: {
    type: Boolean,
    default: false,
  },
  index_google: {
    type: Boolean,
    default: true,
  },
  super_alfred: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  resetToken: {
    type: Schema.Types.ObjectId,
    ref: 'ResetToken',
  },
  chatRooms: {
    type: Schema.Types.ObjectId,
    ref: 'ChatRoom',
  },
  // Mangopay as client
  id_mangopay: {
    type: String,
    default: null,
  },
  // Mangopay as provider
  mangopay_provider_id: {
    type: String,
    default: null,
  },
  // Provider status : NATURAL or LEGAL
  mangopay_provider_status: {
    type: String,
  },
  identity_proof_id: {
    type: String,
  },
  registration_proof_id: {
    type: String,
  },
  id_card_status: {
    type: String,
  },
  id_card_error: {
    type: String,
  },
  registration_proof_status: {
    type: String,
  },
  registration_proof_error: {
    type: String,
  },
  // Pour le B2B, compagnie à laquelle appartient le compte
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
  position: {
    type: String,
  },
  roles: [{
    type: String,
    enum: Object.keys(ROLES),
  }],
  // Avocotés : lien vers compagnie avocotes
  company_customer: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
  // Entreprise si le client est un professionel
  professional: {
    type: {
      name: {
        type: String,
        required: true,
      },
      siret: {
        type: String,
        required: true,
      },
      vat_subject: {
        type: Boolean,
        default: false,
        required: true,
      },
      vat_number: {
        type: String,
        required: false,
      },
    },
    required: false,
  },
}, {toJSON: {virtuals: true, getters: true}})

UserSchema.virtual('id_card_error_text').get(function() {
  return getMangopayMessage(this.id_card_error)
})

UserSchema.virtual('id_card_status_text').get(function() {
  return getMangopayMessage(this.id_card_status)
})

UserSchema.virtual('avatar_letters').get(function() {
  const first_letter = this.firstname ? this.firstname.charAt(0) : ''
  const second_letter = this.name ? this.name.charAt(0) : ''
  return (first_letter + second_letter).toUpperCase()
})

UserSchema.virtual('full_name').get(function() {
  return `${this.firstname} ${this.name}`
})

UserSchema.virtual('age').get(function() {
  if (!this.birthday) {
    return null
  }
  const age = moment().diff(this.birthday, 'years')
  return age
})

UserSchema.virtual('is_employee').get(function() {
  return Boolean(this.company)
})

// Registered => has firstname, name, email, birthday, password, address
UserSchema.virtual('is_registered').get(function() {
  const REQUIRED=['firstname', 'name', 'email', 'birthday', 'password']
  if (REQUIRED.find(r => !this[r])) {
    return false
  }
  if (!this.billing_address || !this.billing_address.address) {
    return false
  }
  return true
})

UserSchema.virtual('shop', {
  ref: 'Shop', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'alfred', // is equal to foreignField
})

module.exports = UserSchema
