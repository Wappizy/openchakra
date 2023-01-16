const FUMOIR_ADMIN = 'FUMOIR_ADMIN'     // Admin
const FUMOIR_MANAGER = 'FUMOIR_MANAGER' // Serveur
const FUMOIR_CHEF = 'FUMOIR_CHEF'       // Cuisiner
const FUMOIR_MEMBER = 'FUMOIR_MEMBER'   // Membre

const FUMOIR_BASE = 'FUMOIR'

const ROLES = {
  [FUMOIR_ADMIN]: 'Administrateur',
  [FUMOIR_CHEF]: 'Cuisinier',
  [FUMOIR_MANAGER]: 'Manager fumoir',
  [FUMOIR_MEMBER]: 'Membre',
}

const PLACES = {
  [FUMOIR_BASE]: 'Fumoir de Georges',
}

const ALL=null
const TO_COME='TO_COME'
const CURRENT='CURRENT'
const FINISHED='FINISHED'

const EVENT_STATUS = {
  [ALL]: 'Tous',
  [TO_COME]: 'A venir',
  [CURRENT]: 'En cours',
  [FINISHED]: 'Terminé',
}

// Discriminator for mongoose products
const PRODUCT_DISC_OPTION = {discriminatorKey: 'kind'}
// Discriminator for mongoose products
const CATEGORY_DISC_OPTION = {discriminatorKey: 'kind'}

const [TO_PAY_STR, PAID_STR]=['À payer', 'Payé']

const MAX_EVENT_GUESTS=2
const MAX_BOOKING_GUESTS=15

const PAYMENT_CREATED='CREATED'
const PAYMENT_SUCCESS='SUCCESS'
const PAYMENT_FAILURE='FAILURE'

const PAYMENT_STATUS={
  [PAYMENT_CREATED]: 'Créé',
  [PAYMENT_SUCCESS]: 'Succès',
  [PAYMENT_FAILURE]: 'Echoué',
}

const EVENT_VAT_RATE=0.2

module.exports = {
  ROLES, FUMOIR_MEMBER, FUMOIR_MANAGER,
  PLACES,
  PRODUCT_DISC_OPTION,
  EVENT_STATUS,
  TO_COME, CURRENT, FINISHED, ALL,
  CATEGORY_DISC_OPTION,
  TO_PAY_STR, PAID_STR,
  MAX_EVENT_GUESTS,
  MAX_BOOKING_GUESTS,
  PAYMENT_STATUS, PAYMENT_CREATED, PAYMENT_SUCCESS,
  EVENT_VAT_RATE,
}
