const moment = require('moment');
const path = require('path');
const emptyPromise = require('./promise');
const {MANGOPAY_CONFIG} = require('../config/config')
const mangopay = require('mangopay2-nodejs-sdk');
const KycDocumentType = require('mangopay2-nodejs-sdk/lib/models/KycDocumentType');
const KycDocumentStatus = require('mangopay2-nodejs-sdk/lib/models/KycDocumentStatus');
const PersonType = require('mangopay2-nodejs-sdk/lib/models/PersonType');
const mangoApi = new mangopay(MANGOPAY_CONFIG)
const {is_development, get_host_url} = require('../config/config');
const process=require('process')

const createMangoClient = user => {
  var userData = {
    PersonType: PersonType.Natural,
    FirstName: user.firstname,
    LastName: user.name,
    Birthday: moment(user.birthday).unix(),
    Nationality: 'FR',
    CountryOfResidence: 'FR',
    Email: user.email,
    Tag: `Client ${user._id} / ${user.firstname} ${user.name}`,
  };

  mangoApi.Users.create(userData)
    .then(newUser => {
      console.log(`Created Mango User ${JSON.stringify(newUser)}`);
      user.id_mangopay = newUser.Id;
      user.save().then().catch();
      mangoApi.Wallets.create({
        Owners: [newUser.Id],
        Description: `Wallet ${user._id} / ${user.firstname} ${user.name} client`,
        Currency: 'EUR',
      })
        .then(wallet => {
          console.log(`Created Wallet ${JSON.stringify(wallet)}`);
        })
        .catch(err => {
          console.error(`Création wallet user ${user.firstname} ${user.name}:${JSON.stringify(err)}`);
        });
    })
    .catch(err => {
      console.error(`Création mangopay user ${user.firstname} ${user.name}:${JSON.stringify(err)}`);
    });
};

const createMangoProvider = (user, shop) => {

  console.log(`Creating mango provider for ${user.name}`);
  var userData = {
    PersonType: shop.is_particular ? PersonType.Natural : PersonType.Legal,
    FirstName: user.firstname,
    LastName: user.name,
    Birthday: moment(user.birthday).unix(),
    Nationality: 'FR',
    CountryOfResidence: 'FR',
    Email: user.email,
    Tag: `Provider ${user._id} / ${user.firstname} ${user.name}`,
  };
  if (shop.is_professional) {
    const addr = user.billing_address;
    userData.LegalPersonType = 'SOLETRADER';
    userData.Name = shop.company.name;
    userData.CompanyNumber = shop.company.siret;
    userData.LegalRepresentativeFirstName = user.firstname;
    userData.LegalRepresentativeLastName = user.name;
    userData.LegalRepresentativeBirthday = moment(user.birthday).unix();
    userData.LegalRepresentativeNationality = 'FR';
    userData.LegalRepresentativeCountryOfResidence = 'FR';
    userData.LegalRepresentativeEmail = user.email;
    const mangoAddr = new mangoApi.models.Address({
      AddressLine1: addr.address,
      AddressLine2: '',
      City: addr.city,
      Region: '',
      PostalCode: addr.zip_code,
      Country: 'FR',
    });
    userData.HeadquartersAddress = mangoAddr;
    userData.LegalRepresentativeAddress = mangoAddr;
  }

  mangoApi.Users.create(userData)
    .then(newUser => {
      console.log(`Created Mango User ${JSON.stringify(newUser)}`);
      user.mangopay_provider_id = newUser.Id;
      user.mangopay_provider_status = newUser.PersonType;
      user.save().then().catch();
      mangoApi.Wallets.create({
        Owners: [newUser.Id],
        Description: `Wallet ${user._id} / ${user.firstname} ${user.name} provider`,
        Currency: 'EUR',
      })
        .then(wallet => {
          console.log(`Created Wallet ${JSON.stringify(wallet)}`);
        });
    });
};

const createOrUpdateMangoCompany = company => {

  console.log(`Creating/updating mango company for company ${company.name}, representative is ${company.representative.full_name}`);
  var companyData = {
    PersonType: PersonType.Legal,
    Name: company.name,
    Email: company.representative.email,
    LegalPersonType: 'BUSINESS',
    LegalRepresentativeFirstName: company.representative.firstname,
    LegalRepresentativeLastName: company.representative.name,
    LegalRepresentativeEmail: company.representative.email,
    HeadquartersAddress: new mangoApi.models.Address({
        AddressLine1: company.billing_address.address,
        AddressLine2: '',
        City: company.billing_address.city,
        Region: '',
        PostalCode: company.billing_address.zip_code,
        Country: 'FR',
    }),
    LegalRepresentativeBirthday: moment(company.representative.birthday).unix(),
    LegalRepresentativeNationality: 'FR',
    LegalRepresentativeCountryOfResidence: 'FR',
    CompanyNumber: company.siret,
    Tag: `Company ${company.name}/Repr. ${company.representative.full_name}`
  };

  var method;
  if (company.id_mangopay) {
    companyData.Id = company.id_mangopay
    method = mangoApi.Users.update(companyData)
  }
  else {
    method = mangoApi.Users.create(companyData)
  }
  method
    .then(mangopay_company => {
      console.log(`Created Mango company ${JSON.stringify(mangopay_company)}`);
      company.id_mangopay = mangopay_company.Id;
      company.save()
        .then( res => console.log(`Created/update company ${JSON.stringify(company)}`))
        .catch( err => console.error(err))
      mangoApi.Wallets.create({
        Owners: [mangopay_company.Id],
        Description: `Wallet ${company._id} / ${company.name}company`,
        Currency: 'EUR',
      })
        .then(wallet => {
          console.log(`Created Wallet ${JSON.stringify(wallet)}`);
        })
        .catch(err => {
          console.log(`Could not create Wallet:${err}`);
        })
    });
};

const addIdIfRequired = user => {
  console.log('addIdIfRequired');

  const objStatus = {
    Type: KycDocumentType.IdentityProof,
  };
  const id = user.mangopay_provider_id;

  mangoApi.Users.createKycDocument(id, objStatus)
    .then(result => {
      const documentId = result.Id;
      console.log(`Create identity proof ${documentId} for provider ${id}`);
      user.identity_proof_id = documentId;
      user.id_card_status = KycDocumentStatus.Created;
      user.save()
        .then(u => console.log(`User saved id proof ${user.identity_proof_id}`))
        .catch(err => console.error(err));

      const id_recto = path.resolve(user.id_card.recto);
      mangoApi.Users.createKycPageFromFile(id, documentId, id_recto)
        .then(resultRecto => {
          console.log(`Created KyCPage recto ${id_recto}`);
          const id_verso = user.id_card.verso ? path.resolve(user.id_card.verso) : null;

          const prom = id_verso == null ? emptyPromise() : mangoApi.Users.createKycPageFromFile(id, documentId, id_verso);
          prom.then(resultVerso => {
            console.log(resultVerso ? `Created KyCPage verso ${id_verso}` : `No verso required`);
            // TODO : PersonType.Legal : ask for validation only on first resrvation
            console.log('Asking for KYC validation');
            const updateObj = {Id: documentId, Status: KycDocumentStatus.ValidationAsked};
            mangoApi.Users.updateKycDocument(user.mangopay_provider_id, updateObj)
              .then(() => console.log('Validation asked OK'))
              .catch(err => console.error('Validation asked error:${err}'));
            user.id_card_status = KycDocumentStatus.ValidationAsked;
            user.save()
              .then(u => console.log(`User ${user._id} set ${user.identity_proof_id} to ${KycDocumentStatus.ValidationAsked}`))
              .catch(err => console.error(err));
          })
            .catch(err => {
              console.error(`While creating KycPageFromFile:${JSON.stringify(err)}`);
            });
        });
    })
    .catch(err => console.error(err));
};

const addRegistrationProof = user => {
  console.log('addRegistrationProof');

  if (!user.mangopay_provider_id) {
    console.log(`User ${user._id}:pas besoin d'envoyer de preuve d'immatriculation pour un client`);
    return false;
  }

  const objStatus = {Type: KycDocumentType.RegistrationProof};

  const id = user.mangopay_provider_id;

  mangoApi.Users.createKycDocument(id, objStatus)
    .then(result => {
      const documentId = result.Id;
      console.log(`Create identity proof ${documentId} for provider ${id}`);
      user.registration_proof_id = documentId;
      user.registration_proof_status = KycDocumentStatus.Created;
      user.save()
        .then(u => console.log(`User saved registration proof ${user.identity_proof_id}`))
        .catch(err => console.error(err));

      const id_reg = path.resolve(user.registration_proof);
      mangoApi.Users.createKycPageFromFile(id, documentId, id_reg)
        .then(result => {
          console.log(`Created KyCPage recto ${id_reg}`);

          console.log('Asking for KYC validation');
          const updateObj = {Id: documentId, Status: KycDocumentStatus.ValidationAsked};
          mangoApi.Users.updateKycDocument(user.mangopay_provider_id, updateObj)
            .then(() => console.log('Validation asked OK'))
            .catch(err => console.error('Validation asked error:${err}'));
          user.registration_proof_status = KycDocumentStatus.ValidationAsked;
          user.save()
            .then(u => console.log(`User ${user._id} set ${user.registration_proof_id} to ${KycDocumentStatus.ValidationAsked}`))
            .catch(err => console.error(err));
        });
    })
    .catch(err => console.error(err));
};

const payAlfred = booking => {
  console.log(`Starting paying of booking ${JSON.stringify(booking)}`);
  const amount = (booking.amount - booking.fees) * 100;
  const id_mangopay_user = booking.user.id_mangopay;
  const id_mangopay_alfred = booking.alfred.mangopay_provider_id;

  mangoApi.Users.getWallets(id_mangopay_user)
    .catch(err => {
      console.error('Err:' + JSON.stringify(err));
      return;
    })
    .then(wallets => {
      const wallet_id = wallets[0].Id;
      mangoApi.Users.getWallets(id_mangopay_alfred)
        .catch(err => {
          console.error(`GetWallets Alfred ${id_mangopay_alfred}:${JSON.stringify(err)}`);
          return;
        })
        .then(wallet_alfred => {
          const id_wallet_alfred = wallet_alfred[0].Id;

          const transferPromise = booking.mangopay_transfer_id ?
            emptyPromise()
            :
            mangoApi.Transfers.create({
              AuthorId: id_mangopay_user,
              DebitedFunds: {Currency: 'EUR', Amount: amount},
              Fees: {Currency: 'EUR', Amount: 0},
              DebitedWalletId: wallet_id,
              CreditedWalletId: id_wallet_alfred,
            });

          transferPromise.then(trsf => {
              if (trsf) { // Transfer did not already exist
                if (trsf.Status == 'FAILED') {
                  console.error(`Transfer failed:${trsf.ResultMessage}`);
                  return;
                }
                booking.mangopay_transfer_id = trsf.Id;
                booking.save()
                  .then(b => console.log(`Set transfer to ${trsf.Id} to booking ${b._id}]`))
                  .catch(err => {
                    console.log(`Error creating transfer for booking ${b._id}`);
                    return;
                  });
              }
              mangoApi.Users.getBankAccounts(id_mangopay_alfred)
                .catch(err => {
                  console.error(err);
                  return;
                })
                .then(accounts => {
                  accounts = accounts.filter(a => a.Active);
                  if (accounts.length == 0) {
                    console.log(`No active bank account for Alfred ${id_mangopay_alfred}`);
                    return;
                  }
                  mangoApi.PayOuts.create({
                    AuthorId: id_mangopay_alfred,
                    DebitedFunds: {Currency: 'EUR', Amount: amount},
                    Fees: {Currency: 'EUR', Amount: 0},
                    BankAccountId: accounts[0].Id,
                    DebitedWalletId: id_wallet_alfred,
                    BankWireRef: `My Alfred`,
                    PaymentType: 'BANK_WIRE',
                  })
                    .catch(err => {
                      console.error(err);
                      return;
                    })
                    .then(
                      po => {
                        console.log('Create payout OK:' + JSON.stringify(po));
                        booking.mangopay_payout_id = po.Id;
                        booking.paid = true;
                        booking.date_payment = moment();
                        booking.save().then().catch();
                      },
                      err => {
                        console.error('Create Payout error:' + JSON.stringify(err));
                      },
                    );
                });
            },
            err => {
              err => console.error('Create transfer error:' + JSON.stringify(err));
            },
          );
        });
    });
};

// TODO : update hook s'il existe pour éviter les warning au démarrage
const install_hooks= (hook_types, url) => {

  if (is_development() && process.platform != 'darwin') {
    return console.log(`Dev mode: skipped install_hooks(${hook_types})`)
  }

  var host=get_host_url()
  if (is_development()) {
    host=host.replace('https', 'http')
  }
  const hook_url = new URL(url, host);

  mangoApi.Hooks.getAll()
    .then (declared_hooks => {

      const hook_data={
        Tag: 'MyAlfred hook',
        Status: 'ENABLED',
        Validity: 'VALID',
        Url: hook_url,
      }

      hook_types.forEach(hook_type => {
        const hook = declared_hooks.find(h => h.EventType == hook_type)
        var request
        if (hook) {
          request = mangoApi.Hooks.update({ Id: hook.Id, EventType: hook_type, ...hook_data})
        }
        else {
          request = mangoApi.Hooks.create({EventType: hook_type, ...hook_data})
        }
        request
          .then( res => {
            console.log(`${hook ? 'Updated' : 'Created'} ${hook_type} to ${hook_url}`);
          })
          .catch ( err => {
            console.error(`Error for ${hook_type}:${err}`)
            //console.error(err)
          })
      })
    })
    .catch (err => {
      console.error(err)
    })
}

module.exports = {
  mangoApi,
  createMangoClient,
  createMangoProvider,
  createOrUpdateMangoCompany,
  addIdIfRequired,
  addRegistrationProof,
  payAlfred,
  install_hooks,
};
