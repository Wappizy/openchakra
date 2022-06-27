const crypto = require('crypto')
const {getDataModel} = require('../config/config')

const API_PATH = '/myAlfred/api'

const ALL_SERVICES = ['Tous les services', null]

const PLUGIN_CONSTS=require(`./${getDataModel()}/consts`)

const ALF_CONDS = { // my alfred condiitons
  BASIC: '0',
  PICTURE: '1',
  ID_CARD: '2',
  RECOMMEND: '3',
}

const CANCEL_MODE = {
  FLEXIBLE: '0',
  MODERATE: '1',
  STRICT: '2',
}

const CUSTOM_PRESTATIONS_FLTR = 'Prestations personnalisées'
const COMPANY_PRIVATE_FLTR = 'Prestations entreprise'

const generate_id = () => {
  return crypto.randomBytes(20).toString('hex')
}

const GID_LEN = 40

const CESU = ['Mandatory', 'Optional', 'Disabled']

const SKILLS={
  careful: {
    label: 'Travail soigneux',
    picture: 'careful_work',
    entrieName: 'careful',
  },
  punctual: {
    label: 'Ponctualité',
    picture: 'punctuality',
    entrieName: 'punctual',
  },
  flexible: {
    label: 'Flexibilité',
    picture: 'flexibility',
    entrieName: 'flexible',
  },
  reactive: {
    label: 'Réactivité',
    picture: 'reactivity',
    entrieName: 'reactive',
  },
}

const LANGUAGES= [
  {value: 'Français', label: 'Français'},
  {value: 'LSF', label: 'LSF'},
  {value: 'Anglais', label: 'Anglais'},
  {value: 'Allemand', label: 'Allemand'},
  {value: 'Espagnol', label: 'Espagnol'},
  {value: 'Chinois', label: 'Chinois'},
  {value: 'Arabe', label: 'Arabe'},
  {value: 'Portugais', label: 'Portugais'},
  {value: 'Russe', label: 'Russe'},
  {value: 'Japonais', label: 'Japonais'},
]

const MAX_DESCRIPTION_LENGTH=300

const REVIEW_STATUS= {
  NOT_MODERATED: 'Non modéré',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
}

// Délai d'expiration des réservatins (jours après création de la résa)
const EXPIRATION_DELAY=7

// Fermeture auto notificaitons nack en secondes
const CLOSE_NOTIFICATION_DELAY=3

// Fermeture $age minimum inscription
const ACCOUNT_MIN_AGE = 18

const COMPANY_SIZE= {
  'MICRO': '<10', // Micro-entreprise
  'PMEPMI': '>10 <250', // PME/PMI
  'ETI': '>250 <5000', // Micro-entreprise
  'GRANDE': '>5000', // Grande entreprise
}

const COMPANY_ACTIVITY = {
  'ADM': 'Administration, fonction publique',
  'AGRO': 'Agroalimentaire',
  'ART': "Artisanat d'art",
  'ASSO': 'Associations',
  'BAN': 'Banques, assurances, services financiers',
  'CHIM': 'Chimie, plastique, conditionnement',
  'DET': 'Commerce de détail, grande distribution',
  'COMM': 'Communication, marketing, information',
  'CONSTR': 'Construction, bâtiment, travaux publics',
  'CULT': 'Culture, sports, loisirs',
  'ENER': 'Energie',
  'ENS': 'Enseignement, formation',
  'ENV': "Environnement, récupération, tri, recyclage, traitement des déchets, matériaux, de l'eau",
  'EQUIP': 'Equipement, matériel pour activités professionnelles',
  'FAB': "Fabrication, commerce de gros d'articles destinés à la vente",
  'GESTION': 'Gestion, administration des entreprises',
  'HOTEL': 'Hôtellerie, restauration, tourisme',
  'IMMO': 'Immobilier',
  'TEXT': 'Industrie textile',
  'INFO': 'Informatique',
  'ING': "Ingénieurs d'études et de recherche, chercheurs",
  'LOGIS': 'Logistique, transports',
  'ELECTRO': 'Matériel électrique, électronique, optique',
  'MECA': 'Mécanique, métallurgie',
  'SIDER': 'Minerais, minéraux, sidérurgie',
  'JURI': 'Professions juridiques',
  'SANTE': 'Santé, action sociale',
  'SERVICE': 'Services aux particuliers, collectivités, entreprises',
}

const MONTH_PERIOD='MONTHLY'
const YEAR_PERIOD='ANNUALY'

const BUDGET_PERIOD = {
  [MONTH_PERIOD]: 'Mois',
  [YEAR_PERIOD]: 'An',
}

const PRO='professional'
const PART='particular'

const CREASHOP_MODE={
  CREATION: 'creation',
  SERVICE_ADD: 'add',
  SERVICE_UPDATE: 'edit',
}

const YEARS_RANGE = {
  0: 'Entre 0 et 1 an',
  1: 'Entre 1 et 5 ans',
  2: 'Entre 5 et 10 ans',
  3: 'Plus de 10 ans',
}

const REGISTER_MODE={
  COMPLETE: 'fullRegister',
  INCOMPLETE: 'setAlfredRegister',
}

const MICROSERVICE_MODE='MICROSERVICE'
const CARETAKER_MODE='CARETAKER'

const DASHBOARD_MODE ={
  [MICROSERVICE_MODE]: 'microservice',
  [CARETAKER_MODE]: 'conciergerie',
}

const PEND_EMPLOYEE_REGISTER='PEND_EMPLOYEE_REGISTER'
const PEND_ALFRED_PRO_REGISTER='PEND_ALFRED_PRO_REGISTER'

const PENDING_REASONS= {
  [PEND_EMPLOYEE_REGISTER]: 'Inscription employé',
  [PEND_ALFRED_PRO_REGISTER]: 'Inscription Alfred',
}

const IMAGE_EXTENSIONS='.png .jpg .gif .jpeg .pdf .svg'.toLowerCase().split(' ')
const TEXT_EXTENSIONS='.csv .txt'.toLowerCase().split(' ')
const XL_EXTENSIONS='.xlsx .csv .txt'.toLowerCase().split(' ')

const INSURANCE_TYPES={
  RC: 'RC professionnelle',
  MULTI: 'Multirisques professionnelle',
  DEC: 'Garantie décennale',
}

const COMMISSION_SOURCE={
  PROVIDER: 'prestataire',
  CUSTOMER: 'client',
}

const TRANSACTION_CREATED = 'CREATED'
const TRANSACTION_SUCCEEDED = 'SUCCEEDED'
const TRANSACTION_FAILED ='FAILED'

const AVOCOTES_COMPANY_NAME='AOD avocotés'

module.exports = {
  ALL_SERVICES, ALF_CONDS, CANCEL_MODE, CUSTOM_PRESTATIONS_FLTR,
  generate_id, GID_LEN, CESU,
  SKILLS, LANGUAGES, MAX_DESCRIPTION_LENGTH, EXPIRATION_DELAY,
  CLOSE_NOTIFICATION_DELAY, ACCOUNT_MIN_AGE, COMPANY_SIZE, COMPANY_ACTIVITY,
  BUDGET_PERIOD, PRO, PART, CREASHOP_MODE,
  MONTH_PERIOD, YEAR_PERIOD, DASHBOARD_MODE, MICROSERVICE_MODE, CARETAKER_MODE, REGISTER_MODE,
  COMPANY_PRIVATE_FLTR, AVOCOTES_COMPANY_NAME, PENDING_REASONS, YEARS_RANGE,
  IMAGE_EXTENSIONS, TEXT_EXTENSIONS, INSURANCE_TYPES,
  REVIEW_STATUS, COMMISSION_SOURCE, TRANSACTION_CREATED, TRANSACTION_FAILED,
  TRANSACTION_SUCCEEDED, ...PLUGIN_CONSTS, XL_EXTENSIONS, API_PATH,
}
