const lodash=require('lodash')
const Company = require('../models/Company')
const Product = require('../models/Product')
const PriceList = require('../models/PriceList')
const {EXPRESS_SHIPPING} = require('../../utils/feurst/consts')
const {roundCurrency} = require('../../utils/converters')
const ShipRate = require('../models/ShipRate')


const extractDepartment = zipCode => {
  const dept=parseInt(String(zipCode).slice(0, -3))
  return dept
}

const getProductPrices = (product_ref, company) => {
  if (!product_ref) { return Promise.reject(`Mandatory product_ref`) }
  if (!company) { return Promise.reject(`Mandatory company`) }

  return Promise.all([company.catalog_prices, company.net_prices].map(priceList =>
    PriceList.findOne({reference: product_ref, name: priceList}),
  ))
    .then(([catPrice, netPrice]) => {
      if (!catPrice && !netPrice) { return Promise.reject(`Ni prix catalogue ni prix remisé pour ${product_ref}`) }
      return Promise.resolve({
        catalog_price: catPrice?.price || netPrice?.price,
        net_price: netPrice?.price || catPrice?.price,
      })
    })
}

/** Adds product to the order :
If product is present, adds quantity if replace is false else sets quantity
If product is not present, adds the item to the order
*/
const addItem = ({data, product_id, reference, quantity, merge, recurse=true}) => {
  if (lodash.isNil(merge)) {
    return Promise.reject(`Merge parameter is ${JSON.stringify(merge)}`)
  }
  if (isNaN(parseInt(quantity)) || quantity==0) {
    return Promise.reject(`Article ${reference}: quantité ${quantity} incorrecte`)
  }
  let product=null
  return Product.findOne({$or: [{_id: product_id}, {reference: reference}]})
    .populate('components')
    .then(result => {
      if (!result) {
        return Promise.reject(`Article ${reference} inconnu`)
      }
      product=result
      return getProductPrices(product.reference, data.company)
    })
    .then(prices => {
      if (!prices) { return Promise.reject(`Tarif inconnu pour ${product.reference}`) }
      let item=data.items.find(item => item.product._id.toString()==product._id.toString())
      if (item && merge) {
        if (quantity) {
          item.quantity = item.quantity+parseInt(quantity)
        }
      }
      else {
        item = {product: product, quantity: parseInt(quantity), catalog_price: prices.catalog_price, net_price: prices.net_price}
        data.items.push(item)
      }
      // If linked articles, append them to the order/quotation
      if (product.has_linked && recurse) {
        return Promise.allSettled(product.components.map(c => {
          return addItem({data, product_id: c._id, reference, quantity, recurse: false})
        }))
        .then(() => {
          return Promise.resolve(data)
        })
      }
      return Promise.resolve(data)
    })
    .catch(err => {
      console.error(err)
      return Promise.reject(err)
    })
}

const updateLine = ({data, lineId, quantity, price}) => {
  if (!lodash.isNil(quantity) && !quantity) {
    return Promise.reject(`La quantité doit être positive`)
  }
  if (!(quantity || price)) {
    return Promise.reject(`Quantité ou tarif requis`)
  }
  let product=null
  const item=data.items.find(i => i._id.toString()==lineId.toString())
  if (!item) {
    return Promise.reject(`Ligne de commande ${lineId} introuvable`)
  }
  if (!lodash.isNil(quantity)) {
    item.quantity=quantity
  }
  if (!lodash.isNil(price)) {
    item.net_price=price
  }
  return Promise.resolve(data)
}

const equalAddresses= (addr1, addr2) => {
  if (!addr1 || !addr2) {
    return false
  }
  return ['address', 'zip_code', 'city', 'country'].every(att => addr1[att]==addr2[att])
}
/**
Computes Ship rate depending on zipcode, weight and express (true||false)
*/
const computeShippingFee = (model, address, express) => {
  return new Promise((resolve, reject) => {
    if (!address) {
      return reject(`Calcul frais de livraison impossible: adresse manquante`)
    }
    const orderDepartment=extractDepartment(address?.zip_code)
    if (!orderDepartment) {
      return reject(`Calcul frais de livraison impossible: code postal incorrect`)
    }
    const orderAddress=address
    const companyMainAddress=model.company?.addresses[0]
    const weight=model.total_weight

    // Carriage paid for non express ?
    if (!express && !lodash.isNil(model.company.carriage_paid) && equalAddresses(orderAddress, companyMainAddress) && model.total_amount >= model.company.carriage_paid) {
      console.log(`Order amount ${model.total_amount}> carriage paid ${model.company.carriage_paid} : no shipping fee`)
      return resolve(0)
    }
    ShipRate.findOne({zipcode: orderDepartment, express: express, min_weight: {$lte: weight}, max_weight: {$gt: weight}})
      .then(rate => {
        if (!rate) {
          return reject(`No rate found for dept:${orderDepartment} weight:${weight} express:${express}`)
        }
        const fee=rate.fixed_price+rate.per_kg_price*parseInt(weight)
        return resolve(Math.ceil(fee))
      })
      .catch(err => {
        return reject(err)
      })
  })
}

/**
Updates shipping fee depending on ShipRate
Data is an Order or a Quotation
*/
const updateShipFee = data => {
  return new Promise((resolve, reject) => {
    if (data.address && data.shipping_mode) {
      computeShippingFee(data, data.address, data.shipping_mode==EXPRESS_SHIPPING)
        .then(fee => {
          data.shipping_fee=fee
          return resolve(data)
        })
        .catch(err => reject(err))
    }
    else {
      return resolve(data)
    }
  })
}

/** Update stock using depending on order/quotation items provided
If product is a group (i.e. has sub-products), update stock for each sub-component then set group's stock to the smallest one
Else update stock
*/
const updateStock = orderQuot => {
  return orderQuot.items.map(it => {
    return Product.findById(it.product)
      .populate('components')
      .then(product => {
        let promises
        const components=product.components
        if (product.is_assembly) {
          components.forEach(p => (p.stock=p.stock-it.quantity))
          product.stock=lodash.min(components.map(v => v.stock))
        }
        else {
          product.stock=product.stock-it.quantity
        }
        promises=[product.save(), ...components.map(p => p.save())]
        Promise.allSettled(promises)
          .then(() => {
            // const grouped=lodash.groupBy(res, 'status')
            return Promise.resolve(orderQuot)
          })
          .catch(err => {
            console.error(err)
            return Promise.reject(orderQuot)
          })
      })
  })
}

// Checks wether quotation or order is in the expected delivery zone
const isInDeliveryZone = (address, company) => {
  const addressDept=extractDepartment(address?.zip_code)
  const inZone=company.delivery_zip_codes?.includes(addressDept)
  console.log(`isInZone for ${addressDept} amongst ${company.delivery_zip_codes}:${inZone}`)
  return inZone
}

const updateCompanyAddresses= model => {
  return Company.findById(model.company)
    .then(company => {
      const modelAddress=lodash.omit(model.address, ['id', '_id'])
      // Update by label ?
      const idx=company.addresses.findIndex(a => a.label==modelAddress.label)
      if (idx!=-1) {
        company.addresses[idx]=modelAddress
      }
      else {
        company.addresses.push(modelAddress)
      }
      return company.save()
    })
    .then(() => {
      return Promise.resolve(model)
    })
    .catch(err => {
      return Promise.reject(err)
    })
}

const computeCarriagePaidDelta = (schema, id) => {
  return schema.findById(id)
    .populate('items.product')
    .populate('company')
    .then(res => {
      if (!res) {
        throw new NotFoundError(`order/quotation ${id} not found`)
      }
      console.log(`Net amount:${res.net_amount}`)
      console.log(`Franco:${res.company.carriage_paid}`)
      const delta=Math.max(0, res.company?.carriage_paid-res.net_amount)
      return roundCurrency(delta) || 0
    })
}

module.exports = {addItem, computeShippingFee, updateShipFee, getProductPrices,
  updateStock, isInDeliveryZone, updateCompanyAddresses, extractDepartment,
  computeCarriagePaidDelta, updateLine
}
