const APPRENANT='apprenant'
const FORMATEUR='formateur'
const CONCEPTEUR='concepteur'
const ADMINISTRATEUR='administrateur'
const GESTIONNAIRE='gestionnaire'

const ROLES = {
  [APPRENANT]: 'Apprenant',
  [FORMATEUR]: 'Formateur',
  [CONCEPTEUR]: 'Concepteur',
  [ADMINISTRATEUR]: 'Administrateur',
  [GESTIONNAIRE]: 'Gestionnaire',
}

const PASSWORD='password'

// Resources/themes status
const RES_FINISHED='Terminé'
const RES_CURRENT='En cours'
const RES_TO_COME='A venir'
const RES_AVAILABLE='Disponible'

const STATUS={
  [RES_FINISHED]: RES_FINISHED,
  [RES_CURRENT]: RES_CURRENT,
  [RES_AVAILABLE]: RES_AVAILABLE,
  [RES_TO_COME]: RES_TO_COME,
}

module.exports={
  ROLES,
  APPRENANT,
  FORMATEUR,
  PASSWORD,
  RES_FINISHED, RES_CURRENT, RES_TO_COME, RES_AVAILABLE,
  STATUS,
}
