const lodash=require('lodash')
const { sortObject } = require('../../../utils/text')

const ROLE_TI='TI'
const ROLE_COMPANY_BUYER='COMPANY_BUYER'
const ROLE_COMPANY_ADMIN='COMPANY_ADMIN'
const ROLE_ALLE_ADMIN='ALLE_ADMIN'
const ROLE_ALLE_SUPER_ADMIN='ALLE_SUPER_ADMIN'

const ROLES={
  [ROLE_TI]: 'TI',
  [ROLE_COMPANY_BUYER]: 'Acheteur entreprise',
  [ROLE_COMPANY_ADMIN]: 'Admin. entreprise',
  [ROLE_ALLE_ADMIN]: 'Admin. All-E',
  [ROLE_ALLE_SUPER_ADMIN]: 'Super admin. All-E',
}

const DEFAULT_ROLE=ROLE_TI

const COACH_ALLE='COACH_ALLE'
const COACH_OTHER='COACH_OTHER'
const COACH_NONE='COACH_NONE'

const COACHING={
  COACH_ALLE: 'Accompagné.e par All-Inclusive',
  COACH_OTHER: 'Accompagné.e par un autre organisme',
  COACH_NONE: 'Pas accompagné.e',
}

const COMPANY_STATUS_EI="COMPANY_STATUS_EI"
const COMPANY_STATUS_EURL="COMPANY_STATUS_EURL"
const COMPANY_STATUS_SARL="COMPANY_STATUS_SARL"
const COMPANY_STATUS_SA="COMPANY_STATUS_SA"
const COMPANY_STATUS_SAS="COMPANY_STATUS_SAS"
const COMPANY_STATUS_SASU="COMPANY_STATUS_SASU"
const COMPANY_STATUS_SNC="COMPANY_STATUS_SNC"
const COMPANY_STATUS_SCOP="COMPANY_STATUS_SCOP"
const COMPANY_STATUS_SCA="COMPANY_STATUS_SCA"
const COMPANY_STATUS_SCS="COMPANY_STATUS_SCS"

const COMPANY_STATUS={
  COMPANY_STATUS_EI:"Entreprise individuelle",
  COMPANY_STATUS_EURL:"Entreprise unipersonnelle à responsabilité limitée",
  COMPANY_STATUS_SARL:"Société anonyme à responsabilité limitée",
  COMPANY_STATUS_SA:"Société anonyme",
  COMPANY_STATUS_SAS:"Société par actions simplifiées",
  COMPANY_STATUS_SASU:"Société par actions simplifiées unipersonnelle",
  COMPANY_STATUS_SNC:"Société en nom collectif",
  COMPANY_STATUS_SCOP:"Société coopérative de production",
  COMPANY_STATUS_SCA:"Société en commandite par actions",
  COMPANY_STATUS_SCS:"Société en commandite simple",
}

const AVAILABILITY_AVAILABLE="AVAILABILITY_AVAILABLE"
const AVAILABILITY_NOT_AVAILABLE="AVAILABILITY_NOT_AVAILABLE"

const AVAILABILITY={
 AVAILABILITY_AVAILABLE:"Disponible",
 AVAILABILITY_NOT_AVAILABLE:"Indisponible",
}

const EXPERIENCE_LESS_1="EXPERIENCE_LESS_1"
const EXPERIENCE_1_TO_5="EXPERIENCE_1_TO_5"
const EXPERIENCE_6_TO_10="EXPERIENCE_6_TO_10"
const EXPERIENCE_MORE_THAN_10="EXPERIENCE_MORE_THAN_10"

const EXPERIENCE={
 EXPERIENCE_LESS_1:"< 1 an",
 EXPERIENCE_1_TO_5:"de 1 à 5 ans",
 EXPERIENCE_MORE_5:"de 6 à 10 ans",
 EXPERIENCE_MORE_THAN_10:"> 10 ans",
}

const COMPANY_ACTIVITY_AGROALIMENTAIRE='COMPANY_ACTIVITY_AGROALIMENTAIRE'
const COMPANY_ACTIVITY_BANQUE='COMPANY_ACTIVITY_BANQUE'
const COMPANY_ACTIVITY_ASSURANCE='COMPANY_ACTIVITY_ASSURANCE'
const COMPANY_ACTIVITY_BOIS='COMPANY_ACTIVITY_BOIS'
const COMPANY_ACTIVITY_PAPIER='COMPANY_ACTIVITY_PAPIER'
const COMPANY_ACTIVITY_CARTON='COMPANY_ACTIVITY_CARTON'
const COMPANY_ACTIVITY_IMPRIMERIE='COMPANY_ACTIVITY_IMPRIMERIE'
const COMPANY_ACTIVITY_BTP='COMPANY_ACTIVITY_BTP'
const COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION='COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION'
const COMPANY_ACTIVITY_CHIMIE='COMPANY_ACTIVITY_CHIMIE'
const COMPANY_ACTIVITY_PARACHIMIE='COMPANY_ACTIVITY_PARACHIMIE'
const COMPANY_ACTIVITY_COMMERCE='COMPANY_ACTIVITY_COMMERCE'
const COMPANY_ACTIVITY_NEGOCE='COMPANY_ACTIVITY_NEGOCE'
const COMPANY_ACTIVITY_DISTRIBUTION='COMPANY_ACTIVITY_DISTRIBUTION'
const COMPANY_ACTIVITY_EDITION='COMPANY_ACTIVITY_EDITION'
const COMPANY_ACTIVITY_COMMUNICATION='COMPANY_ACTIVITY_COMMUNICATION'
const COMPANY_ACTIVITY_MULTIMEDIA='COMPANY_ACTIVITY_MULTIMEDIA'
const COMPANY_ACTIVITY_ELECTRONIQUE='COMPANY_ACTIVITY_ELECTRONIQUE'
const COMPANY_ACTIVITY_ELECTRICITE='COMPANY_ACTIVITY_ELECTRICITE'
const COMPANY_ACTIVITY_ETUDES_ET_CONSEILS='COMPANY_ACTIVITY_ETUDES_ET_CONSEILS'
const COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE='COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE'
const COMPANY_ACTIVITY_INFORMATIQUE='COMPANY_ACTIVITY_INFORMATIQUE'
const COMPANY_ACTIVITY_TELECOMS='COMPANY_ACTIVITY_TELECOMS'
const COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS='COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS'
const COMPANY_ACTIVITY_AUTOMOBILE='COMPANY_ACTIVITY_AUTOMOBILE'
const COMPANY_ACTIVITY_METALLURGIE='COMPANY_ACTIVITY_METALLURGIE'
const COMPANY_ACTIVITY_TRAVAIL_DU_METAL='COMPANY_ACTIVITY_TRAVAIL_DU_METAL'
const COMPANY_ACTIVITY_PLASTIQUE='COMPANY_ACTIVITY_PLASTIQUE'
const COMPANY_ACTIVITY_CAOUTCHOUC='COMPANY_ACTIVITY_CAOUTCHOUC'
const COMPANY_ACTIVITY_TEXTILE='COMPANY_ACTIVITY_TEXTILE'
const COMPANY_ACTIVITY_HABILLEMENT='COMPANY_ACTIVITY_HABILLEMENT'
const COMPANY_ACTIVITY_CHAUSSURE='COMPANY_ACTIVITY_CHAUSSURE'
const COMPANY_ACTIVITY_TRANSPORTS='COMPANY_ACTIVITY_TRANSPORTS'
const COMPANY_ACTIVITY_LOGISTIQUE='COMPANY_ACTIVITY_LOGISTIQUE'
const COMPANY_ACTIVITY_OTHER='COMPANY_ACTIVITY_OTHER'
const COMPANY_ACTIVITY_FORMATION='COMPANY_ACTIVITY_FORMATION'
const COMPANY_ACTIVITY_IMMOBILIER='COMPANY_ACTIVITY_IMMOBILIER'
const COMPANY_ACTIVITY_ACHATS='COMPANY_ACTIVITY_ACHATS'
const COMPANY_ACTIVITY_AIDE_ADMINISTRATIVE='COMPANY_ACTIVITY_AIDE_ADMINISTRATIVE'
const COMPANY_ACTIVITY_ANIMAUX='COMPANY_ACTIVITY_ANIMAUX'
const COMPANY_ACTIVITY_ART_ARTISANAT='COMPANY_ACTIVITY_ART_ARTISANAT'
const COMPANY_ACTIVITY_AUTO_MOTO_VELO_NAUTIQUE='COMPANY_ACTIVITY_AUTO_MOTO_VELO_NAUTIQUE'
const COMPANY_ACTIVITY_BEAUTE_BIEN_ETRE='COMPANY_ACTIVITY_BEAUTE_BIEN_ETRE'
const COMPANY_ACTIVITY_BUSINESS='COMPANY_ACTIVITY_BUSINESS'
const COMPANY_ACTIVITY_COMMUNITY_MANAGEMENT='COMPANY_ACTIVITY_COMMUNITY_MANAGEMENT'
const COMPANY_ACTIVITY_COMPTABILITE_FINANCE='COMPANY_ACTIVITY_COMPTABILITE_FINANCE'
const COMPANY_ACTIVITY_CONCIERGERIE='COMPANY_ACTIVITY_CONCIERGERIE'
const COMPANY_ACTIVITY_CONSULTING='COMPANY_ACTIVITY_CONSULTING'
const COMPANY_ACTIVITY_CUISINE_VINS_TRAITEURS='COMPANY_ACTIVITY_CUISINE_VINS_TRAITEURS'
const COMPANY_ACTIVITY_DECORATION_ARCHITECTURE='COMPANY_ACTIVITY_DECORATION_ARCHITECTURE'
const COMPANY_ACTIVITY_DROIT='COMPANY_ACTIVITY_DROIT'
const COMPANY_ACTIVITY_ENTRETIEN_BATIMENT_MAISON='COMPANY_ACTIVITY_ENTRETIEN_BATIMENT_MAISON'
const COMPANY_ACTIVITY_ESPACE_VERTS_JARDINS='COMPANY_ACTIVITY_ESPACE_VERTS_JARDINS'
const COMPANY_ACTIVITY_EVENEMENTIEL='COMPANY_ACTIVITY_EVENEMENTIEL'
const COMPANY_ACTIVITY_FORMATIONS_COURS_SCOLAIRES='COMPANY_ACTIVITY_FORMATIONS_COURS_SCOLAIRES'
const COMPANY_ACTIVITY_HIGH_TECH='COMPANY_ACTIVITY_HIGH_TECH'
const COMPANY_ACTIVITY_HYGIENE='COMPANY_ACTIVITY_HYGIENE'
const COMPANY_ACTIVITY_LANGUES_ETRANGERES='COMPANY_ACTIVITY_LANGUES_ETRANGERES'
const COMPANY_ACTIVITY_LIVRAISON='COMPANY_ACTIVITY_LIVRAISON'
const COMPANY_ACTIVITY_LOISIRS_CREATIFS='COMPANY_ACTIVITY_LOISIRS_CREATIFS'
const COMPANY_ACTIVITY_MARKETING_VENTE='COMPANY_ACTIVITY_MARKETING_VENTE'
const COMPANY_ACTIVITY_METALERIE_ART='COMPANY_ACTIVITY_METALERIE_ART'
const COMPANY_ACTIVITY_MODE_TEXTILE='COMPANY_ACTIVITY_MODE_TEXTILE'
const COMPANY_ACTIVITY_MUSIQUE_CHANT='COMPANY_ACTIVITY_MUSIQUE_CHANT'
const COMPANY_ACTIVITY_PAO_DESIGN='COMPANY_ACTIVITY_PAO_DESIGN'
const COMPANY_ACTIVITY_PHOTOGRAPHIE='COMPANY_ACTIVITY_PHOTOGRAPHIE'
const COMPANY_ACTIVITY_REDACTION_CORRECTION_TRADUCTION='COMPANY_ACTIVITY_REDACTION_CORRECTION_TRADUCTION'
const COMPANY_ACTIVITY_RESSOURCES_HUMAINES='COMPANY_ACTIVITY_RESSOURCES_HUMAINES'
const COMPANY_ACTIVITY_SERVICE_PERSONNE='COMPANY_ACTIVITY_SERVICE_PERSONNE'
const COMPANY_ACTIVITY_SMARTPHONE_TABLETTE='COMPANY_ACTIVITY_SMARTPHONE_TABLETTE'
const COMPANY_ACTIVITY_SPORT_COACHING='COMPANY_ACTIVITY_SPORT_COACHING'
const COMPANY_ACTIVITY_TRAVAUX_BRICOLAGE='COMPANY_ACTIVITY_TRAVAUX_BRICOLAGE'
const COMPANY_ACTIVITY_VETEMENT_CHAUSSURES_ACCESSOIRES='COMPANY_ACTIVITY_VETEMENT_CHAUSSURES_ACCESSOIRES'
const COMPANY_ACTIVITY_WEB='COMPANY_ACTIVITY_WEB'

const COMPANY_ACTIVITY = sortObject({
  COMPANY_ACTIVITY_OTHER: 'Autre',
  COMPANY_ACTIVITY_AIDE_ADMINISTRATIVE: 'Aide administrative',
  COMPANY_ACTIVITY_AGROALIMENTAIRE: 'Agroalimentaire',
  COMPANY_ACTIVITY_ACHATS: 'Achats',
  COMPANY_ACTIVITY_ASSURANCE: 'Assurance',
  COMPANY_ACTIVITY_ANIMAUX: 'Animaux (garde / soins)',
  COMPANY_ACTIVITY_ART_ARTISANAT: 'Art / Artisanat',
  COMPANY_ACTIVITY_AUTO_MOTO_VELO_NAUTIQUE: 'Auto-Moto-Vélo-Nautique',
  COMPANY_ACTIVITY_AUTOMOBILE: 'Automobile',
  COMPANY_ACTIVITY_AUTRE: 'Autre',
  COMPANY_ACTIVITY_BANQUE: 'Banque',
  COMPANY_ACTIVITY_BEAUTE_BIEN_ETRE: 'Beauté & Bien-être',
  COMPANY_ACTIVITY_BOIS: 'Bois',
  COMPANY_ACTIVITY_BTP: 'BTP',
  COMPANY_ACTIVITY_BUSINESS: 'Business',
  COMPANY_ACTIVITY_CAOUTCHOUC: 'Caoutchouc',
  COMPANY_ACTIVITY_CARTON: 'Carton',
  COMPANY_ACTIVITY_CHAUSSURE: 'Chaussure',
  COMPANY_ACTIVITY_CHIMIE: 'Chimie',
  COMPANY_ACTIVITY_COMMUNICATION: 'Communication',
  COMPANY_ACTIVITY_COMMUNITY_MANAGEMENT: 'Community management',
  COMPANY_ACTIVITY_COMMERCE: 'Commerce',
  COMPANY_ACTIVITY_COMPTABILITE_FINANCE: 'Comptabilité & Finance',
  COMPANY_ACTIVITY_CONCIERGERIE: 'Conciergerie',
  COMPANY_ACTIVITY_CONSULTING: 'Consulting',
  COMPANY_ACTIVITY_CUISINE_VINS_TRAITEURS: 'Cuisine Vins traiteur',
  COMPANY_ACTIVITY_DECORATION_ARCHITECTURE: 'Décoration & Architecture',
  COMPANY_ACTIVITY_DISTRIBUTION: 'Distribution',
  COMPANY_ACTIVITY_DROIT: 'Droit',
  COMPANY_ACTIVITY_EDITION: 'Édition',
  COMPANY_ACTIVITY_ELECTRICITE: 'Électricité',
  COMPANY_ACTIVITY_ELECTRONIQUE: 'Électronique',
  COMPANY_ACTIVITY_ENTRETIEN_BATIMENT_MAISON: 'Entretien bâtiment & maison',
  COMPANY_ACTIVITY_ESPACE_VERTS_JARDINS: 'Espaces verts & jardins',
  COMPANY_ACTIVITY_ETUDES_ET_CONSEILS: 'Études et conseils',
  COMPANY_ACTIVITY_EVENEMENTIEL: 'Evénementiel',
  COMPANY_ACTIVITY_FORMATION: 'Formation',
  COMPANY_ACTIVITY_FORMATIONS_COURS_SCOLAIRES: 'Formations / Cours scolaires',
  COMPANY_ACTIVITY_HABILLEMENT: 'Habillement',
  COMPANY_ACTIVITY_HIGH_TECH: 'High Tech',
  COMPANY_ACTIVITY_HYGIENE: 'Hygiène',
  COMPANY_ACTIVITY_IMMOBILIER: 'Immobilier',
  COMPANY_ACTIVITY_IMPRIMERIE: 'Imprimerie',
  COMPANY_ACTIVITY_INFORMATIQUE: 'Informatique',
  COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE: 'Industrie pharmaceutique',
  COMPANY_ACTIVITY_LANGUES_ETRANGERES: 'Langues étrangères',
  COMPANY_ACTIVITY_LIVRAISON: 'Livraison',
  COMPANY_ACTIVITY_LOGISTIQUE: 'Logistique',
  COMPANY_ACTIVITY_LOISIRS_CREATIFS: 'Loisirs créatifs',
  COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS: 'Machines et équipements',
  COMPANY_ACTIVITY_MARKETING_VENTE: 'Marketing & Vente',
  COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION: 'Matériaux de construction',
  COMPANY_ACTIVITY_METALLURGIE: 'Métallurgie',
  COMPANY_ACTIVITY_METALERIE_ART: 'Métallerie d\'Art',
  COMPANY_ACTIVITY_MODE_TEXTILE: 'Mode & Textile',
  COMPANY_ACTIVITY_MULTIMEDIA: 'Multimédia',
  COMPANY_ACTIVITY_MUSIQUE_CHANT: 'Musique & Chant',
  COMPANY_ACTIVITY_NEGOCE: 'Négoce',
  COMPANY_ACTIVITY_PAO_DESIGN: 'PAO & Design',
  COMPANY_ACTIVITY_PARACHIMIE: 'Parachimie',
  COMPANY_ACTIVITY_PAPIER: 'Papier',
  COMPANY_ACTIVITY_PHOTOGRAPHIE: 'Photographie',
  COMPANY_ACTIVITY_PLASTIQUE: 'Plastique',
  COMPANY_ACTIVITY_REDACTION_CORRECTION_TRADUCTION: 'Rédaction + correction + traduction',
  COMPANY_ACTIVITY_RESSOURCES_HUMAINES: 'Ressources humaines',
  COMPANY_ACTIVITY_SERVICE_PERSONNE: 'Service à la personne',
  COMPANY_ACTIVITY_SMARTPHONE_TABLETTE: 'Smartphone & Tablette',
  COMPANY_ACTIVITY_SPORT_COACHING: 'Sport & Coaching',
  COMPANY_ACTIVITY_TELECOMS: 'Télécoms',
  COMPANY_ACTIVITY_TEXTILE: 'Textile',
  COMPANY_ACTIVITY_TRAVAUX_BRICOLAGE: 'Travaux & Bricolage',
  COMPANY_ACTIVITY_TRAVAIL_DU_METAL: 'Travail du métal',
  COMPANY_ACTIVITY_TRANSPORTS: 'Transports',
  COMPANY_ACTIVITY_VETEMENT_CHAUSSURES_ACCESSOIRES: 'Vêtement, chaussures & accessoires',
  COMPANY_ACTIVITY_WEB: 'Web',
}, COMPANY_ACTIVITY_OTHER);

const COMPANY_SIZE_LESS_10="COMPANY_SIZE_LESS_10"
const COMPANY_SIZE_10_TO_250="COMPANY_SIZE_10_TO_250"
const COMPANY_SIZE_250_TO_5000="COMPANY_SIZE_250_TO_5000"
const COMPANY_SIZE_MORE_5000="COMPANY_SIZE_MORE_5000"

const COMPANY_SIZE={
 COMPANY_SIZE_LESS_10:"<10",
 COMPANY_SIZE_10_TO_250:"10 à 250",
 COMPANY_SIZE_250_TO_5000:"250 à 5000",
 COMPANY_SIZE_MORE_5000:">5000",
}

const CONTRACT_TYPE_CDD="CONTRACT_TYPE_CDD"
const CONTRACT_TYPE_CDI="CONTRACT_TYPE_CDI"
const CONTRACT_TYPE_STAGE="CONTRACT_TYPE_STAGE"
const CONTRACT_TYPE_ALTERNANCE="CONTRACT_TYPE_ALTERNANCE"
const CONTRACT_TYPE_FREELANCE="CONTRACT_TYPE_FREELANCE"

const CONTRACT_TYPE={
  CONTRACT_TYPE_CDD:"CDD",
  CONTRACT_TYPE_CDI:"CDI",
  CONTRACT_TYPE_STAGE:"Stage",
  CONTRACT_TYPE_ALTERNANCE:"Alternance",
  CONTRACT_TYPE_FREELANCE:"Freelance",
}

const MISSION_STATUS_ASKING="MISSION_STATUS_ASKING"
const MISSION_STATUS_ASKING_ALLE="MISSION_STATUS_ASKING_ALLE"
const MISSION_STATUS_TI_REFUSED="MISSION_STATUS_TI_REFUSED"
const MISSION_STATUS_CUST_CANCELLED="MISSION_STATUS_CUST_CANCELLED"
const MISSION_STATUS_QUOT_SENT="MISSION_STATUS_QUOT_SENT"
const MISSION_STATUS_PAYMENT_PENDING="MISSION_STATUS_PAYMENT_PENDING"
const MISSION_STATUS_QUOT_ACCEPTED="MISSION_STATUS_QUOT_ACCEPTED"
const MISSION_STATUS_QUOT_REFUSED="MISSION_STATUS_QUOT_REFUSED"
const MISSION_STATUS_TO_BILL="MISSION_STATUS_TO_BILL"
const MISSION_STATUS_BILL_SENT="MISSION_STATUS_BILL_SENT"
const MISSION_STATUS_FINISHED="MISSION_STATUS_FINISHED"
const MISSION_STATUS_DISPUTE="MISSION_STATUS_DISPUTE"

const QUOTATION_STATUS={
  MISSION_STATUS_ASKING:"Demande de mission",
  MISSION_STATUS_ASKING_ALLE:"Demande de mission TIPI",
  MISSION_STATUS_TI_REFUSED:"Mission refusée",
  MISSION_STATUS_CUST_CANCELLED: "Mission annulée",
  MISSION_STATUS_QUOT_SENT:"Devis transmis",
  MISSION_STATUS_PAYMENT_PENDING: "Paiement en cours",
  MISSION_STATUS_QUOT_ACCEPTED:"Devis accepté",
  MISSION_STATUS_QUOT_REFUSED:"Devis refusé",
  MISSION_STATUS_TO_BILL:"A facturer",
  MISSION_STATUS_BILL_SENT:"Facture transmise",
  MISSION_STATUS_FINISHED:"Terminée",
  MISSION_STATUS_DISPUTE:"Litige",
}

const MISSION_FREQUENCY_WEEKLY='MISSION_FREQUENCY_WEEKLY'
const MISSION_FREQUENCY_MONTHLY='MISSION_FREQUENCY_MONTHLY'
const MISSION_FREQUENCY_SEASONLY='MISSION_FREQUENCY_SEASONLY'
const MISSION_FREQUENCY_MULTI_YEARLY='MISSION_FREQUENCY_MULTI_YEARLY'

const MISSION_FREQUENCY={
 [MISSION_FREQUENCY_WEEKLY]:"Hebdomadaire",
 [MISSION_FREQUENCY_MONTHLY]:"Mensuelle",
 [MISSION_FREQUENCY_SEASONLY]:"Saisonnière",
 [MISSION_FREQUENCY_MULTI_YEARLY]:"Pluriannuelle",
}

const TI_TIPS= {
  MISSION_STATUS_ASKING:"Une demande de mission vous a été adressée, la création d’un devis et la validation de celui-ci par l'entreprise est nécessaire pour démarrer la mission",
  MISSION_STATUS_ASKING_ALLE:"",
  MISSION_STATUS_TI_REFUSED:"Vous avez refusé la mission. Restez disponible pour d'autres missions",
  MISSION_STATUS_CUST_CANCELLED:"Le client a annulé sa demande de mission",
  MISSION_STATUS_QUOT_SENT:"Votre devis a bien été envoyé à l'entreprise et est en attente d'acceptation",
  MISSION_STATUS_QUOT_ACCEPTED:"Votre devis a été accepté. N'hésitez pas à contacter votre client si vous avez besoin de précisions complémentaires",
  MISSION_STATUS_QUOT_REFUSED:"L'entreprise a refusé votre devis. Vous pouvez la contacter pour plus d'informations",
  MISSION_STATUS_TO_BILL:"La mission est terminée. Vous devez à présent déposer votre facture pour obtenir le paiement de votre mission",
  MISSION_STATUS_BILL_SENT:"Votre facture a été transmise à l'entreprise. Elle dispose de 48h pour la valider. Au delà de ce délai, le paiement de votre missions sera automatiquement effectué",
  MISSION_STATUS_FINISHED:"La mission s'achève. L'entreprise a la possibilité de laisser un avis sur votre mission. Gardez un oeil sur votre profil",
  MISSION_STATUS_DISPUTE:"L'entreprise a refusé votre facture. TIPI en est informé, vous pouvez également contacter l'entreprise pour régler le litige",
}

const CUSTOMER_TIPS= {
  MISSION_STATUS_ASKING:"Votre demande de mission a été transmise à l'indépendant.e",
  MISSION_STATUS_ASKING_ALLE:"Votre demande de mission a été transmise à TIPI",
  MISSION_STATUS_TI_REFUSED:"L'indépendant.e a refusé la mission. Vous pouvez en chercher un autre ou faire votre demande à TIPI",
  MISSION_STATUS_CUST_CANCELLED:"Vous avez annulé cette demande de mission",
  MISSION_STATUS_QUOT_SENT:"Un devis vous a été envoyé. Pour confirmer la mission, vous devez accepter le devis",
  MISSION_STATUS_QUOT_ACCEPTED:"Vous avez accepté ce devis. La mission commencera à la date indiquée.",
  MISSION_STATUS_QUOT_REFUSED:"Vous avez refusé le devis. Vous pouvez contacter l'indépendant.e pour en obtenir un nouveau",
  MISSION_STATUS_TO_BILL:"La mission est terminée. L'indépendant.e va déposer sa facture. Vous serez notifié dès que la facture sera disponible pour validation",
  MISSION_STATUS_BILL_SENT:"La facture est disponible. Vous disposez d'un délai de 48h pour la valider. Sans validation de votre part, le paiement sera automatiquement versé à l'indépendant.e",
  MISSION_STATUS_FINISHED:"La mission s'achève. Vous avez la possibilité de laisser un avis à cet.te indépendant.e",
  MISSION_STATUS_DISPUTE:"Vous avez refusé la facture. TIPI en est informé, vous pouvez également contacter l'indépendant.e pour régler le litige",
}

const UNACTIVE_REASON_MISUNDERSTAND="UNACTIVE_REASON_MISUNDERSTAND"
const UNACTIVE_REASON_UNLIKE="UNACTIVE_REASON_UNLIKE"
const UNACTIVE_REASON_NONEED="UNACTIVE_REASON_NONEED"
const UNACTIVE_REASON_NOCOMPANY="UNACTIVE_REASON_NOCOMPANY"
const UNACTIVE_REASON_NOTENOUGH="UNACTIVE_REASON_NOTENOUGH"
const UNACTIVE_REASON_OTHERACCOUNTS="UNACTIVE_REASON_OTHERACCOUNTS"
const UNACTIVE_REASON_PRIVACY="UNACTIVE_REASON_PRIVACY"
const UNACTIVE_REASON_BUSY="UNACTIVE_REASON_BUSY"
const UNACTIVE_REASON_OTHER="UNACTIVE_REASON_OTHER"

const UNACTIVE_REASON={
  UNACTIVE_REASON_MISUNDERSTAND:'Je ne comprends pas la plateforme',
  UNACTIVE_REASON_UNLIKE:'Je n&apos;aime pas la plateforme TIPI',
  UNACTIVE_REASON_NONEED:'Je n&apos;ai plus besoin de missions',
  UNACTIVE_REASON_NOCOMPANY:'Je ferme mon entreprise individuelle',
  UNACTIVE_REASON_NOTENOUGH:'TIPI ne m&apos;apporte assez de missions',
  UNACTIVE_REASON_OTHERACCOUNTS:'J&apos;ai des comptes sur d&apos;autres marketplaces',
  UNACTIVE_REASON_PRIVACY:'J&apos;ai un problème de confidentialité',
  UNACTIVE_REASON_BUSY:'La gestion de mon compte me prend trop de temps',
  UNACTIVE_REASON_OTHER:'Autre',
}

const CONTACT_STATUS_OTHER='CONTACT_STATUS_OTHER'
const CONTACT_STATUS_TIPI='CONTACT_STATUS_TIPI'
const CONTACT_STATUS_COMPANY='CONTACT_STATUS_COMPANY'

const CONTACT_STATUS={
  [CONTACT_STATUS_TIPI]: 'Je suis un .e indépendant.e',
  [CONTACT_STATUS_COMPANY]: 'Je recherche des prestataires',
  [CONTACT_STATUS_OTHER]: 'Autre',
}

const PAYMENT_STATUS_REQUIRES_PAYMENT_METHOD="PAYMENT_STATUS_REQUIRES_PAYMENT_METHOD"
const PAYMENT_STATUS_REQUIRES_CONFIRMATION="PAYMENT_STATUS_REQUIRES_CONFIRMATION"
const PAYMENT_STATUS_REQUIRES_ACTION="PAYMENT_STATUS_REQUIRES_ACTION"
const PAYMENT_STATUS_PROCESSING="PAYMENT_STATUS_PROCESSING"
const PAYMENT_STATUS_REQUIRES_CAPTURE="PAYMENT_STATUS_REQUIRES_CAPTURE"
const PAYMENT_STATUS_CANCELED="PAYMENT_STATUS_CANCELED"
const PAYMENT_STATUS_SUCCEEDED="PAYMENT_STATUS_SUCCEEDED"

const PAYMENT_STATUS={
 PAYMENT_STATUS_REQUIRES_PAYMENT_METHOD:"Paiement attendu",
 PAYMENT_STATUS_REQUIRES_CONFIRMATION:"En attente de confirmation",
 PAYMENT_STATUS_REQUIRES_ACTION:"En attente de validation",
 PAYMENT_STATUS_PROCESSING:"En cours de traitement",
 PAYMENT_STATUS_REQUIRES_CAPTURE:"En attente de blocage des fonds",
 PAYMENT_STATUS_CANCELED:"Annulé",
 PAYMENT_STATUS_SUCCEEDED:"Réussi",
}

const depts=require('../../../utils/departements.json')
const DEPARTEMENTS=lodash(depts)
  .toPairs()
  .sortBy(([v, k]) => parseFloat(k.replace('A', '0').replace('B', '0.5')))
  .fromPairs()
  .value()

// Days
const MISSION_REMINDER_DELAY=3
const PENDING_QUOTATION_DELAY=[2,3]
const MISSING_QUOTATION_DELAY=2

// [#149] Commission on customer
const MER_RATE=0.1
// Commission on TI
const AA_RATE=0
// vat rate 20%
const VAT_RATE=0.2

const MIN_AGE=18

const BOOLEAN_YES="BOOLEAN_YES"
const BOOLEAN_NO="BOOLEAN_NO"

const BOOLEAN={
 [BOOLEAN_YES]:"Oui",
 [BOOLEAN_NO]:"Non",
}

const GENDER_MALE="GENDER_MALE"
const GENDER_FEMALE="GENDER_FEMALE"
const GENDER_UNKOWN="GENDER_UNKOWN"

const GENDER={
 [GENDER_MALE]:"Homme",
 [GENDER_FEMALE]:"Femme",
 [GENDER_UNKOWN]:"Non genré",
}

const SOURCE_SALON="SOURCE_SALON"
const SOURCE_WORD_MOUTH="SOURCE_WORD_MOUTH"
const SOURCE_PHONE="SOURCE_PHONE"
const SOURCE_SEARCH_ENGINE=`SOURCE_SEARCH_ENGINE`
const SOURCE_NETWORK=`SOURCE_NETWORK`
const SOURCE_PROFESSIONAL_NETWORK=`SOURCE_PROFESSIONAL_NETWORK`

const LEAD_SOURCE={
  [SOURCE_SALON]:"Salon",
  [SOURCE_WORD_MOUTH]:"Bouche à oreille",
  [SOURCE_PHONE]:"Prospection téléphonique",
  [SOURCE_SEARCH_ENGINE]:`Moteur de recherche`,
  [SOURCE_NETWORK]:`Réseau`,
  [SOURCE_PROFESSIONAL_NETWORK]:`Réseau professionnel`
}

const LOCATION_CUSTOMER="LOCATION_CHEZ_LE_CLIENT"
const LOCATION_REMOTE="LOCATION_A_DISTANCE"
const LOCATION_CUSTOMER_REMOTE="LOCATION_LES_DEUX"

const LOCATION={
  [LOCATION_CUSTOMER]:"Chez le client",
  [LOCATION_REMOTE]:"À distance",
  [LOCATION_CUSTOMER_REMOTE]:"Les deux",
}

const EMERGENCY_LOW="EMERGENCY_FAIBLKE"
const EMERGENCY_MEDIUM="EMERGENCY_NORMAL"
const EMERGENCY_HIGH="EMERGENCY_FORT"

const EMERGENCY={
  [EMERGENCY_LOW]:"Faible",
  [EMERGENCY_MEDIUM]:"Normal",
  [EMERGENCY_HIGH]:"Fort",
}

const OPP_STATUS_SEARCHING="OPP_STATUS_SEARCHING"
const OPP_STATUS_FOUND="OPP_STATUS_FOUND"
const OPP_STATUS_STARTING="OPP_STATUS_STARTING"
const OPP_STATUS_LOST="OPP_STATUS_LOST"
const OPP_STATUS_WON="OPP_STATUS_WON"
const OPP_STATUS_NEW="OPP_STATUS_NEW"

const OPP_STATUS={
  [OPP_STATUS_NEW]:"Nouveau",
  [OPP_STATUS_STARTING]:"TI à rechercher",
  [OPP_STATUS_SEARCHING]:"Recherche TI",
  [OPP_STATUS_FOUND]:"Mise en relation OK",
  [OPP_STATUS_LOST]:"Terminé perdue",
  [OPP_STATUS_WON]:"Terminé gagnée",
}


module.exports={
  ROLES,
  ROLE_ALLE_ADMIN,
  ROLE_ALLE_SUPER_ADMIN,
  ROLE_COMPANY_ADMIN,
  ROLE_TI,
  COACHING,
  COACH_OTHER,
  COMPANY_STATUS,
  AVAILABILITY,
  EXPERIENCE,
  DEFAULT_ROLE,
  COACH_ALLE,
  COMPANY_ACTIVITY,
  COMPANY_SIZE,
  ROLE_COMPANY_BUYER,
  CONTRACT_TYPE,
  QUOTATION_STATUS,
  MISSION_STATUS_ASKING,
  MISSION_STATUS_ASKING_ALLE,
  MISSION_STATUS_TI_REFUSED,
  MISSION_STATUS_CUST_CANCELLED,
  MISSION_STATUS_QUOT_SENT,
  MISSION_STATUS_PAYMENT_PENDING,
  MISSION_STATUS_QUOT_ACCEPTED,
  MISSION_STATUS_QUOT_REFUSED,
  MISSION_STATUS_TO_BILL,
  MISSION_STATUS_BILL_SENT,
  MISSION_STATUS_FINISHED,
  MISSION_STATUS_DISPUTE,
  MISSION_FREQUENCY,
  TI_TIPS,
  CUSTOMER_TIPS,
  UNACTIVE_REASON,
  CONTACT_STATUS,
  PAYMENT_STATUS,
  DEPARTEMENTS,
  MISSION_REMINDER_DELAY,
  PENDING_QUOTATION_DELAY,
  MISSING_QUOTATION_DELAY,
  MER_RATE,
  AA_RATE,
  MIN_AGE,
  BOOLEAN, BOOLEAN_NO, BOOLEAN_YES,
  GENDER,
  VAT_RATE, LEAD_SOURCE, LOCATION, EMERGENCY, OPP_STATUS, OPP_STATUS_NEW,
}
