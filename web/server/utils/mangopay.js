const {
  MANGOPAY_CONFIG,
  get_host_url,
  is_development,
}=require('../../config/config')
const moment = require('moment')
const path = require('path')
const mangopay = require('mangopay2-nodejs-sdk')
const KycDocumentType = require('mangopay2-nodejs-sdk/lib/models/KycDocumentType')
const KycDocumentStatus = require('mangopay2-nodejs-sdk/lib/models/KycDocumentStatus')
const PersonType = require('mangopay2-nodejs-sdk/lib/models/PersonType')

const mangoApi = new mangopay(MANGOPAY_CONFIG)
const {MANGOPAY_ERRORS}=require('../../utils/mangopay_messages')
const {ADMIN, MANAGER}=require('../../utils/consts')
const {delayedPromise}=require('../../utils/promise')
const axios=require('axios')
const util=require('util')

const getWallet = mangopay_id => {
  return new Promise((resolve, reject) => {
    mangoApi.Users.getWallets(mangopay_id)
      .then(wallets => {
        if (wallets.length==0) {
          return reject(`No active bank account for mangopay #${mangopay_id}`)
        }
        resolve(wallets[0].Id)
      })
      .catch(err => {
        reject(err)
      })
  })
}

const createTransfer = (source_user_id, destination_user_id, debt_amount, fees=0) => {
  console.log(`Creating transfer from ${source_user_id} to ${destination_user_id}, amount ${debt_amount}, fees ${fees}`)
  return new Promise((resolve, reject) => {
    Promise.all([source_user_id, destination_user_id].map(getWallet))
      .then(res => {
        const [source_wallet_id, dest_wallet_id]=res
        mangoApi.Transfers.create({
          AuthorId: source_user_id,
          DebitedFunds: {Currency: 'EUR', Amount: debt_amount*100},
          Fees: {Currency: 'EUR', Amount: fees*100},
          DebitedWalletId: source_wallet_id,
          CreditedWalletId: dest_wallet_id,
        })
          .then(transfer => {
            delayedPromise(500, () => mangoApi.Transfers.get(transfer.Id))
              .then(transfer => {
                console.log(`Created transfer #${transfer.Id} with status ${transfer.Status}`)
                if (transfer.Status == 'FAILED') {
                  return reject(`Transfer #${transfer.Id} failed:${transfer.ResultMessage}`)
                }
                return resolve(transfer)
              })
              .catch(err => {
                console.error(err)
                return reject(err)
              })
          })
          .catch(err => {
            console.error(err)
            return reject(err)
          })
      })
      .catch(err => {
        console.error(err)
        return reject(err)
      })
  })
}

const getBankAccount = mangopay_id => {
  return new Promise((resolve, reject) => {
    mangoApi.Users.getBankAccounts(mangopay_id)
      .then(accounts => {
        active_accounts = accounts.filter(a => a.Active)
        if (active_accounts.length == 0) {
          return reject(`No active bank account for mangopay #${mangopay_id}`)
        }
        return resolve(active_accounts[0].Id)
      })
      .catch(err => {
        reject(err)
      })
  })
}

const createPayout = (mangopay_id, amount, fees=0) => {
  console.log(`Creating payout for ${mangopay_id}, amount ${amount}, fees ${fees}`)
  return new Promise((resolve, reject) => {
    getWallet(mangopay_id)
      .then(wallet_id => {
        getBankAccount(mangopay_id)
          .then(bank_account_id => {
            mangoApi.PayOuts.create({
              AuthorId: mangopay_id,
              DebitedFunds: {Currency: 'EUR', Amount: amount*100},
              Fees: {Currency: 'EUR', Amount: fees*100},
              BankAccountId: bank_account_id,
              DebitedWalletId: wallet_id,
              BankWireRef: 'My Alfred',
              PaymentType: 'BANK_WIRE',
            })
              .then(payOut => {
                delayedPromise(1000, () => mangoApi.PayOuts.get(payOut.Id))
                  .then(payOut => {
                    console.log(`Created payout ${payOut.Id} with status ${payOut.Status}`)
                    if (payOut.Status=='FAILED') {
                      reject(`Payout ${payOut.Id} failed`)
                    }
                    resolve(payOut)
                  })
                  .catch(err => {
                    console.error(err)
                    reject(err)
                  })
              })
              .catch(err => {
                console.error(err)
                reject(err)
              })
          })
          .catch(err => {
            return reject(err)
          })
      })
      .catch(err => {
        return reject(err)
      })
  })

}

const createMangoClient = user => {
  return new Promise((resolve, reject) => {
    if (user.id_mangopay) {
      resolve(user)
    }
    let userData = {
      PersonType: PersonType.Natural,
      FirstName: user.firstname,
      LastName: user.name,
      Nationality: 'FR',
      CountryOfResidence: 'FR',
      Email: user.email,
      Tag: `Client ${user._id} / ${user.firstname} ${user.name}`,
      Birthday: moment(user.birthday).unix(),
    }

    mangoApi.Users.create(userData)
      .then(newUser => {
        console.log(`Created Mango User ${JSON.stringify(newUser)}`)
        mangoApi.Wallets.create({
          Owners: [newUser.Id],
          Description: `Wallet ${user._id} / ${user.firstname} ${user.name} client`,
          Currency: 'EUR',
        })
          .then(wallet => {
            console.log(`Created Wallet ${JSON.stringify(wallet)}`)
            user.id_mangopay=newUser.Id
            resolve(user)
          })
          .catch(err => {
            reject(`Création wallet user ${user.full_name}:${JSON.stringify(err)}`)
          })
      })
      .catch(err => {
        reject(`Création mangopay user ${user._id} ${user.full_name}:${JSON.stringify(err)}`)
      })
  })
}

const createMangoProvider = (user, shop) => {

  console.log(`Creating mango provider for ${user.name}`)
  let userData = {
    PersonType: shop.is_particular ? PersonType.Natural : PersonType.Legal,
    FirstName: user.firstname,
    LastName: user.name,
    Birthday: moment(user.birthday).unix(),
    Nationality: 'FR',
    CountryOfResidence: 'FR',
    Email: user.email,
    Tag: `Provider ${user._id} / ${user.firstname} ${user.name}`,
  }
  if (shop.is_professional) {
    const addr = user.billing_address
    userData.LegalPersonType = 'SOLETRADER'
    userData.Name = shop.company.name
    userData.CompanyNumber = shop.company.siret
    userData.LegalRepresentativeFirstName = user.firstname
    userData.LegalRepresentativeLastName = user.name
    userData.LegalRepresentativeBirthday = moment(user.birthday).unix()
    userData.LegalRepresentativeNationality = 'FR'
    userData.LegalRepresentativeCountryOfResidence = 'FR'
    userData.LegalRepresentativeEmail = user.email
    const mangoAddr = new mangoApi.models.Address({
      AddressLine1: addr.address,
      AddressLine2: '',
      City: addr.city,
      Region: '',
      PostalCode: addr.zip_code,
      Country: 'FR',
    })
    userData.HeadquartersAddress = mangoAddr
    userData.LegalRepresentativeAddress = mangoAddr
  }

  mangoApi.Users.create(userData)
    .then(newUser => {
      console.log(`Created Mango Provider ${JSON.stringify(newUser)}`)
      user.mangopay_provider_id = newUser.Id
      user.mangopay_provider_status = newUser.PersonType
      user.save().then().catch()
      mangoApi.Wallets.create({
        Owners: [newUser.Id],
        Description: `${user._id} / ${user.full_name} provider`,
        Currency: 'EUR',
      })
        .then(wallet => {
          console.log(`Created Wallet ${JSON.stringify(wallet)}`)
        })
    })
    .catch(err => {
      console.error(`Error @ creating mangopay provider for ${user._id}:${JSON.stringify(err)}`)
    })
}

const createOrUpdateMangoCompany = company => {

  if (!company.representative.birthday) {
    throw new Error("La date de naissance de l'administrateur est requise")
  }

  console.log(`Creating/updating mango company for company ${company.name}, representative is ${company.representative.full_name}`)

  let address=new mangoApi.models.Address({
    AddressLine1: company.billing_address.address,
    AddressLine2: '',
    City: company.billing_address.city,
    Region: '',
    PostalCode: company.billing_address.zip_code,
    Country: 'FR',
  })

  let companyData = {
    PersonType: PersonType.Legal,
    Name: company.name,
    Email: company.representative.email,
    LegalPersonType: 'BUSINESS',
    LegalRepresentativeFirstName: company.representative.firstname,
    LegalRepresentativeLastName: company.representative.name,
    LegalRepresentativeEmail: company.representative.email,
    HeadquartersAddress: address,
    LegalRepresentativeBirthday: moment(company.representative.birthday).unix(),
    LegalRepresentativeAddress: address,
    LegalRepresentativeNationality: 'FR',
    LegalRepresentativeCountryOfResidence: 'FR',
    CompanyNumber: company.siret,
    Tag: `Company ${company.name}/Repr. ${company.representative.full_name}`,
  }

  const is_update = company.id_mangopay

  const method = is_update ?
    mangoApi.Users.update({Id: company.id_mangopay, ...companyData})
    :
    mangoApi.Users.create(companyData)

  method
    .then(mangopay_company => {
      console.log(`Created Mango company ${JSON.stringify(mangopay_company)}`)
      company.id_mangopay = mangopay_company.Id
      company.save()
        .then(() => console.log(`Created/update company ${JSON.stringify(company)}`))
        .catch(err => console.error(err))
      if (!is_update) {
        mangoApi.Wallets.create({
          Owners: [mangopay_company.Id],
          Description: `${company._id} / ${company.name} company`,
          Currency: 'EUR',
        })
          .then(wallet => {
            console.log(`Created Wallet ${JSON.stringify(wallet)}`)
          })
          .catch(err => {
            console.log(`Could not create Wallet:${err}`)
          })
      }
    })
}

const addIdIfRequired = user => {
  console.log('addIdIfRequired')

  const objStatus = {
    Type: KycDocumentType.IdentityProof,
  }
  const id = user.mangopay_provider_id

  mangoApi.Users.createKycDocument(id, objStatus)
    .then(result => {
      const documentId = result.Id
      console.log(`Create identity proof ${documentId} for provider ${id}`)
      user.identity_proof_id = documentId
      user.id_card_status = KycDocumentStatus.Created
      user.save()
        .then(u => console.log(`User saved id proof ${u.identity_proof_id}`))
        .catch(err => console.error(err))

      const id_recto = path.resolve(user.id_card.recto)
      mangoApi.Users.createKycPageFromFile(id, documentId, id_recto)
        .then(() => {
          console.log(`Created KyCPage recto ${id_recto}`)
          const id_verso = user.id_card.verso ? path.resolve(user.id_card.verso) : null

          const prom = id_verso == null ? Promise.resolve() : mangoApi.Users.createKycPageFromFile(id, documentId, id_verso)
          prom.then(resultVerso => {
            console.log(resultVerso ? `Created KyCPage verso ${id_verso}` : 'No verso required')
            // TODO : PersonType.Legal : ask for validation only on first resrvation
            console.log('Asking for KYC validation')
            const updateObj = {Id: documentId, Status: KycDocumentStatus.ValidationAsked}
            mangoApi.Users.updateKycDocument(user.mangopay_provider_id, updateObj)
              .then(() => console.log('Validation asked OK'))
              .catch(err => console.error(`Validation asked error:${err}`))
            user.id_card_status = KycDocumentStatus.ValidationAsked
            user.save()
              .then(u => console.log(`User ${u._id} set ${u.identity_proof_id} to ${KycDocumentStatus.ValidationAsked}`))
              .catch(err => console.error(err))
          })
            .catch(err => {
              console.error(`While creating KycPageFromFile:${JSON.stringify(err)}`)
            })
        })
    })
    .catch(err => console.error(err))
}

const addRegistrationProof = user => {
  console.log('addRegistrationProof')

  if (!user.mangopay_provider_id) {
    console.log(`User ${user._id}:pas besoin d'envoyer de preuve d'immatriculation pour un client`)
    return false
  }

  const objStatus = {Type: KycDocumentType.RegistrationProof}

  const id = user.mangopay_provider_id

  mangoApi.Users.createKycDocument(id, objStatus)
    .then(result => {
      const documentId = result.Id
      console.log(`Create identity proof ${documentId} for provider ${id}`)
      user.registration_proof_id = documentId
      user.registration_proof_status = KycDocumentStatus.Created
      user.save()
        .then(u => console.log(`User saved registration proof ${u.identity_proof_id}`))
        .catch(err => console.error(err))

      const id_reg = path.resolve(user.registration_proof)
      mangoApi.Users.createKycPageFromFile(id, documentId, id_reg)
        .then(() => {
          console.log(`Created KyCPage recto ${id_reg}`)

          console.log('Asking for KYC validation')
          const updateObj = {Id: documentId, Status: KycDocumentStatus.ValidationAsked}
          mangoApi.Users.updateKycDocument(user.mangopay_provider_id, updateObj)
            .then(() => console.log('Validation asked OK'))
            .catch(err => console.error(`Validation asked error:${err}`))
          user.registration_proof_status = KycDocumentStatus.ValidationAsked
          user.save()
            .then(u => console.log(`User ${u._id} set ${u.registration_proof_id} to ${KycDocumentStatus.ValidationAsked}`))
            .catch(err => console.error(err))
        })
    })
    .catch(err => console.error(err))
}

const createPayment = (booking, mangopay_source_id, mangopay_destination_id, amount, transfer_att, payout_att) => {

  console.log(`Creating payment booking ${booking._id} from ${mangopay_source_id} to ${mangopay_destination_id}`)
  const result={}
  return new Promise(resolve => {
    const transferPromise = booking[transfer_att] ?
      Promise.resolve({Id: booking[transfer_att]})
      : createTransfer(mangopay_source_id, mangopay_destination_id, amount)
    transferPromise
      .then(transfer => {
        result[transfer_att] = transfer.Id
        const payoutPromise = booking[payout_att] ?
          Promise.resolve({Id: booking[payout_att]})
          : createPayout(mangopay_destination_id, amount)
        return payoutPromise
      })
      .then(payout => {
        result[payout_att] = payout.Id
        resolve(result)
      })
      .catch(err => {
        console.error(err)
        resolve(result)
      })
  })
}

/**
* payBooking : transfers from customer to alfred and pays out Alfred
* - standard : transfer booking.amount-booking.fees from customer to Alfred. Fees were taken during pay in
* - AvoCotés : transfer booking.amount-booking.fees from customer to Alfred, including fees to My Alfred
*/
const payBooking = (booking, context) => {
  console.log(`Starting paying of booking ${booking._id}`)
  const role = booking.user_role

  let customer_promise = null
  if ([ADMIN, MANAGER].includes(role)) {
    customer_promise = Company.findById(booking.user.company)
  }
  // Avocotés : debit from customer account, fees are admin booking fees
  else if (booking.customer_booking) {
    customer_promise = Promise.resolve(booking.customer_booking.user)
    amount = booking.amount
    fees = booking.fees
  }
  else {
    customer_promise = Promise.resolve(booking.user)
  }

  const recipients=[]

  // Paiement Alfred
  if (booking.alfred_amount && !(booking.mangopay_transfer_id && booking.mangopay_payout_id)) {
    recipients.push(
      {recipient_promise: context.getModel('User').findById(booking.alfred._id), amount: booking.alfred_amount, transfer_att: 'mangopay_transfer_id', payout_att: 'mangopay_payout_id'},
    )
  }

  // Paiement comm. sur l'Alfred
  if (booking.provider_fee && !(booking.provider_fee_transfer_id && booking.provider_fee_payout_id)) {
    recipients.push(
      {recipient_promise: context.getModel('Company').findById(context.getProviderFeeRecipient()), amount: booking.provider_fee, transfer_att: 'provider_fee_transfer_id', payout_att: 'provider_fee_payout_id'},
    )
  }

  // Paiement comm. sur le client
  if (booking.customer_fee && !(booking.customer_fee_transfer_id && booking.customer_fee_payout_id)) {
    recipients.push(
      {recipient_promise: context.getModel('Company').findById(context.getCustomerFeeRecipient()), amount: booking.customer_fee, transfer_att: 'customer_fee_transfer_id', payout_att: 'customer_fee_payout_id'},
    )
  }

  console.log(`To pay:${recipients.length} recipients`)

  // TODO payBooking pour client Avocotés : alfred_amount pour Alfred, fees pour My Alfred
  let customer_mangopay_id=null
  customer_promise
    .then(entity => {
      customer_mangopay_id=entity.id_mangopay
      Promise.allSettled(recipients.map(r => r.recipient_promise))
        .then(result => {
          console.log(`recipients:${result.map(r => r.status)}`)
          const trsfPayPromises = result.map((r, idx) => {
            const recipient=recipients[idx]
            const res = r.status=='fulfilled' ?
              createPayment(
                booking, customer_mangopay_id, r.value.mangopay_provider_id,
                recipient.amount, recipient.transfer_att, recipient.payout_att)
              :
              null
            console.log(`Handling recipient ${idx}:${res}`)
            return res
          })
            .filter(data => !!data)
          Promise.allSettled(trsfPayPromises)
            .then(result => {
              result.filter(r => r.status=='fulfilled')
                .forEach(obj => {
                  Object.entries(obj.value).forEach(o => {
                    booking[o[0]]=o[1]
                  })
                })
              if (
                !!booking.alfred_amount==!!booking.mangopay_payout_id
                && !!booking.provider_fee==!!booking.provider_fee_payout_id
                && !!booking.customer_fee==!!booking.customer_fee_payout_id
              ) {
                booking.paid=true
                booking.date_payment=moment()
              }
              booking.save()
            })
        })
    })
    .catch(err => {
      console.error(err)
    })
}

// TODO : update hook s'il existe pour éviter les warning au démarrage
const install_hooks= (hook_types, url) => {
  if (is_development()) {
    return console.log(`Dev mode: skipped install_hooks(${hook_types})`)
  }

  let host=get_host_url()
  if (is_development()) {
    host=host.replace('https', 'http')
  }
  const hook_url = new URL(url, host)

  mangoApi.Hooks.getAll()
    .then(declared_hooks => {

      const hook_data={
        Tag: 'MyAlfred hook',
        Status: 'ENABLED',
        Validity: 'VALID',
        Url: hook_url,
      }

      hook_types.forEach(hook_type => {
        const hook = declared_hooks.find(h => h.EventType == hook_type)
        const request = hook ?
          mangoApi.Hooks.update({Id: hook.Id, EventType: hook_type, ...hook_data})
          :
          mangoApi.Hooks.create({EventType: hook_type, ...hook_data})
        request
          .then(() => {
            console.log(`${hook ? 'Updated' : 'Created'} ${hook_type} to ${hook_url}`)
          })
          .catch(err => {
            console.error(`Error for ${hook_type}:${JSON.stringify(err)}`)
          })
      })
    })
    .catch(err => {
      console.error(err)
    })
}

const createCard = (id_mangopay, card_number, expiration_date, csv) => {
  return new Promise((resolve, reject) => {
    mangoApi.CardRegistrations.create({UserId: id_mangopay, Currency: 'EUR'})
      .then(cardRegistrationData => {
        const options = {
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        }
        const params = new URLSearchParams()
        params.append('data', cardRegistrationData.PreregistrationData)
        params.append('accessKeyRef', cardRegistrationData.AccessKey)
        params.append('cardNumber', card_number)
        params.append('cardExpirationDate', expiration_date)
        params.append('cardCvx', csv)

        axios.post(cardRegistrationData.CardRegistrationURL, params, options)
          .then(result => {
            const regData=result.data
            if (regData.includes('errorCode')) {
              const code=parseInt(regData.split('=')[1])
              console.error(`Card creation error:${code}`)
              const errMsg = MANGOPAY_ERRORS[code] || `Erreur inconnue #${code}`
              return reject(errMsg)
            }
            cardRegistrationData.RegistrationData = regData
            return mangoApi.CardRegistrations.update(cardRegistrationData)
          })
          .then(newCard => {
            return resolve(newCard)
          })
          .catch(err => {
            console.error(err)
            return reject(err)
          })
      })
      .catch(err => {
        console.error(err)
        reject(err)
      })
  })
}

module.exports = {
  mangoApi,
  createMangoClient,
  createMangoProvider,
  createOrUpdateMangoCompany,
  addIdIfRequired,
  addRegistrationProof,
  payBooking,
  install_hooks,
  createCard,
}
