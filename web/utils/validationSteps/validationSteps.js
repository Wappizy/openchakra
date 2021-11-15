import isEmpty from '../../server/validation/is-empty'
const {CESU} = require('../consts')

const creaShopPresentation = () => {
  return true
}

const selectService = shop => {
  if (!shop.service) {
    return false
  }
  if (!shop.particular_access && !shop.professional_access) {
    return false
  }
  return true
}

const selectPrestation = shop => {
  if (Object.keys(shop.prestations).length === 0) {
    return false
  }
  return Object.values(shop.prestations)
    .every(v => {
      return !(!v.price || !v.billing || isEmpty(v.label) || Object.keys(v.billing).length === 0)
    })
}

const settingService = shop => {
  if (!shop.location) {
    return false
  }
  if (Object.values(shop.location).every(v => !v)) {
    return false
  }
  if (shop.travel_tax && !shop.travel_tax.rate) {
    return false
  }
  if (isNaN(shop.pick_tax)) {
    return false
  }
  if (!shop.perimeter) {
    return false
  }
  return true
}

const assetsService = shop => {
  if (isEmpty(shop.diplomaName) != isEmpty(shop.diplomaYear)) {
    return false
  }
  if (isEmpty(shop.certificationName) != isEmpty(shop.certificationYear)) {
    return false
  }
  return true
}

const settingShop = shop => {
  if (!shop.cancel_mode) {
    return false
  }
  return true
}

const bookingPreferences = shop => {
  if (!shop) {
    return false
  }
  if (isNaN(parseInt(shop.minimum_basket)) || parseInt(shop.minimum_basket)<0) {
    return false
  }
  if (isNaN(parseInt(shop.deadline_value)) || parseInt(shop.deadline_value)<0) {
    return false
  }
  if (!shop.deadline_unit) {
    return false
  }
  return true
}

const introduceYou = shop => {
  if (shop.is_particular) {
    if (!shop.cesu) {
      return false
    }
    return true
  }
  // Pro
  if (shop.company == null) {
    return false
  }
  if (!shop.company.siret) {
    return false
  }
  if (!shop.is_certified) {
    return false
  }
  if (shop.company.vat_subject && !shop.company.vat_number) {
    return false
  }
  return true
}

export {creaShopPresentation, selectService, selectPrestation, settingService,
  assetsService, settingShop, introduceYou, bookingPreferences}
