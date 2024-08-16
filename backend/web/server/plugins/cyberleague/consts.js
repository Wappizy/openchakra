const DISCRIMINATOR_KEY = { discriminatorKey: 'type' }
const DISC_PARTNER = 'partner'
const DISC_MEMBER = 'member'
const DISC_ADMIN = 'admin'

const ROLE_ADMIN = 'ADMIN'
const ROLE_PARTNER = 'PARTNER'
const ROLE_MEMBER = 'MEMBER'
const ROLES = {
  [ROLE_PARTNER]: 'Partenaire',
  [ROLE_MEMBER]: 'Membre',
  [ROLE_ADMIN]: 'Administrateur'
}

const CONTENT_TYPE_ARTICLE = 'ARTICLE'
const CONTENT_TYPE_GUIDE = 'GUIDE'
const CONTENT_TYPE_PODCAST = 'PODCAST'
const CONTENT_TYPE_VIDEO = 'VIDEO'
const CONTENT_TYPE = {
  [CONTENT_TYPE_ARTICLE]: 'Article',
  [CONTENT_TYPE_VIDEO]: 'Vidéo',
  [CONTENT_TYPE_PODCAST]: 'Podcast',
  [CONTENT_TYPE_GUIDE]: 'Guide'
}

const SECTOR_AERONAUTICS = `AERONAUTICS`
const SECTOR_AGRI_FOOD = `AGRI_FOOD`
const SECTOR_AUTOMOBILE = `AUTOMOBILE`
const SECTOR_OTHER = `OTHER`
const SECTOR_BIOTECHNOLOGIES = `BIOTECHNOLOGIES`
const SECTOR_BTP = `BTP`
const SECTOR_DESIGN_OFFICE = `DESIGN_OFFICE`
const SECTOR_CHEMISTRY = `CHEMISTRY`
const SECTOR_TRADE = `TRADE`
const SECTOR_COMMUNICATION = `COMMUNICATION`
const SECTOR_ACCOUNTING = `ACCOUNTING`
const SECTOR_AUDIT = `AUDIT`
const SECTOR_DEFENSE = `DEFENSE`
const SECTOR_ELECTRONICS = `ELECTRONICS`
const SECTOR_ENERGY = `ENERGY`
const SECTOR_TEACHING = `TEACHING`
const SECTOR_ENVIRONMENT = `ENVIRONMENT`
const SECTOR_ESN = `ESN`
const SECTOR_FINANCE = `FINANCE`
const SECTOR_IT = `IT`
const SECTOR_LOGISTICS = `LOGISTICS`
const SECTOR_METALLURGY = `METALLURGY`
const SECTOR_RESEARCH = `RESEARCH`
const SECTOR_HEALTH = `HEALTH`
const SECTOR_PUBLIC = `PUBLIC`
const SECTOR_TEXTILE = `TEXTILE`
const SECTOR_SPORT = `Sport`

const SECTOR = {
  [SECTOR_AERONAUTICS] : `Aéronautique`,
  [SECTOR_AGRI_FOOD] : `Agroalimentaire`,
  [SECTOR_AUTOMOBILE] : `Automobile`,
  [SECTOR_OTHER] : `Autres industries`,
  [SECTOR_BIOTECHNOLOGIES] : `Biotechnologies`,
  [SECTOR_BTP] : `BTP & construction`,
  [SECTOR_DESIGN_OFFICE] : `Bureau d'études`,
  [SECTOR_CHEMISTRY] : `Chimie, cosmétique`,
  [SECTOR_TRADE] : `Commerce et distribution`,
  [SECTOR_COMMUNICATION] : `Communication et marketing`,
  [SECTOR_ACCOUNTING] : `Comptabilité, gestion et ressources humaines`,
  [SECTOR_AUDIT] : `Conseil & audit`,
  [SECTOR_DEFENSE] : `Défense et spatial`,
  [SECTOR_ELECTRONICS] : `Electronique`,
  [SECTOR_ENERGY] : `Energie`,
  [SECTOR_TEACHING] : `Enseignement et formation`,
  [SECTOR_ENVIRONMENT] : `Environnement`,
  [SECTOR_ESN] : `ESN`,
  [SECTOR_FINANCE] : `Finance, banque et assurance`,
  [SECTOR_IT] : `Informatique, internet et communication`,
  [SECTOR_LOGISTICS] : `Logistique et transport`,
  [SECTOR_METALLURGY] : `Métallurgie`,
  [SECTOR_RESEARCH] : `Recherche`,
  [SECTOR_HEALTH] : `Santé, Pharma`,
  [SECTOR_PUBLIC] : `Secteur public & collectivités`,
  [SECTOR_TEXTILE] : `Textile`,
  [SECTOR_SPORT] : `Sport`
}

const CATEGORY_1 = '1'
const CATEGORY_2 = '2'
const CATEGORY = {
  [CATEGORY_1]: '1',
  [CATEGORY_2]: '2',
}

const JOB_GENERAL_MANAGER = `GENERAL_MANAGER`
const JOB_DIGITAL_MANAGER = `DIGITAL_MANAGER`
const JOB_IT = `IT`
const JOB_FINANCIAL_MANAGER = `FINANCIAL_MANAGER`
const JOB_GENERAL_COUNSEL = `GENERAL_COUNSEL`
const JOB_COMMERCIIAL_MANAGER = `COMMERCIIAL_MANAGER`
const JOB_MARKETING_MANAGER = `MARKETING_MANAGER`
const JOB_STUDENT = `STUDENT`
const JOB_OTHER = `OTHER`

const JOBS = {
  [JOB_GENERAL_MANAGER]: `Direction Générale`,
  [JOB_DIGITAL_MANAGER]: `Direction du digital`,
  [JOB_IT]: `Direction informatique`,
  [JOB_FINANCIAL_MANAGER]: `Direction financière`,
  [JOB_GENERAL_COUNSEL]: `Direction Juridique`,
  [JOB_COMMERCIIAL_MANAGER]: `Direction commerciale`,
  [JOB_MARKETING_MANAGER]: `Direction Marketing`,
  [JOB_STUDENT]: `Etudiant`,
  [JOB_OTHER]: `Autres`
}

const COMPANY_SIZE_0_10 = `0-10`
const COMPANY_SIZE_11_250 = `11-250`
const COMPANY_SIZE_251_5000 = `251-5000`
const COMPANY_SIZE_5001_PLUS = `5001_PLUS`

const COMPANY_SIZE = {
  [COMPANY_SIZE_0_10]:'0-10',
  [COMPANY_SIZE_11_250]:'11-250',
  [COMPANY_SIZE_251_5000]:'251-5000',
  [COMPANY_SIZE_5001_PLUS]:'5001 et plus',
}

module.exports = {
  DISC_ADMIN, DISC_MEMBER, DISC_PARTNER, DISCRIMINATOR_KEY,
  ROLES, ROLE_ADMIN, ROLE_MEMBER, ROLE_PARTNER,
  CONTENT_TYPE, CONTENT_TYPE_ARTICLE, CONTENT_TYPE_GUIDE, CONTENT_TYPE_PODCAST, CONTENT_TYPE_VIDEO,
  SECTOR,
  CATEGORY, CATEGORY_1, CATEGORY_2,
  JOBS, JOB_GENERAL_MANAGER, JOB_DIGITAL_MANAGER, JOB_IT, JOB_FINANCIAL_MANAGER, JOB_GENERAL_COUNSEL, JOB_COMMERCIIAL_MANAGER, JOB_MARKETING_MANAGER, JOB_STUDENT, JOB_OTHER,
  COMPANY_SIZE,
}