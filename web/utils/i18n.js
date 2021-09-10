const KycDocumentStatus = require('mangopay2-nodejs-sdk/lib/models/KycDocumentStatus')
const {ACCOUNT_MIN_AGE} = require('./consts')
const {MANGOPAY_ERRORS}=require('./mangopay_messages')

const CESU_NOTICE = 'Quel que soit votre statut, My Alfred est tenu de déclarer aux \
finances publiques vos revenus générés <b>si les deux conditions suivantes sont \
réunies dans l\'année civile :</b><ul><li>vos revenus dépassent 3000 euros</li>\
<li>vous avez réalisé vingt prestations ou plus</li></ul>'

const OUTSIDE_PERIMETER = 'Ce service est hors de votre périmètre.'

const SCHEDULE_TITLE = 'Vos disponibilités'

const SCHEDULE_SUBTITLE = 'Votre calendrier vous permet d’ajouter vos disponibilités. Lorsque vous ajoutez ou modifiez vos disponibilités, seules les plages horaires indiquées pourront être réservées. Vous pouvez très facilement ajouter une période de disponibilité en indiquant les dates de début et fin, les jours correspondants et des tranches horaires. Vous pouvez également sélectionner une date ou plusieurs, indiquer si vous êtes disponible et sélectionner les tranches horaires.'


const SHOP_CREATION_SUCCESSFUL = 'Vos services sont maintenant disponibles dans my Alfred'

const ID_CARD_CONFIRM_DELETION = 'Supprimer votre pièce d\'identité ?'
const REGISTRATION_PROOF_CONFIRM_DELETION = 'Supprimer votre document d\'immatriculation ?'

const MANGOPAY_MESSAGES = {
  'DOCUMENT_UNREADABLE': 'Pièce d\'identité illisible',
  'DOCUMENT_NOT_ACCEPTED': 'Pièce d\'identité invalide : carte d\'identité, passeport, permis de conduire ou titre de séjour attendu',
  'DOCUMENT_HAS_EXPIRED': 'Pièce d\'identité expirée',
  'DOCUMENT_INCOMPLETE': 'Pièce d\'identité incomplète ou illisible',
  'DOCUMENT_DO_NOT_MATCH_USER_DATA': 'Pièce d\'identité ne correspond pas à l\'identité que vous avez indiquée',
  'DOCUMENT_DO_NOT_MATCH_ACCOUNT_DATA': 'Pièce d\'identité ne correspond pas à vops coordonnées bancaires',
  'DOCUMENT_FALSIFIED': 'Pièce d\'identité falsifié',
  'DOCUMENT_MISSING': 'Pièce d\'identité vide',
  'UNDERAGE_PERSON': 'Vous devez avoir au minimum 18 ans',
  [ KycDocumentStatus.Created ]: 'Pièce d\'identité enregistrée, en attente de validation',
  [ KycDocumentStatus.ValidationAsked ]: 'Pièce d\'identité en cours de validation',
  [ KycDocumentStatus.Validated ]: 'Pièce d\'identité valide',
  [ KycDocumentStatus.Refused ]: 'Pièce d\'identité refusée, merci d\'en fournir une valide',
}

const INFOBAR_MESSAGE = {
  message: 'Vous ne trouvez pas votre service ? L’équipe Alfred se mobilise pour trouver le meilleur Alfred près de chez vous',
  showMore: 'ici.',
}

const INFOBARMOBILE_MESSAGE = {
  message: 'L\'application MyAlfred est disponible au téléchargement sur :',
}

const SHOWMORE = 'En savoir plus'

const SEARCH = {
  alfred_avail: ' Alfred disponible(s)',
  no_one: 'Aucun ',
  sort: 'Trier par',
}

const SEARCHBAR = {
  what: 'Quel service ?',
  where: 'Où ?',
  when: 'Quand ?',
  labelWhere: 'L\'adresse',
  labelWhat: 'Le service',
  labelWhen: 'Les dates',
  labelStatus: 'Statut',
  labelDate: 'Date(s)',
  labelLocation: 'Lieu(x)',
  labelPerimeter: 'Périmètre',
  labelCategory: 'Catégorie(s)',
  labelService: 'Service(s)',
  searching: 'Recherche en cours',
  no_results: 'Nous n\'avons pas trouvé de résultat pour votre recherche',
  professional: 'Pro',
  particular: 'Particulier',
  button_cancel: 'Annuler',
  button_confirm: 'Valider',
  start_date: 'Début',
  end_date: 'Fin',
  button_cancel_date: 'Annuler',
  button_confirm_date: 'Valider',
  button_cancel_radius: 'Annuler',
  button_confirm_radius: 'Valider',
  button_cancel_remote: 'Annuler',
  button_confirm_remote: 'Valider',
  button_cancel_cat: 'Annuler',
  button_confirm_cat: 'Valider',
  button_cancel_service: 'Annuler',
  button_confirm_service: 'Valider',
  at_home: 'Chez moi',
  alfred_home: 'Chez l\'Alfred',
  remote: 'En visio',
}

const NAVBAR_MENU = {
  ourServices: 'Nos services',
  myServices: 'Mes services',
  registerServices: 'Proposer mes services',
  ourTeam: 'Notre équipe',
  contactUs: 'Nous contacter',
  businessSide: 'Espace Entreprise',
  classicSide: 'Retour sur myalfred.io',
  aboutUs: 'À propos',
  ourCom: 'Notre communauté',
  signIn: 'Inscription',
  logIn: 'Connexion',
}

const BANNER_PRESENTATION = {
  title: 'La réservation en ligne',
  subTitle: 'De vos services du quotidien',
  text: 'Artisans, indépendants, entrepreneurs, étudiants... en quelques clics trouvez la personne et le service dont vous avez besoin.',
  button: 'Découvrir',
}
const B2B_BANNER_PRESENTATION = {
  title: 'Des milliers de talents',
  subTitle: 'Au service de votre entreprise',
  text: 'Trouvez le prestataire idéal pour répondre aux besoins ponctuels de votre entreprise & de vos collaborateurs. Des milliers de profils vérifiés et qualifiés au service de vos projets, votre stratégie, vos collaborateurs et vos locaux ! Un service simple et sécurisant !',
  button: 'Découvrir',
}

const CATEGORY = {
  title: 'Catégories',
  text: 'Des milliers de services à découvrir',
  button: 'Tout découvrir',
}

const BECOME_ALFRED = {
  title: 'Devenir Alfred',
  text: 'Créez votre compte et proposez vos services',
  button: 'En savoir plus',
}

const RESA_SERVICE = {
  title: 'Proposez un service',
  text: 'Créez votre compte et proposez un service',
  button: 'C\'est parti !',
}

const HOW_IT_WORKS = {
  leftText: 'En quelques clics,\n' + 'réservez le service et la\n' + 'personne dont vous avez besoin.\n' + '#MyAlfred.',
  rightText: 'Vous pouvez consulter des centaines de profils, choisir votre Alfred, réserver et payer en ligne votre service. Notre équipe vous accompagne à chaque étape !',
}

const TRUST_SECURITY = {
  first_item: {
    title: 'Réservation en instantané',
    text: 'Avec un délai de prévenance bien sûr',
  },
  second_item: {
    title: 'Paiement 100% sécurisé',
    text: 'Par la Nasa et le Pentagone',
  },
  third_item: {
    title: 'Notre équipe',
    text: 'Toujours à votre écoute',
  },
}

const LOGIN = {
  title: 'Connexion',
  input_label: 'Email',
  input_password: 'Mot de passe',
  input_role: 'Rôle',
  button: 'Connexion',
  FORGOTTEN_PASSWORD: 'Mot de passe oublié ?',
  REGISTER_YET: 'Pas encore inscrit ? Inscrivez-vous !',
}

const ABOUT = {
  address_placeholder: 'Entrez votre adresse',
  b2b_title_topic: 'Modifiez les informations de votre entreprises',
  title_topic: 'Modifiez vos informations',
  b2b_titlesummary_topic: 'Ici, vous pouvez modifier les informations de votre entreprise',
  titlesummary_topic: 'Ici, vous pouvez modifier vos informations',
  website: 'Site Web',
  label_address: 'Lieu d\'habitation',
  textfield_website: 'Site Web',
  size_company: 'Taille de l\'entreprise',
  label_size_company: 'Taille de l’entreprise',
  textfield_size_company: 'Taille de l’entreprise',
  spoken_languages: 'Langues parlées',
  textfield_languages: 'Sélectionnez vos langues',
  option_message: 'Plus d\'options disponibles',
  b2b_activity: 'Secteur d’activité',
  b2b_activity_label: 'Secteur d’activité',
  button_update: 'Modifier',
  alfred_certifed: 'à un profil vérifié',
}

const LAYOUT_ABOUT = {
  my_name_is: 'Je m\'appelle',
  text: 'et j’ai hâte de vous rencontrer !',
  item_about: 'À propos',
  item_service: 'Services',
  item_review: 'Avis',
  item_my_services: 'Mes services',
  item_my_reviews: 'Mes avis',
  item_my_schedule: 'Mon calendrier',
  item_my_stat: 'Mes statistiques',
}


const EDIT_PROFIL = {
  email_send: 'Mail envoyé',
  error_email: 'email non envoyé',
  sms_send: 'Le SMS a été envoyé',
  sms_error: 'Impossible d\'envoyer le SMS',
  validate_phone: 'Votre numéro de téléphone est validé',
  incorrect_code: 'Le code est incorrect',
  error_verif_code: 'Erreur à la vérification du code',
  dialog_title_phone: 'Confirmation du numéro de téléphone',
  dialog_text_phone: 'Saisissez le code reçu par SMS',
  dialog_textfield_placeholder: '0000',
  dialog_button_confirm_later: 'Confirmer plus tard',
  dialog_button_confirm: 'Confirmer',
  title: 'Modifier votre profil',
  textfield_firstname: 'Prénom',
  textfield_name: 'Nom',
  textfield_about_me: 'A propos de moi',
  char_max: 'caractères max',
  personnal_info: 'Informations personnelles',
  gender: 'Sexe',
  textfield_email_placeholder: 'Email',
  textfield_email_label: 'Adresse email',
  user_email_check: 'Votre email est vérifié',
  user_newemail_check: 'Enregistrer votre nouvel email',
  check_your_email: 'Vérifier votre email',
  textfield_phone: 'Téléphone',
  user_phone_check: 'Votre téléphone est vérifié',
  user_newphone_check: 'Enregistrer votre nouveau téléphone',
  check_your_phone: 'Vérifiez votre téléphone',
  user_info_options: 'Informations facultatives',
  textfield_user_diploma: 'Diplômes',
  textfield_user_school: 'Ecoles',
  textfield_user_job: 'Emploi',
  save_button: 'Enregistrer',
}

const PAYMENT_METHOD = {
  title: 'Modes de paiement',
  subtitle: 'N\'hésitez pas à enregistrer un mode de paiement pour aller plus vite lors de vos réservations.',
}

const REGISTER = {
  snackbar_already_logged: 'Vous êtes déjà inscrit',
  snackbar_sms_send: 'Le SMS a été envoyé',
  snackbar_sms_error: 'Impossible d\'envoyer le SMS',
  snackbar_phone_valid: 'Votre numéro de téléphone est validé',
  snackbar_error_code_phone: 'Le code est incorrect',
  snackbar_error_check_phone: 'Erreur à la vérification du code',
  snackbar_phone_add: 'Téléphone ajouté',
  dialog_phone_title: 'Confirmation du numéro de téléphone',
  dialog_phone_content: 'Saisissez le code reçu par SMS',
  dialog_cgu_close: 'Fermer',
  dialog_phone_confirm_later: 'Confirmer plus tard',
  dialog_phone_confirm: 'Confirmer',
  textfield_email_error: 'Veuillez entrer une adresse email valide.',
  textfield_code: 'Code',
  title: 'Inscription',
  next_button: 'Suivant',
  previous_button: 'Précédent',
  link_already_account: 'Vous avez déjà un compte My Alfred ?',
  finish_button: 'Terminer',
}

const REGISTER_FRIST_PAGE = {
  textfield_email: 'Email',
  textfield_email_placeholder: 'Email',
  textfield_firstname: 'Prénom',
  textfield_firstname_placeholder: 'Prénom',
  textfield_name: 'Nom',
  textfield_name_placeholder: 'Nom',
  textfield_create_password: 'Créer un mot de passe',
  textfield_create_password_placeholder: 'Créer un mot de passe',
  textfield_confirm_password: 'Confirmer mot de passe',
  textfield_confirm_password_placeholder: 'Confirmer mot de passe',
}

const REGISTER_SECOND_PAGE = {
  dialog_cgu_close: 'Fermer',
  address_title: 'Adresse postale',
  address_subtitle: 'Votre adresse ne sera pas visible, mais nous l’utiliserons pour vous proposer ou proposer vos services aux utilisateurs ou Alfred proches de chez vous.',
  algolia_placeholder: 'Recherchez votre adresse',
  birthdate_title: 'Date de naissance',
  minimum_age_start: 'Pour vous inscrire, vous devez être âgé d’au moins ',
  minimum_age_end: ' ans. Les autres utilisateurs ne verront pas votre date de naissance.',
  textfield_day: 'Jour',
  textfield_day_placeholder: 'Jour',
  textfield_month: 'Mois',
  textfield_month_placeholder: 'Mois',
  textfield_year: 'Année',
  textfield_year_placeholder: 'Année',
  textfield_phone: 'Numéro de téléphone',
  textfield_phone_placeholder: 'Numéro de téléphone',
  phone_title: 'Téléphone',
  phone_subtitle: 'L\'ajout de votre numéro de téléphone permet aux membres My-Alfred de disposer d\'un moyen pour vous contacter.',
  button_cgu: 'J’accepte les conditions générales d’utilisation de My-Alfred.',
}

const REGISTER_THIRD_PAGE = {
  title: 'Inscription terminée',
  subtitle: 'Inscription réussie ! Vous pouvez maintenant proposer ou rechercher vos services sur My Alfred',
  button_explore: 'Commencez à explorer',
  button_shop: 'Proposer mes services',
  link_help: 'Besoin d\'aide pour proposer vos services ? Prenez rendez-vous avec l\'équipe My Alfred ici !',
}

const HANDLE_CB = {
  cb_saves_title: 'Cartes enregistrées',
  cb_subtitle_paid: 'Payez encore plus rapidement sans communiquer vos informations financières.',
  cb_title_dialog_delete: 'Voulez-vous vraiment supprimer votre carte bancaire ?',
  cb_content_dialog_delete: 'Si vous supprimez votre carte bancaire vous ne pourrez plus l\'utiliser par la suite avec ce compte.',
  cb_cancel_dialog_delete: 'Annuler',
  cb_delete_dialog_delete: 'Supprimer',
  cb_title_dialog_add: 'Enregistrer une carte',
  cb_subtitle_dialog_add: 'Ajouter une carte en toute sécurité',
  cb_dialog_nb_add: 'Numéro de carte',
  cb_dialog_placeholdercb_add: 'Votre carte de crédit',
  cb_dialog_expdate_add: 'Date d\'expiration',
  cb_dialog_placeholderexpdate_add: 'MM/YY',
  cb_dialog_cvv_add: 'CVV',
  cb_dialog_savecb_add: 'Enregistrer la carte',
  cb_dialog_crypdata_add: 'Toutes les données de paiement sur My Alfred sont cryptées.',
  cb_dialog_mongo_add: 'Elles sont gérées par mangopay notre partenaire de confiance.',
  snackbar_add: 'Carte ajoutée !',
  snackbar_delete: 'Carte supprimé !',
}

const PAYMENT_CARD = {
  no_cb_saved: 'Aucun mode de paiement enregistré',
}

const HANDLE_RIB = {
  snackbar_rib_add: 'RIB ajouté',
  snackbar_error_rib_add: 'Erreur à l\'ajout du RIB',
  snackbar_rib_delete: 'Compte bancaire supprimé',
  snackbar_rib_error_delete: 'Un erreur est survenue',
  dialog_add_rib_title: 'Ajouter un RIB',
  dialog_add_rib_subitle: 'Ajouter un RIB en toute sécurité',
  dialog_add_rib_iban: 'IBAN',
  dialog_add_rib_bic: 'Code SWIFT / BIC',
  dialog_add_rib_button_save: 'Enregistrer le RIB',
  dialog_add_rib_data: 'Toutes les données de paiement sur My Alfred sont chiffrées.',
  dialog_add_rib_mongo: 'Elles sont gérées par mangopay notre partenaire de confiance.',
  dialog_delete_rib_title: 'Voulez-vous vraiment supprimer votre RIB ?',
  dialog_delete_rib_content: 'Si vous supprimez votre RIB vous ne pourrez plus l\'utiliser par la suite avec ce compte.',
  dialog_delete_rib_cancel: 'Annuler',
  dialog_delete_rib_button: 'Supprimer',
  title: 'RIB enregistrés',
  subtitle_b2b: 'Renseignez un rib pour permettre à vos collaborateurs le paiement par prélèvement bancaire.',
  subtitle: 'Choisissez le versement directement sur votre compte bancaire.',
  no_rib: 'Aucun RIB enregistré',
  info_data: 'Toutes les données de paiement sur My Alfred sont chiffrées.',
  mango_info: 'Elles sont gérées par mangopay notre partenaire de confiance.',
}

const MY_ADDRESSES = {
  title: 'Mes adresses',
  title_b2b: 'Mes sites',
  subtitle: 'Ici, vous pouvez gérer vos adresses',
  subtitle_b2b: 'Ici, vous pouvez gérer les sites de',
}

const HANDLE_ADDRESSES = {
  snackbar_addresses_update: 'Adresse principale modifiée',
  snackbar_addresses_add: 'Adresse ajoutée',
  snackbar_addresses_update_success: 'Adresse modifiée avec succès',
  snackbar_addresses_delete: 'Adresse supprimée',
  dialog_delete_title: 'Supprimer cette adresse ?',
  dialog_delete_content: 'Voulez-vous vraiment supprimer cette adresse ?',
  dialog_delete_cancel: 'Annuler',
  dialog_delete_button: 'Supprimer',
  title_b2b: 'Mon siège social',
  title: 'Mon adresse principale',
  placeholder_algo: 'Modifiez votre adresse',
  submit_button: 'Valider',
  book_title_b2b: 'Autres sites',
  book_title: 'Mon carnet d\'adresses',
  b2b_title_add_sites: 'Ajoutez vos sites et gagnez du temps',
  title_add_sites: 'Ajoutez plusieurs adresses et gagnez du temps.',
  textfield_name_placeholder_add_sites: 'Ecrire ici',
  textfield_name_add_sites: 'Nom de l\'adresse',
  submit_secondary_button: 'Enregistrer',
  textfield_name_site: 'Nom du site',
  textfield_name_addresses: 'Intitulé de l\'adresse',
  algo_find_your_addresses: 'Recherchez votre adresse',
  button_add_new_adresses: 'Ajouter',
}

const TRUST_VERIFICATION = {
  snackbar_id_add: 'Pièce d\'identité ajoutée',
  snackbar_card_add: 'Carte d\'identité ajoutée',
  snackbar_status_update: 'Statut modifié',
  snackbar_doc_add: 'Document d\'immatriculation ajouté',
  snackbar_id_delete: 'Pièce d\'identité supprimée',
  snackbar_doc_delete: 'Document d\immatriculation supprimé',
  dialog_delete_title: 'Confirmation',
  dialog_delete_cancel: 'Annuler',
  dialog_delete_confirm: 'Supprimer',
  title: 'Vérification',
  subtitle: 'Vérifiez votre email, votre numéro de téléphone et votre identité.',
  identity_title: 'Pièce d\'identité',
  identity_add_title: 'Ajoutez ou modifiez vos documents d\'identité.',
  document_type: 'Type de document',
  passport: 'Passeport',
  id_card: 'Carte d\'identité',
  download_recto: 'Télécharger recto',
  download_verso: 'Télécharger verso',
  save_verso: 'Enregistrer verso',
  save_button: 'Enregistrer',
  your_status: 'Votre statut',
  particular: 'Je suis un particulier',
  declare_cesu: 'Je veux être déclaré(e) en CESU',
  declare_ces: 'J\'accepte d\'être déclaré en CES',
  no_cesu: 'Je n\'accepte pas d\'être déclaré(e) en CESU',
  professional: 'Je suis un professionnel',
  eligible_credit: 'Je suis éligible au Crédit Impôt Service',
  document_title: 'Document d\'immatriculation',
  insert_document: 'Insérez ici le document d\'immatriculation de votre entreprise (extrait de K-Bis, document d\'immatriculation de micro-entreprise).',
  pdf_info: 'Vous pouvez télécharger ce document en version PDF&nbsp;',
  insee_link: 'sur le site de l\'INSEE',
  download_document_imma: 'Télécharger document d\'immatriculation',
  save_document_imma: 'Enregistrer',
}

const SECURITY = {
  snackbar_account_update: 'Compte mis à jour',
  snackbar_account_desactivate: 'Compte désactivé',
  snackbar_mdp_update: 'Mot de passe modifié',
  dialog_delete_account_title: 'Désactiver votre compte ?',
  dialog_delete_account_content: 'Attention, cette action est irréversible. Si vous souhaitez ne plus être référencé par les moteurs de recherche, vous pouvez désactiver l’indexation par les moteurs de recherche.',
  dialog_delete_account_cancel: 'Annuler',
  dialog_delete_account_confirm: 'Désactiver',
  dialog_delete_shop_title: 'Supprimer votre boutique ?',
  dialog_delete_shop_content: 'Attention, cette action est irréversible. Si vous souhaitez garder votre boutique sans que les utilisateurs puissent réserver vos services, vous pouvez supprimer vos disponibilités sur votre calendrier.',
  dialog_delete_shop_cancel: 'Annuler',
  dialog_delete_shop_confirm: 'Supprimer',
  title: 'Sécurité',
  subtitle: 'Modifiez votre mot de passe et gérez votre compte.',
  password: 'Mot de passe',
  update_password: 'Modifiez votre mot de passe.',
  placeholder_password_error: 'Mot de passe erroné',
  placeholder_password_actual: 'Mot de passe actuel',
  placeholder_newpassword: 'Nouveau mot de passe',
  placeholder_repeat_password: 'Répéter le mot de passe',
  validate_button_password: 'Valider',
  my_account: 'Mon compte',
  handle_my_account: 'Gérez votre compte.',
  index_my_account: 'Je souhaite que mon compte apparaisse dans les résultats des moteurs de recherche',
  delete_my_account: 'Je souhaite supprimer ma boutique de services.',
  delete_my_account_button: 'Supprimer',
  desactivate_my_account: 'Je souhaite désactiver mon compte.',
  caution_desactivate_my_account: 'Attention, cette action est irréversible !',
  button_desactivate_my_account: 'Désactiver',
}

const NOTIFICATIONS = {
  snackbar_account_update: 'Compte mis à jour',
  my_notif: 'Mes notifications',
  subtitle: 'Choisissez les notifications que vous souhaitez recevoir',
  messages_title: 'Messages',
  receive_messages: 'Recevez des messages de la part des Alfred et des utilisateurs y compris les demandes de réservations.',
  email: 'Email',
  push_notif: 'Notification push',
  sms_notif: 'SMS',
  rappel_notif: 'Rappel',
  rappel_notif_tarif: 'Recevez des rappels de réservation, des demandes d’évaluation, des informations sur les tarifs et d’autres rappels relatifs à vos activités sur My-Alfred.',
  promo_title: 'Promotions & Astuces',
  coupon_title: 'Recevez des coupons, des informations promotionnelles, des enquêtes, et des informations de la part de My-Alfred et de ses partenaires.',
  phone: 'Appel téléphonique',
  commu_title: 'Politique & communauté',
  presta_service: 'Recevez des nouvelles sur les réglementations liées aux prestations de services',
  assistance_account: 'Assistance du compte',
  security_conf: 'Vos réservations, des informations légales, des questions de sécurité et de confidentialité. Pour votre sécurité, vous ne pouvez pas désactiver les notifications par email.',

}

const NEWS_LETTER = {
  title: 'Profitez des bon plans de la communauté avec la Newsletter des Alfred',
  text: 'Inscrivez-vous gratuitement à notre super Newsletter pour recevoir les informations et les bons plans de la communauté.',
  google: 'S\'inscrire avec Google',
  where: 'ou',
  email: 'Email',
  button: 'Je m\'inscris !',
}

const CMP_PRESENTATION = {
  placeholder: 'Ici, parlez-nous de vous, de votre personnalité, de vos passions ou encore de votre parcours. Soyez vous-même et montrez-nous votre personnalité !',
}

const getMangopayMessage = msg_id => {
  if (!msg_id) {
    return null
  }
  return MANGOPAY_MESSAGES[ msg_id ] || MANGOPAY_ERRORS[ parseInt(msg_id) ] || `Erreur inconnue:${msg_id}`
}

const OUR_ALFRED ={
  title: 'Nos Alfred',
  text: 'Découvrez les profils de nos Alfred',
  button: '',
}

const PROFIL = {
  place: 'Habite à',
  languages: 'Langues',
  verification: 'Vérification',
  noaddresses: 'Pas d\'adresse',
  website: 'Site web',
  companysize: 'Taille de l’entreprise',
  activity: 'Secteur d’activité',
  nothing: 'Non renseigné',
  confirmed: 'Profil confirmé',
  unconfirmed: 'Profil non confirmé',
}

const SHOP = {
  addService: 'Ajoutez des services',
  createShop: 'Proposez votre premier service',
  bienvenue: {
    titre: 'Bienvenue',
    subtitle: 'Nous allons vous aider à créer votre service et devenir Alfred en quelques minutes !',
    step1: 'Etape 1',
    step1_subtitle: 'Choisissez votre premier super talent ! ',
    step1_text: 'Sélectionnez le premier service que vous souhaitez proposer ! Et comme un talent en appelle un autre, vous pourrez ajouter autant de services que vous voulez.',
    step2: 'Etape 2',
    step2_subtitle: 'Vous êtes chez vous ! Fixez vos règles et vos conditions…',
    step2_text: 'Indiquez vos disponibilités, paramètres de réservation et vos conditions d’annulation.',
    step3: 'Etape 3',
    step3_subtitle: 'Présentez-vous !',
    step3_text: 'Renseignez votre profil Alfred, partagez vos réalisations, et décrivez-vous !',
  },
  creation: {
    title: 'A propos de vous',
    subtitle: 'Choisissez votre statut. Les particuliers peuvent proposer leurs services aux particuliers, mais seuls les professionnels peuvent proposer leurs services aux clients particuliers et entreprises.',
    is_particular: 'Je suis un particulier',
    is_particular_description: 'En tant que particulier, vous pouvez rendre des services occasionnels sur My-Alfred. Si votre activité devient régulière, un statut professionnel (micro-entrepreneur,...) s’impose. Il est également requis pour certains secteurs d’activité réglementés.',
    is_particular_want_cesu: 'Je veux être déclaré(e) en CESU',
    is_particular_accept_cesu: 'J\'accepte d\'être déclaré en CESU',
    is_particular_decline_cesu: 'Je n\'accepte pas d\'être déclaré(e) en CESU',
    is_professional: 'Je suis un professionnel/J\'ai un numéro de SIRET',
    is_professional_description: 'Un statut professionnel avec un numéro de SIRET est nécessaire pour les métiers réglementés et permet une activité régulière sur My-Alfred. Seuls les professionnels peuvent proposer leurs services aux entreprises qui ont besoin d’une facture. Un statut professionnel est requis dès lors que votre activité devient régulière.',
    is_professional_cis: 'Mon enterprise est éligible au Crédit Impôt Service',
    is_professional_certif: 'Je certifie sur l’honneur qu’il s’agit bien de mon entreprise.',
    is_professional_vat_subject: 'Mon entreprise est assujettie à la TVA',
    is_profesionnal_propose_missions: 'Je souhaite proposer ce service : ',
    textfield_ntva: 'N° TVA',
    textfield_particular: 'Aux particuliers',
    textfield_company: 'Aux entreprises',
    textfield_company_and_particular: 'Aux particuliers et aux entreprises',
  },
  service: {
    title: 'Votre service',
    // subtitle: 'Sélectionnez votre service. Si vous souhaitez en proposer plusieurs, vous pourrez en ajouter autant que vous le souhaitez par la suite.',
    subtitle: 'Sélectionnez votre service, vous pouvez saisir des mots-clés pour faciliter la recherche. Si vous souhaitez en proposer plusieurs, vous pourrez en ajouter autant que vous le souhaitez par la suite.',
    subtitle_update: 'Vous allez modifier le service indiqué ci-dessous',
    content_particular: 'Liste des services aux particuliers',
    explanation: 'Vous pouvez saisir un mot clé pour filtrer votre service ou sélectionner votre service dans la liste',
    content_professional: 'Liste des services aux entreprises',
    content_particular_professional: 'Liste des services aux particuliers & aux entreprises',
    placeholder: 'Recherche par mot-clés',
    section_particular: 'Services au particuliers',
    section_company: 'Services au professionnels',
  },
  parameter: {
    title: 'Paramétrez vos prestations',
    subtitle: 'Indiquez vos tarifs et votre méthode de facturation. Si vous êtes assujetti à la TVA, merci d’indiquer vos tarifs hors taxes. Vous ne trouvez pas une prestation ? Créez une prestation personnalisée qui vous sera propre ! ',
    presta_perso: 'Ajouter une prestation personnalisée',
    titleIsPro: 'Services proposés aux entreprises partenaires de My Alfred',
    descriptionIsPro: 'My Alfred travaille en étroite collaboration avec de nombreuses entreprises partenaires en recherche d’entrepreneurs qualifiés pour l’installation, la livraison, le montage ou encore des services de conciergerie. Si vous souhaitez proposer vos services aux entreprises partenaires de My Alfred, il vous suffit de compléter les prestations ci-dessous. Ces prestations ne seront pas visibles de la plateforme grand public, et seront réservées aux entreprises partenaires. Un de nos experts prendra contact avec vous dans les plus brefs délais pour plus d’information. ',
  },
  settingService: {
    title: 'Paramétrage',
    subtitle: 'Indiquez votre périmètre d’intervention ainsi que les options qui s’offrent à votre client quant à votre service.',
    title_perimeter: 'Quel est votre périmètre d’intervention ?',
    unity_perimeter: 'Km',
    title_place_service: 'Où acceptez-vous de réaliser votre prestation ?',
    service_at_userHome: 'A l\' adresse de mon client',
    service_at_myHome: 'A mon adresse',
    service_withVisio: 'En visioconférence(la visioconférence ne tient pas compte de votre rayon d’intervention)',
    service_outside: 'En extérieur',
    apply_moving_price: 'Appliquer un forfait déplacement de',
    propose_delivery: 'Proposer un forfait retrait & livraison de',
    section_option_title: 'Options',
  },
  preference: {
    title: 'Préférences',
    subtitle: 'Indiquez vos préférences de réservation. Ces préférences s’appliqueront lorsqu’un client souhaite vous réserver.',
    title_delay_prevenance: 'De quel délai souhaitez-vous disposer entre la réservation et la réalisation du services ?',
    exemple_delay: 'Par exemple, si vous indiquez un délai de 24 heures, un client devra réserver votre service au moins 24 heures avant votre intervention.',
    units_dalay_prevenance: 'Heures/jours/semaines',
    label_delay_prevenance: '',
    hours: 'heure(s)',
    days: 'jour(s)',
    weeks: 'semaine(s)',
    title_minimum_basket: 'Quel est le montant minimal pour réserver votre service ?',
    subtitle_minimum_basket: ' Le montant minimum de réservation correspond au panier minimum requis pour réserver ce service. Si vous indiquez un montant de 10€, les clients ne pourront pas réserver vos services si la somme des prestations n’atteint pas ce montant',
    textfield_minimum_basket: 'Panier minimum',
    unit_minimum_basket: '€',
    title_equipments: 'Les équipements que vous fournissez pour ce service:',
  },
  assets: {
    title: 'Vos atouts',
    subtitle: 'Mettez en évidence vos compétences et votre expertise dans ce service. Vous pouvez également donner des précisions sur vos prestations. Précisez tout ce qui peut aider votre client à réserver correctement votre service !',
    expertise_title: 'Votre expertise',
    expertise_label: 'Votre expertise',
    experience_title: 'Votre expérience',
    experience_label: 'Experience',
    experience_label_description: 'Décrivrez votre expérience',
    obtain_competence: 'Compétences',
    diploma_title: 'Votre diplôme',
    diploma_subtitle: 'En téléchargeant votre diplôme, celui-ci aura le statut de diplôme vérifié auprès des utilisateurs mais il ne sera jamais visible par ces derniers.',
    year_obtain: 'Année',
    button_joinDiploma: 'Joindre un diplôme',
    certification_title: 'Votre certification',
    certification_subtitle: 'En téléchargeant votre certification, celle-ci aura le statut de certification vérifiée auprès des utilisateurs mais elle ne sera jamais visible par ces derniers.',
    certification_name: 'Titre',
    button_joinCertification: 'Joindre une certification',
  },
  bookingCondition: {
    title: 'Vos conditions',
    subtitle: 'Fixez vos conditions et la façon dont vous acceptez qu’un client réserve vos services.',
    title_firstSection: 'Comment les clients peuvent vous réserver ?',
    booking_request: 'Tous les utilisateurs doivent envoyer une demande de réservation que vous devez valider dans les 24H.',
    booking_auto: 'Les utilisateurs peuvent réserver mes services directement sans demande de réservation.',
    title_secondSection: 'Quelles sont les conditions pour réserver vos services ?',
    conditions_bacsic: 'Respecter les conditions My-Alfred (profil vérifié)',
    conditions_picture: 'Avoir une photo de profil',
    conditions_idCard: 'Avoir déposé une pièce d’identité officielle',
    conditions_recommend: 'Etre recommandé par d’autres Alfred',
    title_thirdSection: 'Quelles sont vos conditions d’annulation ?',
    condition_flexible: 'Flexibles: Remboursement intégral jusqu\'à 1 jour avant la prestation',
    condition_moderate: 'Modérées: Remboursement intégral jusqu\'à 5 jours avant la prestation',
    condition_strict: 'Strictes: Remboursement intégral jusqu’à 10 jours avant la prestation',
  },
}

const ADD_SERVICES = {
  title: 'Mes services',
  add_service: 'Développez votre boutique et ajoutez de nouveaux services !',
}

const SERVICES = {
  particular_service: 'Services aux particuliers',
  pro_service: 'Services aux professionnels',
}

const ASK_QUESTION = {
  title: 'Vous souhaitez poser une question à ',
  question: ' ?',
  info: 'Rendez-vous sur la page du service qui vous intéresse, cliquez sur « demande d’informations » en dessous du bouton réserver. Vous pourrez alors poser toutes vos questions à  ',
  exclamation: ' !',
}

const SUMMARY_COMMENTARY = {
  global_grade: 'NOTE GENERALE',
  commentary: 'COMMENTAIRES',
  compliments: 'COMPLIMENTS',
  button_hide_commentary: 'Cacher les commentaires',
  button_show_commentary: 'Voir les commentaires',
}

const STATISTICS = {
  title_topic_incomes: 'Mes revenus',
  subtitle_topic_incomes: 'Ici, vous pouvez suivre l\'évolution de vos revenus et vos statistiques prévisionnelles',
  year: 'Année',
  month: 'Mois',
  incomes_get: 'Revenus perçus',
  incomes_will: 'Revenus à venir',
  incomes_previ: 'Revenus prévisionnels ',
  euro: ' €',
  my_stat: 'Mes statistiques',
  my_stat_subtitle: 'Retrouvez vos nombres de vues, de commentaires ou encore de prestations réalisées',
  incomes_total: 'Revenu total',
  services_done: 'Prestations réalisées',
  view_profil: 'Vues du profil',
  commentary: 'Commentaires',
}

const MESSAGES = {
  last_message: 'Dernier message ',
  no_message: 'Aucun message',
  dialog_title_content: 'Saisissez votre message',
  no_conversation: 'Vous n\'avez aucune conversation',
  one_conversation: 'Vous avez une conversation',
  you_got: 'Vous avez',
  conversation: ' conversations',
  my_messages: 'Mes messages',
  label: 'Saisissez votre message',

}

const MESSAGE_DETAIL = {
  browser_compatibility: 'Votre navigateur ne supporte pas les notifications',
  notif: 'Vous recevrez des notifications pour cette conversation',
  new_messages: 'Nouveaux Messages',

}

const MESSAGE_SUMMARY = {
  no_message: 'Aucun message',
}

const AVOCOTES = {
  title: 'Besoin d\'un coup de pouce pour installer votre pack AvoCotés protection ?',
  subtitle: 'Confiez l\'installation de votre Pack SECURITE AvoCotés Protection à un entrepeneur local & qualifé',
  titleSection: 'A propos de l\'installateur',
  description: 'Alfred on-demand est partenaire d\'AvoCotés pour toutes les demandes d\'installation de matériel de télésurveillance. Nos entrepreneurs sont des indépendants locaux, qualifiés et vérifiés par nos équipes. Chaque entrepreneur est formé à l\'installation du matériel AvoCotés par nos soins.',
  descriptionSecond: 'Notre équipe vous contacte par téléphone afin de fixer avec vous un créneau qui s\'intégre dans vos impératifs. Pour toute question relative à votre installation, n\'hésitez pas à nous contacter au 06 87 37 73 63.',
  titleEquipment: 'Matériel apporté et fourni par votre installateur :',
  titleCordonnates: 'Vos coordonnées :',
  titleDetails: 'Détaillez votre commande :',
  totalText: 'Coût total de mon installation :',
  paidButton: 'Payer',
  helperText: '* les télecommandes ne nécessitent pas d\'installation',
  askQuestion: 'Une question sur votre installation ?',
  contactUs: 'Contactez nous',
  // phone: '02 35 00 00 00',
  phone: '06 87 37 73 63',
  phoneTextFirst: 'Appel gratuit depuis la',
  phoneTextSecond: 'France metropolitaine',
  ourCompanyTitleFirst: 'Pourquoi faire confiance à Alfred pour',
  ourCompanyTitleSecond: 'l\'installation de mon pack AvosCotés protection ?',
  ourCompanyDescriptionFirst: 'Grâce à notre communauté d\'entrepreneurs indépendants, quel que soit votre besoin en matière de services, Alfred on-demand y répond et vous accompagne dans votre démarche.',
  ourCompanyDescriptionSecond: 'Nous sélectionnons pour vous les meilleurs talents en parfaite adéquation avec vos besoins, en essayant de nous adpater aux mieux à vos contraintes d\'agenda. Nos installateurs sont vérifiés et formés aux solutions AvoCotés pour vous prêter main-forte dans le cadre de votre installation.',
  address: '5 rue jacques Monod',
  postal: '76130 mont saint aignan',
  phoneContact: 'tel.: 06 87 37 73 63',
  mail: 'Mail: avocotes@alfred-ondemand.fr',
}

const BOOKING = {
  MSG_EVALUATE: 'Vous avez 15 jours pour évaluer votre client. Une fois que votre client aura rédigé son commentaire, il pourra consulter votre évaluation et vous pourrez consulter la sienne !',
  payment_no_finish: 'Paiement non réalisé',
  payment: 'Paiement',
  payment_if_accept: 'Paiement si acceptation',
  potential_incomes: 'Revenus potentiels',
  avocotes_resa: 'Réservation AvoCotés pour le compte de ',
  disabled_user_access: 'Vous n\'avez pas l\'autorisation d\'accéder à cette page',
  pre_approved: 'Pré-approuvée',
  invit_checking: 'Invitation à réserver',
  commentary: 'Commentaires',
  already_evaluate: 'Vous avez déjà évalué votre client.',
  already_evaluate_alfred: 'Vous avez déjà évalué votre Alfred.',
  button_evaluate_client: 'Evaluer mon client',
  info_commentary: 'Vous avez 15 jours pour évaluer votre Alfred. Une fois que votre Alfred aura rédigé son commentaire, il pourra consulter votre évaluation et vous pourrez consulter la sienne !',
  evaluate_alfred_button: 'Evaluer mon Alfred',
  about: 'A propos de ',
  id_checked: 'Pièce d\'identité vérifiée',
  member_since: 'Membre depuis ',
  button_send_message: 'Envoyer un message',
  button_call: 'Appeler',
  phone_number: 'Numéro de téléphone :',
  about_resa: 'A propos de votre réservation',
  visio: 'en visio',
  created_date: 'créée le ',
  end_date: 'Date de fin: ',
  info_end_resa: 'Votre réservation doit être confirmée avant le ',
  a: ' à ',
  button_confirm: 'Confirmer',
  button_cancel: 'Refuser',
  pre_approved_button: 'Pré-approuver',
  paid_button: 'Payer ma réservation',
  stuff: 'Matériel fourni',
  no_stuff: 'Aucun équipement fourni',
  cancel_resa: 'Annuler la réservation',
  warning_behavior: 'Signaler l’utilisateur',
  reclamation: 'Réclamation',
  versement: 'Versement',
}

const FAQ_ALFRED = {
  'Devenir Alfred': [
    {
      title: 'Qui peut devenir Alfred ?',
      contents: `<p>Nous sommes tous des Alfred ! Dès l’âge de ${ACCOUNT_MIN_AGE} ans, vous pouvez devenir Alfred en créant votre propre boutique de service(s) sur My Alfred.\
      Votre inscription et la mise en ligne de votre boutique sont entièrement gratuites et ne demandent aucun frais au préalable ou abonnement vous engageant sur la durée.Vous pouvez proposer immédiatement vos talents, vos compétences sur My Alfred en choisissant la liste des services que vous souhaitez proposer. Nous avons répertorié pour vous plus de 2000 prestations classées dans des services et des catégories. Alors, prêt à rejoindre l’aventure ? Je deviens alfred maintenant !</p>`,
    },
    {
      title: 'Comment créer sa boutique de service ?',
      contents: '<p>My Alfred vous permet de créer votre propre boutique de service(s) et de définir les services et prestations que vous souhaitez réaliser tout en vous offrant pleine liberté sur vos conditions !Nos Alfred fixent leur(s) prix ainsi que leur(s) méthode(s) de facturation librement, et peuvent ajuster leur(s) prix à tout moment. Afin de proposer une visibilité et une confiance accrue entre les utilisateurs et les Alfred, la boutique de service(s) offre un niveau de personnalisation élevé permettant à tout à chacun de décrire son expertise, ses diplômes et certifications, des options liées à ses services, le matériel fourni dans le cadre de son service ou encore ses disponibilités.Les Alfred sont également libres de choisir leurs propres conditions de réservation et d’annulation !</p><p>Prêt à vous lancer ? Pour démarrer la création de votre boutique, l’inscription est obligatoire. Une fois identifé(e)sur My Alfred, il suffit de cliquer sur le bouton “Devenir Alfred’’.</p><p>Simple et rapide, la création de votre boutique se déroule en 3 étapes et ne vous prendra quelques minutes :</p><p>Etape 1 : Sélection des services<br/>A travers cette étape, vous pouvez sélectionner les services que vous souhaitez réaliser. Nous avons classé ces services dans des catégories pour vous permettre de trouver plus rapidement les services concernés. Un service n\'apparaît pas ?Contacter l’équipe My Alfred à l’adresse <a href={\'mailto:unservicedeplus@my-alfred.io\'}>unservicedeplus@my-alfred.io</a> !</p><p>Etape 2 : Indiquez vos prix, vos disponibilités et conditions<br/>Pour chaque service sélectionné, vous devez renseigner un prix par prestation, vos disponibilités et vos conditions de réservation pour permettre à vos clients de réserver vos services avec un maximum d’informations.</p><p>Etape 3 : Indiquez vos prix, vos disponibilités et conditions<br/>Cette dernière étape vous permet d’ajouter une photo de profil, de vérifier votre téléphone portable, votre identité et d’indiquer si vous souhaitez réaliser vos services en tant que particulier ou auto-entrepreneur.</p><p>C’est fini ! Vous avez maintenant votre propre boutique de services sur My Alfred. A tout moment, vous pouvez ajouter, modifier, supprimer un ou plusieurs services dans la rubrique ma boutique !Pensez à maintenir votre calendrier à jour afin d\'apparaître dans les résultats de recherche des utilisateurs :) !</p>',
    },
    {
      title: 'Que dois-je déclarer dans mes revenus ?',
      contents: '<p>My Alfred est une plateforme appartenant à l’économie collaborative permettant à tout un chacun de consommer et/ou de proposer des services contre une rémunération. L’économie collaborative est tout à fait légale à condition de déclarer ses revenus et d’adopter le statut correspondant en fonction de la nature occasionnelle ou non de vos services.En tant que particulier, vous devez vous devez déclarer le montant de vos prestations dans vos revenus dès lors que vous avez perçu plus de 3 000 € ou effectué plus de 20 transactions au cours de l’année précédente, mais vous n’avez pas de déclaration sociale ou deTVA à réaliser.Si votre activité n’est pas occasionnelle mais régulière, vous devez déclarer vos revenus et payer des cotisations sociales. Dans ce cas, le statut d’auto-entrepreneur est alors parfaitement adapté pour vous.</p>',
    },
  ],
  'Créer votre boutique de service': [
    {
      title: 'Comment ajouter un nouveau service dans ma boutique ?',
      contents: '<p>Vous pouvez à tout moment ajouter de nouveaux services dans votre boutique.Pour cela, rendez-vous dans votre boutique et cliquez sur <span style=\{\{color: \'#2FBCD3\'\}\}>ajouter un nouveau service.</span><br/>Vous devez ensuite suivre les différentes étapes d’ajout d’un nouveau service comme lors de la création de votre boutique.</p>',
    }, {
      title: 'Comment fixer le prix de mes prestations ?',
      contents: '<p>Pour chaque service sélectionné, il vous est proposé une ou plusieurs prestations. Vous devez sélectionner les prestations que vous souhaitez effectuer et pour lesquelles un prix doit être renseigné. Le prix de votre prestation doit être indiqué en tenant compte du mode de facturation. Un mode de facturation vous est proposé par défaut mais vous pouvez le modifier si ce dernier ne vous convient pas.</p><p>Vous pouvez à tout moment visualiser ou modifier le prix et le mode de facturation de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier le prix de vos prestations :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez votre Boutique sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes services</strong></li><li>Cliquez sur <strong>Modifier</strong> dans un service</li><li>Modifier les prix de vos prestations puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'A quoi servent les options dans ma boutique de service ?',
      contents: '<p>Pour chaque service, vous avez la possibilité d’ajouter une option de facturation. Cette option vous permet de compléter le prix de votre prestation en ajoutant un supplément de prix que le client pourra sélectionner. Par exemple, vous pouvez ajouter une option“retrait et livraison” et indiquer le prix de cette option.</p><p>Vous pouvez à tout moment visualiser ou modifier les options de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier les options d\'un service :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes services</strong></li><li>Cliquez sur <strong>Modifier</strong> dans un service</li><li>Modifier les options de vos prestations puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'A quoi correspond le matériel fourni dans ma boutique de service ?',
      contents: '<p>Pour chaque service, vous pouvez sélectionner le matériel et les consommables qui seront utilisés lors de votre prestation. Lorsqu’un client parcourra votre boutique ou sélectionnera vos services,il pourra alors connaître les équipements dont vous disposez pour la prestation et les consommablesque vous fournissez. Certains services nécessitent du matériels pécifique. Indiquez que vous disposez de ce matériel offre à vos clients un gage de qualité et de professionnalisme au regard des services que vous pouvez réaliser !</p><p>Vous pouvez à tout moment visualiser ou modifier le matériel et consommables fournis dans vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier le matériel fourni dans votre service :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes services</strong></li><li>Cliquez sur <strong>Modifier</strong> dans un service</li><li>Sélectionnez le matériel et consommables puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'Comment définir un montant minimum pour mon service ?',
      contents: '<p>Le montant minimum de réservation correspond au panier minimum requis pour réserver ce service.Si vous indiquez un montant de 10€, les clients ne pourront pas réserver vos services si la somme des prestations n’atteint pas ce montant.</p><p>Vous pouvez à tout moment visualiser ou modifier le montant minimum de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier le montant minimum d\'un service :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes services</strong></li><li>Cliquez sur <strong>Modifier</strong> dans un service</li><li>Modifiez le montant minimum puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'Comment définir mon périmètre d\'intervention ?',
      contents: '<p>Votre périmètre d’intervention correspond à la zone dans laquelle vous souhaitez réaliser votre service.Par défaut, nous utilisons la ville de votre profil comme référence.Cette adresse ne vous convient pas ? Vous pouvez changer votre ville de référence à tout moment!Le périmètre que vous indiquez va permettre à la plateforme My Alfred de proposer votre service si le périmètre d’intervention correspond à l’adresse du client. Si le client se trouve à 5km de votre adresse et que vous avez indiquez un périmètre de 10km votre service sera proposé !</p><p>Vous pouvez à tout moment visualiser ou modifier le périmètre d’intervention de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier le périmètre d\'intervention d\'un service :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes services</strong></li><li>Cliquez sur <strong>Modifier</strong> dans un service</li><li>Modifiez le périmètre d\'intervention puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'A quoi correspond le délai de prévenance ?',
      contents: '<p>Le délai de prévenance correspond au délai nécessaire entre la réservation et la réalisation du service. Par exemple, si vous indiquez un délai de 24 heures, un client devra réserver votre service au moins 24heures avant votre intervention.Le délai de prévenance peut se définir en heure, jour ou mois en indiquant le chiffre correspondant avec les boutons + et - dans votre boutique.</p><p>Vous pouvez à tout moment visualiser ou modifier le délai de prévenance de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier le délai de prévenance d\'un service :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes services</strong></li><li>Cliquez sur <strong>Modifier</strong> dans un service</li><li>Modifiez le délai de prévenance puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'Pourquoi décrire brièvement mon expertise ?',
      contents: '<p>Pour chaque service sélectionné, vous pouvez brièvement décrire votre expertise.N’hésitez pas à mettre en évidence vos compétences et votre expertise pour un service.Les utilisateurs auront accès à ces informations, n’hésitez pas à valoriser vos réalisations et vos atouts pour ce service !</p><p>Vous pouvez à tout moment visualiser ou modifier le contenu de votre expertise de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier la description de votre expertise d\'un service :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes services</strong></li><li>Cliquez sur <strong>Modifier</strong> dans un service</li><li>Modifiez le contenu de votre expertise puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'Pourquoi dois-je ajouter mes années d’expérience, mes diplômes et certifications ?',
      contents: '<p>Pour chaque service sélectionné, vous pouvez indiquer une nombre d\'années d\'expérience pour ce service et télécharger un diplôme et/ou une certification reçu pour ce service. Concernant le diplôme,vous pouvez indiquez le nom de votre diplôme et son année d’obtention.En téléchargeant votre diplôme,votre diplôme aura le statut de diplôme vérifié auprès des utilisateurs mais il ne sera jamais visible par ces derniers! C’est exactement le même principe pour votre certification.</p><p>Vous pouvez à tout moment visualiser ou modifier le nombre d\'années d\'expérience et les diplômes et certifications téléchargés de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier vos années d’expérience, vos diplômes et certifications d\'un service :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes services</strong></li><li>Cliquez sur <strong>Modifier</strong> dans un service</li><li>Modifiez votre nombre d’années d’expérience, supprimer ou ajouter un diplôme ou une certification puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'Comment indiquer mes disponibilités dans mon calendrier ?',
      contents: '<p>Il est indispensable d’indiquer vos disponibilités lors de la création de votre boutique afin d\'apparaître dans les résultats de recherche des utilisateurs.Lorsqu’un client recherchera un service sur la plateforme, il indiquera le service recherché, et très souvent indiquera une date et/ou un heure à laquelle il souhaite obtenir ce service.Si vos disponibilités indiquées dans votre calendrier correspondent à la demande du client, vos services seront proposés dans les résultats de la recherche !Afin de renseigner convenablement votre calendrier, My Alfred vous permet d’indiquer, jour par jour vos périodes de disponibilité. Plusieurs périodes peuvent être indiquées pour un même jour ou pour une période récurrente. Par exemple, vous pouvez être disponible le mercredi de 10h à 12h puis de 14h à 18h.Vous pouvez ensuite étendre vos heures de disponibilités de vos journées sur une période de dates.Par exemple, les périodes horaires renseignées s’appliquent pour la période du 1er octobre 2019 au 20 décembre 2019.Si vous proposez plusieurs services, les disponibilités indiquées peuvent être définies par service ou pour l’ensemble de vos services.</p><p>Vous pouvez à tout moment visualiser ou modifier le calendrier de vos disponibilités de vos service dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier votre calendrier de disponibilités :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mon calendrier</strong></li><li>Cliquez sur <strong>Ajouter ou modifier dans la page calendrier</strong></li><li>Modifiez les jours, heures et périodes de vos disponibilités puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'Comment les utilisateurs peuvent réserver ?',
      contents: "<p>Pour l’ensemble de vos services, vous devez préciser la façon dont vous souhaitez que vos clients réservent vos services. Soit vous permettez à vos clients de réserver vos services automatiquement,soit vous souhaitez recevoir une notification pour laquelle vous avez 24h pour répondre. Lors d'une réservation automatique, le service est réservé et payé par le client.Si vous avez opté pour une validation de la réservation, le service ne sera réservé et payé qu’après votre acceptation.</p><p>Vous pouvez à tout moment visualiser ou modifier la façon dont vous souhaitez que vos clients réservent vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier la façon dont vos clients peuvent réserver vos services :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes paramètres de réservation</strong></li><li>Cliquez sur <strong>Modifier</strong>dans un service</li><li>Sélectionnez la façon dont vous souhaitez que vos clients réservent vos services puis cliquez sur <strong>Enregistrer</strong></li></ol>",
    }, {
      title: 'A quoi correspondent mes conditions de réservation ?',
      contents: '<p>Les conditions de réservation définissent les éléments que vous souhaitez vérifier à propos de vos clients. Vous pouvez exiger différentes options. Ces options sont cumulatives.</p><p>Conditions My Alfred<br/>Adresse email et numéro de téléphone confirmés</p><p>Photo de profil<br/>Ces utilisateurs ont fourni une photo de profile.</p><p>Pièce d\'identité officielle<br/>Ces utilisateurs ont vérifié leur identité.</p><p>Recommandations d\'autres Alfred<br/>Ces utilisateurs ont déjà utilisé des services avec My Alfred, sont recommandés par d\'autresAlfred et n\'ont pas reçu de commentaires négatifs.</p><p>Il se peut que vous ayez moins de réservation si vous ajoutez des conditions. Les personnes quine répondent pas à vos critères peuvent quand même vous envoyer une demande.</p><p>Vous pouvez à tout moment visualiser ou modifier les conditions de réservation de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier vos conditions de réservation de vos services :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes paramètres de réservation</strong></li><li>Cliquez sur <strong>Modifier</strong>dans un service</li><li>Sélectionnez ou désélectionnez les options de vos conditions de réservation puis cliquez sur <strong>Enregistrer</strong></li></ol>',
    }, {
      title: 'Comment gérer ma photo de profil ?',
      contents: '<p>La photo de votre profil sera visible des utilisateurs du site et leur permettra de déjà vous connaître! Téléchargez une photo claire et lumineuse, de bonne qualité. Pour un rendu optimal, la photo doit être cadrée, sans lunette de soleil, en regardant l’objectif, avec seulement vous sur la photo.</p><p>Vous pouvez à tout moment visualiser, ajouter ou supprimer votre photo dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour ajouter ou supprimer votre photo de profil :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Profil</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Ma photo</strong></li><li>Cliquez sur <strong>Télécharger une photo depuis votre ordinateur </strong></li><li>Cliquez sur <strong>Valider</strong></li></ol>',
    }, {
      title: 'Comment définir mes conditions d\'annulations ?',
      contents: '<p>Les conditions d’annulation définissent sous quelle condition vous acceptez l’annulation d’une réservation par un client. Nous avons définis 3 niveaux de conditions d’annulation :</p><p>Flexibles<br/>Remboursement intégral lorsque l’annulation d’un client intervient jusqu\'à 1 jour avant la prestation.</p><p>Modérées<br/>Remboursement intégral lorsque l’annulation d’un client intervient jusqu\'à 5 jours avant la prestation.</p><p>Strictes<br/>Remboursement intégral lorsque l’annulation d’un client intervient jusqu\'à 10 jours avant la prestation.</p><p>Vous pouvez à tout moment visualiser ou modifier vos conditions d’annulation de vos services dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier vos conditions d’annulation de vos services dans votre boutique :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes paramètres de réservation</strong></li><li>Sélectionnez le type de condition d’annulation de réservation de vos services puis cliquez sur<strong> Enregistrer</strong></li></ol>',
    }, {
      title: 'Comment gérer ma photo de couverture ?',
      contents: '<p>Votre photo de couverture est la photo positionnée en en-tête de votre boutique. Elle sera visible des utilisateurs du site.La photo de couverture peut refléter vos goûts, vous permettre de mettre votre travail en avant etc.Par défaut, My Alfred attribue une photo de couverture à votre boutique.</p><p>Vous pouvez à tout moment visualiser, ajouter ou supprimer votre photo dans votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Pour ajouter ou supprimer votre photo de couverture :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Boutique</strong> sur my-alfred.io</li><li>Cliquez sur le crayon pour modifier, en haut à droite de votre photo de couverture</li><li>Sélectionnez votre photo de couverture</li><li>Cliquez sur <strong>Valider</strong></li></ol>',
    },
  ],
  'Mes versements': [
    {
      title: 'Comment toucher mon versement ?',
      contents: '<p>Une fois la réservation confirmée, l’utilisateur à l’origine de la réservation reçoit un code unique et dédié à votre réservation.Lorsque le service est réalisé, votre client doit vous communiquer ce code afin que vous puissiez toucher votre versement.</p><p>Une fois que vous avez votre code, rendez-vous sur votre fiche réservation depuis votre smartphone ou depuis votre ordinateur et cliquez sur “Indiquer mon code”. Saisissez les chiffres de votre code et validez.Une fois le code validé, vous recevrez votre versement sur le compte bancaire renseigné dans “Préférence de versement” dans un délai de 4 jours maximum.Si vous n’avez pas renseigné d’IBAN, vous devrez l’ajouter avant votre première prestation, dans la rubrique “Préférence de versement” de votre compte.</p>',
    }, {
      title: 'Pourquoi dois-je communiquer un IBAN ?',
      contents: '<p>Pour devenir Alfred, il est impératif qu’un mode de versement soit renseigné dans votre compte utilisateur. En effet, après chaque service réalisé, My Alfred procède au versement du montant indiqué sur la réservation sur votre compte bancaire.</p><p style=\{\{width: \'100%\'\}\}>Pour ajouter ou supprimer votre IBAN :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Compte</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Mes préférences de versement</strong></li><li>Cliquez sur <strong>Ajouter un RIB</strong></li></ol>',
    }, {
      title: 'Quels sont les documents à fournir pour les versements ?',
      contents: '<p>Pour que nous puissions effectuer le versement de votre prestations,vous devez nous fournir les éléments suivants en fonction de votre statut de particulier ou d’auto-entrepreneur.Ces éléments vous sont demandés lors de votre inscription et lors de la création de votre boutique.</p><p style=\{\{width: \'100%\'\}\}>Vous êtes un particulier :</p><br/><ul style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Votre nom et prénom</li><li>Votre date de naissance</li><li>Votre pays de résidence</li><li>Votre nationalité</li><li>Votre pièce d\'identité</li><li>Votre compte bancaire (IBAN)</li></ul><p style=\{\{width: \'100%\'\}\}>Vous êtes un auto-entrepreneur, en complément des éléments ci-dessus,les éléments suivants vous sont également demandés :</p><ul style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Votre email</li><li>Nom de votre entreprise</li></ul>',
    }, {
      title: 'Comment puis-je retrouver mes informations de versements ?',
      contents: '<p>En tant qu’Alfred, vous pouvez suivre l’ensemble de vos versements dans la rubrique performance de votre boutique.A l’aide de votre tableau de bord, suivez l’évolution de vos versements passés et à venir, et retrouvez toutes les informations sur vos versements.</p><p style=\{\{width: \'100%\'\}\}>Pour consulter vos informations de versements :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Je suisAlfred</strong></li><li>Cliquez sur l’onglet <strong>Performance</strong></li><li>Cliquez sur <strong>revenus</strong></li></ol>',
    },
  ],
  'Mes réservations': [
    {
      title: 'Comment modifier une réservation confirmée en tant qu’Alfred ?',
      contents: '<p>En tant qu’Alfred, vous pouvez modifier une réservation à la seule condition que votre utilisateur l’accepte. Si votre utilisateur l’accepte, vous pouvez modifier la date et l’horaire de votre service,son prix, le prix de votre option ou compléter le service par une prestation présente dans votre service.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier votre réservation :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Je suisAlfred</strong></li><li>Cliquez sur <strong>Mes réservations</strong></li><li>Parcourez votre fiche réservation et cliquez sur modifier en bas de votre fiche de réservation</li><li>Cliquez sur <strong>Modifier la réservation</strong></li><li>Indiquez le champs que vous souhaitez modifier(prix/prestations/option/date etc.)</li><li>Cliquez sur <strong>Envoyer une demande de modification</strong></li></ol><p>Une fois la demande de modification envoyée, vous devrez attendre la validation de votre client pour qu’elle soit modifiée. Votre fiche de réservation se mettra automatiquement à jour.</p>',
    }, {
      title: 'Comment annuler une réservation en tant qu’Alfred ?',
      contents: "<p>L’annulation d’une réservation entraîne du stress et est susceptible d'impacter votre client utilisateur. En tant qu’Alfred, vous pouvez annuler une réservation mais vous vous exposez à une pénalité de la part de votre client utilisateur. Si vous avez activé la réservation automatique sans demande de confirmation, vous pouvez annuler vos réservations sans pénalités mais un commentaire mentionnant que vous avez annulé la réservation sera automatiquement publié sur votre boutique.</p><p>Si vous n’avez pas activé la réservation automatique et décidez d’annuler une réservation plus de 7 jours avant la date d’exécution définie, une pénalité forfaitaire de 10€ vous sera demandée,et 20€ si l’annulation intervient 7 jours ou moins avant la date d’exécution du service définie dans la réservation. Par ailleurs, si vous annulez des réservations de trop nombreuses fois, vous ne respectez plus les CGU de My Alfred et votre boutique ne sera plus visible.</p><p>En cas d’annulation d’une réservation par un Alfred, le client utilisateur sera remboursé de la totalité des frais engagés sur la plateforme My Alfred dans le cadre de la réservation concernée.</p><p style=\{\{width: \'100%\'\}\}>Pour annuler votre réservation :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Je suisAlfred</strong></li><li>Cliquez sur <strong>Mes réservations</strong></li><li>Parcourez votre fiche réservation et cliquez sur modifier en bas de votre fiche de réservation</li><li>Cliquez sur <strong>Annuler ma réservation</strong></li><li>Choisissez le motif de l’annulation</li><li>Rédigez un message à votre client utilisateur lui expliquant que son service est annulé</li><li>Cliquez sur <strong>Enregistrer</strong></li></ol><p>A noter qu’en cas d’imprévu, vous avez la possibilité de modifier la date de la réservation avec l’accord de votre client utilisateur My Alfred.</p>",
    }, {
      title: 'Quelles sont les pénalités si j’annule une réservation en tant qu’Alfred ?',
      contents: '<p>En tant qu’Alfred, vous pouvez annuler une réservation mais vous vous exposez à une pénalité de la part de votre client utilisateur. Si vous avez activé la réservation automatique sans demande de confirmation, vous pouvez annuler vos réservations sans pénalités mais un commentaire mentionnant que vous avez annulé la réservation sera automatiquement publié sur votre boutique.</p><p>Si vous n’avez pas activé la réservation automatique et décidez d’annuler une réservation plusde7 jours avant la date d’exécution définie, une pénalité forfaitaire de 10€ vous sera demandée, et 20€ si l’annulation intervient 7 jours ou moins avant la date d’exécution du service définie dans la réservation. Par ailleurs, si vous annulez des réservations de trop nombreuses fois, vous ne respectez plus les CGU de My Alfred et votre boutique ne sera plus visible.</p>',
    }, {
      title: 'Comment rembourser mon utilisateur ?',
      contents: '<p>En cas d’annulation d’une réservation par un Alfred, le client utilisateur. sera remboursé de la totalité des frais engagés sur la plateforme My Alfred dans le cadre de la réservation concernée.</p><p style=\{\{width: \'100%\'\}\}>Pour annuler votre réservation :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Je suisAlfred</strong></li><li>Cliquez sur <strong>Mes réservations</strong></li><li>Parcourez votre fiche réservation et cliquez sur modifier en bas de votre fiche de réservation</li><li>Cliquez sur <strong>Annuler ma réservation</strong></li><li>Choisissez le motif de l’annulation</li><li>Rédigez un message à votre client utilisateur lui expliquant que son service est annulé</li><li>Cliquez sur <strong>Enregistrer</strong></li></ol><p>A noter qu’en cas d’imprévu, vous avez la possibilité de modifier la date de la réservation avec l’accord de votre client utilisateur My Alfred.</p>',
    },
  ],
  'Mon compte': [
    {
      title: 'Comment supprimer sa boutique ?',
      contents: '<p>A tout moment, vous avez la possibilité de supprimer votre boutique de services My Alfred.La suppression de votre boutique entraîne l’annulation de l’ensemble des réservations acceptées à venir, et leur remboursement.</p><p style=\{\{width: \'100%\'\}\}>Pour supprimer votre boutique :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Paramètres</strong></li><li>Cliquez sur <strong>Supprimer</strong> dans la rubrique je souhaite supprimer ma boutique de services</li></ol><p>Saisissez votre mot de passe. Cette étape nous permet de nous assurer que vous êtes bien à l’initiative de la suppression de votre compte. Attention, cette action est irrémédiable.</p>',
    }, {
      title: 'Comment gérer mes modes de versement ?',
      contents: '<p>Après chaque prestation réalisée par un Alfred, un versement du montant indiqué sur la fiche de réservation lui sera adressé sur le mode de versement renseigné dans son compte utilisateur.A tout moment, vous pouvez ajouter ou supprimer un mode de versement.</p><p style=\{\{width: \'100%\'\}\}>Pour ajouter ou modifier votre préférence de versement :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Préférences de versement</strong></li><li>Cliquez sur <strong>Ajouter un RIB</strong></li><li>Renseignez votre IBAN</li></ol><p>Vous pourrez ensuite modifier ou supprimer votre RIB.</p>',
    },
  ],
}

const FAQ_CLIENT = {
  'Identification et vérification': [
    {
      title: 'Fonctionnement ?',
      contents: "<p>Chez My Alfred nous souhaitons que les membres puissent proposer et consommer des services en toute sécurité. C’est la raison pour laquelle , nous vous laissons la possibilité de nous fournir une pièce d'identité officielle lorsque vous êtes utilisateur et souhaitez simplement consommer des services. Lorsque vous souhaitez proposer vos services et devenir Alfred, nous vous demanderons une pièce d’identité. Certains clients seront sensibles à cette vérification d’identité et feront plus facilement le choix de votre boutique. Cependant, votre pièce d'identité ne sera jamais partagée ni visible par un autre utilisateur de My Alfred.</p>",
    }, {
      title: 'A quel moment dois-je fournir une pièce d\'identité ?',
      contents: "<p>Pour devenir Alfred, vous devez fournir une pièce d’identité en règle qui peut être soit une carte nationale d’identité soit un passeport. Vous pouvez fournir cette pièce d’identité. lors de la création de votre boutique ou plus tard dans le menu Votre profil. La vérification de votre pièce d'identité est indispensable pour Devenir Alfred et pour que votre boutique soit visible des autres membres My Alfred.</p><p>Vous pouvez à tout moment insérer votre pièce d\'identité .</p><p style=\{\{width: \'100%\'\}\}>c</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Profil</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Confiance & vérification</strong> de votre compte</li><li>Sélectionnez le type de pièce Passeport ou Carte nationale d’identité</li><li>Cliquez sur Recto pour télécharger votre photo de pièce d’identité</li><li>Cliquez sur Verso pour ajouter le verso de votre pièce d’identité.</li></ol>",
    }, {
      title: 'Quel type de pièce d\'identité puis-je fournir ?',
      contents: '<p style=\{\{width: \'100%\'\}\}>Vous pouvez ajouter une des pièces d’identité officielle suivante sur la plateforme My Alfred :</p><br/><ul style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Passeport</li><li>Carte Nationale d’Identité</li></ul><p>Si vous ajoutez votre carte Nationale d’identité, vous devrez télécharger 2 photos à savoir,le recto et le verso de votre document. Si vous ajoutez votre passeport,1 seule photo à télécharger est nécessaire mais assurez vous que que les numéros situés en bas de la page du passeport où figure votre photo soient bien visibles.</p>',
    }, {
      title: 'Quelles sont les données partagées avec votre pièce d’identité ?',
      contents: '<p style=\{\{width: \'100%\'\}\}>Si vous acceptez de fournir une pièce d\'identité officielle, les informations suivantes peuvent être visibles par les autres utilisateurs de la plateforme My Alfred :</p><br/><ul style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>La confirmation que votre pièce d\'identité a bien été ajoutée</li><li>Votre photo de profil et le prénom et le nom figurant sur votre profil</li></ul><p>La photo de votre carte d’identité ainsi que les informations (à l\’exception de votre nom et prénom)ne seront jamais visibles par les autres utilisateurs de la plateforme My Alfred.</p>',
    }, {
      title: 'Comment est stockée ou supprimée la photo de ma pièce d\'identité ?',
      contents: '<p>Le stockage de la photo de votre pièce d\'identité officielle est régie par notre <Link href={\'/\'}><a> Politique de confidentialité.</a></Link>Il est préférable de ne pas supprimer votre pièce d’identité. Si vous avez des réservations pour lesquelles les clients ont exigé une pièce d’identité vérifiée, nous annulerons toutes les réservation concernées à venir.Cependant, vous pouvez demander la suppression de la photo de votre pièce d\'identité 90 jours après la fin de votre dernière réservation.</p><p style=\{\{width: \'100%\'\}\}>Pour supprimer la photo de votre pièce d\'identité :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Consultez <strong>votre Profil</strong> sur my-alfred.io</li><li>Cliquez sur l’onglet <strong>Confiance & vérification</strong> de votre compte</li><li>Cliquez sur la corbeille à côté de votre pièce d’identité pour la supprimer</li></ol>',
    }],
  'Mes réservations': [
    {
      title: 'Puis-je modifier le prix d’une réservation en attente ou confirmée ?',
      contents: '<p>Chaque réservation peut-être modifiée quelque soit son statut. En revanche, votre client utilisateur doit impérativement accepter cette modification pour que la réservation retrouve son statut confirmée.</p><p>Si votre réservation est confirmée mais que vous choisissez de la modifier, son statut passera de réservation confirmée à réservation en attente jusqu’à ce que votre client utilisateur confirme les modifications.</p><p>Si votre utilisateur ne valide pas vos modifications dans un délai 48h,la réservation est expirée. Si votre utilisateur refuse vos modifications, la réservation est annulée et votre client sera remboursé de l’intégralité du montant engagé.</p>',
    }, {
      title: 'Puis-je planifier mon service sur plusieurs jours ?',
      contents: "<p>Dans le cadre de services susceptibles de se dérouler sur plusieurs journées ou plusieurs créneaux horaires, nous vous recommandons de vous rapprocher de votre client utilisateur. afin d'établir ensemble, un planning d’intervention.Une fois le planning d’intervention établi, vous pourrez renseigner ce dernier dans votre fiche réservation et dans votre calendrier; celui de votre client se mettra automatiquement à jour(périodes renseignées indisponibles).</p><p>A noter que la version publique de votre calendrier ne comporte que des périodes disponibles ou indisponibles, et non le contenu de vos services.</p>",
    }, {
      title: 'Puis-je échanger avec mon Alfred ou mon client ?',
      contents: '<p>Les utilisateurs sont en mesure de vous contacter afin d’obtenir des renseignements complémentaires sur l’un de vos services. Ils pourront vous contacter mais leurs coordonnées n\'apparaîtront pas,et vous ne pourrez pas leur communiquer votre numéro de téléphone et email personnel. Dès lors qu’une demande de réservation est envoyée, vous pourrez échanger avec votre utilisateur ou votre alfred depuis la messagerie de My Alfred.En revanche, dès lors qu’une réservation est confirmée, vous pourrez échanger depuis la plateforme My Alfred, et les coordonnées de votre Alfred ou de l’utilisateur seront échangées pour un maximum de fluidité dans la réservation de la prestation.</p><p>Pour retrouver vos messages en tant qu’utilisateur, il vous suffit de vous rendre dans l’onglet<strong> Messages</strong>. Pour retrouver vos messages en tant qu’Alfred, il vous suffit de cliquer sur l’onglet<strong> Je suis Alfred</strong>, et de vous rendre dans la rubrique <strong>Messages</strong>.</p>',
    },
  ],
  'Mon compte': [
    {
      title: 'Comment supprimer son compte ?',
      contents: "<p>A tout moment, vous avez la possibilité de supprimer votre compte My Alfred. La suppression de votre compte est irrémédiable.Si vous êtes Alfred, la suppression du compte implique la suppression de votre boutique, l'annulation de l’ensemble des réservations acceptées à venir, et leur remboursement.Si vous êtes simple utilisateur, la suppression de votre compte implique l’annulation de l'ensemble des réservations acceptées à venir, moyennant - en fonction des conditions d’annulation de(s) Alfred impacté(s) par cette annulation - des frais d’annulation.</p><p style=\{\{width: \'100%\'\}\}>Pour supprimer votre compte :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Paramètres</strong></li><li>Cliquez sur <strong>Désactiver</strong> dans la rubrique je souhaite désactiver mon compte</li></ol><p>Saisissez votre mot de passe. Cette étape nous permet de nous assurer que vous êtes bien à l’initiative de la suppression de votre compte.</p>",
    }, {
      title: 'Comment gérer mes notifications ?',
      contents: "<p>Vos notifications peuvent être paramétrées depuis votre compte. Cela vous permet de choisir le moyen de communication le plus adapté à vos besoins ou à vos habitudes(SMS, emails, push, appel téléphonique).Les notifications sont classées par rubrique et vous pouvez choisir à tout moment, de les modifier ou de les désactiver.</p><p>Seule la rubrique Assistance du compte doit impérativement avoir l'une des options de notifications activée. En effet, dans le cadre de vos réservations de services, des informations légales,des questions de sécurité et de confidentialité, et pour répondre à vos demandes adressées à notre assistance utilisateur, nous devons être en mesure de vous envoyer des messages. Pour votre sécurité,vous ne pouvez pas désactiver les notifications par email et nous pourrions vous contacter par téléphone ou d’autres moyens si besoin.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier le paramétrage de vos notifications, il vous suffit de :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur la rubrique <strong>Notifications</strong></li><li>Cliquez sur <strong>Enregistrer</strong></li></ol><p>Saisissez votre mot de passe. Cette étape nous permet de nous assurer que vous êtes bien à l’initiative de la suppression de votre compte.</p>",
    }, {
      title: 'Comment gérer mes modes de paiement ?',
      contents: '  <p>Depuis votre compte, vous pouvez gérer l’ensemble de vos modes de paiement.</p><p style=\{\{width: \'100%\'\}\}>Les différents moyens de paiements de My Alfred sont les suivants :</p><br/><ul style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Carte de paiement</li><li>Crédit (remboursement crédité sur votre compte)</li><li>Coupons (programme fidélité, parrainage, code promotionnel etc.)</li></ul><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur la rubrique <strong>Mes moyens de paiement</strong></li></ol>',
    }, {
      title: 'Comment suivre mes transactions ?',
      contents: "<p>En tant qu’utilisateur de My Alfred, vous pouvez suivre l’ensemble de vos transactions depuis la rubrique “Historique de transactions” de votre compte. Les transactions concernent les paiements et les versements.Vous pourrez ainsi retrouver vos transactions à venir et vos transactions passées.</p><p>En tant qu’Alfred, vous avez aussi la possibilité de suivre vos transactions dans la rubrique performance de votre boutique. Vous trouverez un tableau de bord complet vous permettant de suivre l'évolution des transactions, de suivre vos versements, et d'estimer votre volume de transactions à venir.</p>",
    }, {
      title: 'Comment changer mon mot de passe ?',
      contents: '<p>A tout moment, vous pouvez changer votre mot de passe sur My Alfred.Pour des raisons de sécurité,nous vous conseillons de changer votre mot de passe 3 fois par an.</p><p style=\{\{width: \'100%\'\}\}>Pour changer votre mot de passe :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Sécurité</strong></li></ol><p>Saisissez votre mot de passe actuel, puis saisissez le nouveau mot de passe, puis répétez le mot de passe.Si les mots de passe correspondent, vous pourrez enregistrer et votre mot de passe sera mis à jour.Attention, le mot de passe doit contenir 8 caractères au minimum, et demeure strictement confidentiel,vous ne devez en aucun cas le partager, le divulguer pour quelque raison que ce soit.</p>',
    }, {
      title: 'Vous avez oublié votre mot de passe ?',
      contents: ' <p>Si vous avez oublié votre mot de passe lorsque vous souhaitez vous connecter, cliquez sur “J’ai oublié mon mot de passe” sur la page de connexion de My Alfred. Un lien de récupération de votre compte vous sera envoyé par email afin que vous puissiez créer un nouveau mot de passe et retrouver votre compte.Si vous ne recevez pas d’e-mail, pensez à jeter un coup d’oeil dans vos courriers indésirables;) !</p>',
    }, {
      title: 'Puis-je connecter My Alfred à mon compte Gmail ?',
      contents: '<p>Lors de l’inscription, vous pouvez choisir de vous connecter au travers de Gmail afin de gagner du temps sur votre inscription et synchroniser vos contacts sur My Alfred. A tout moment,vous pouvez supprimer la connexion entre My Alfred et votre Gmail.</p><p style=\{\{width: \'100%\'\}\}>Pour cela:</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Applications connectées</strong></li><li>Cliquez sur <strong>Supprimer</strong> dans l’encart de l’application Gmail</li></ol><p style=\{\{width: \'100%\'\}\}>Si vous souhaitez connecter votre Gmail à My Alfred après votre inscription :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Applications connectées</strong></li><li>Cliquez sur <strong>Connecter</strong> dans l’encart de l’application Gmail</li><li>Acceptez la connexion My Alfred sur votre Gmail</li></ol><p>A noter que les applications connectées sont soumises à nos conditions générales d’utilisation.</p>',
    }, {
      title: 'Puis-je connecter My Alfred à mon compte Facebook ?',
      contents: '<p>Lors de l’inscription, vous pouvez choisir de vous connecter au travers de Facebook afin de gagner du temps sur votre inscription et synchroniser vos contacts sur My Alfred. A tout moment,vous pouvez supprimer la connexion entre My Alfred et votre Facebook.</p><p style=\{\{width: \'100%\'\}\}>Pour cela:</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Applications connectées</strong></li><li>Cliquez sur <strong>Supprimer</strong> dans l’encart de l’application Facebook</li></ol><p style=\{\{width: \'100%\'\}\}>Si vous souhaitez connecter votre Facebook à My Alfred après votre inscription :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Applications connectées</strong></li><li>Cliquez sur <strong>Connecter</strong> dans l’encart de l’application Facebook</li><li>Acceptez la connexion My Alfred sur votre Facebook</li></ol><p>A noter que les applications connectées sont soumises à nos conditions générales d’utilisation.</p>',
    }, {
      title: 'Comment empêcher l’indexation de mon profil et ma boutique sur les moteurs de recherche ?',
      contents: "<p>A tout moment et conformément à notre politique de confidentialité, vous pouvez choisir d'empêcher l'indexation de votre profil, de votre boutique et de vos services parles moteurs de recherche.</p><p style=\{\{width: \'100%\'\}\}>Pour empêcher l’indexation de votre profil et de votre boutique par les moteurs de recherche :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mes paramètres</strong></li><li>Cliquez sur <strong>Paramètres</strong></li><li>Désactiver la ligne ‘’J\'accepte que mon profil et ma boutique soient indexés par les moteurs de recherche”</li></ol>",
    }, {
      title: 'Comment gérer mes parrainages ?',
      contents: '',
    }, {
      title: 'A quoi sert le parrainage ?',
      contents: ' <p>Le parrainage vous permet de gagner des crédits sur la plateforme My Alfred en contribuant à l’évolution de la communauté My Alfred. En invitant vos amis, votre famille, vos proches,à devenir Alfred ou à utiliser My Alfred, vous gagnerez 20% du montant de sa première réservation,crédité dans votre compte, rubrique “Mode de paiement”.</p>',
    },
  ],
  'Mon profil': [
    {
      title: 'Comment modifier mon profil utilisateur ?',
      contents: '<p>Vous pouvez à tout moment modifier votre profil et mettre à jour vos informations personnelles en vous rendant dans la rubrique Mon profil.Votre profil contient des informations obligatoires comme votre nom,prénom, votre date de naissance ainsi que votre email.Vous pouvez choisir d’indiquer des informations complémentaires pour vos utilisateurs, comme les langues que vous parlez, votre emploi, vos diplômes...Ces informations seront visibles par les autres utilisateurs sur votre profil.</p><p style=\{\{width: \'100%\'\}\}>Pour accéder à votre profil :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mon profil</strong></li><li>Cliquez sur <strong>Modifier le profil</strong></li></ol>',
    }, {
      title: 'A quoi correspondent les adresses de prestations ?',
      contents: '<p style=\{\{width: \'100%\'\}\}>Lorsque vous souhaitez réserver un service, notre plateforme vous propose des Alfred en fonction de leur périmètre d’intervention. Dans ce cadre, nous utiliserons l’adresse de prestation que vous aurez indiquée pour la prestation de service commandée. Vous pouvez à tout moment ajouter ou modifier vos adresses de prestations.</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mon profil</strong></li><li>Cliquez sur <strong>Mes adresses de prestations</strong></li></ol>',
    }, {
      title: 'Puis-je avoir plusieurs adresses de prestation ?',
      contents: '<p>Vous pouvez choisir de renseigner plusieurs adresses de prestations dans le cadre de vos réservations sur My Alfred. Dans votre profil, rubrique “Mes adresses de prestations”, vous pouvez ajouter, supprimer, modifier vos adresses de prestations. La première adresse saisie sera,par défaut, votre adresse principale, ce qui signifie qu’elle sera l’adresse sélectionnée par défaut pour vos réservations. A tout moment vous pouvez changer d’adresse par défaut en modifiant votre adresse principale.</p><p>Soyez rassuré(s) ! Vos adresses ne seront pas visibles des autres utilisateurs, seuls lesAlfred qui auront reçu une réservation et l’auront confirmé, disposeront de votre adresse de prestation pour le service concerné.</p>',
    }, {
      title: 'Comment gérer ma photo de profil ?',
      contents: '<p>La photo de votre profil sera visible des utilisateurs du site et leur permettra de déjà vous connaître ! Pour ajouter, modifier ou supprimer une photo de profil,rendez-vous dans la rubrique“Photo” de votre profil. Si vous souhaitez supprimer votre photo de profil, cliquez sur la corbeille en haut à droit de votre photo. Si vous souhaitez ajouter ou supprimer une photo, cliquez sur “Télécharger une photo depuis votre ordinateur”.</p><p>Conseil : Téléchargez une photo claire et lumineuse, de bonne qualité.Pour un rendu optimal,la photo doit être cadrée, sans lunette de soleil, en regardant l’objectif, avec seulement vous sur la photo.</p>',
    }, {
      title: 'Comment vérifier mon email ?',
      contents: "<p>Lors de votre inscription, nous vous demanderons de renseigner votre adresse email.Un profil dont l’email est vérifié donne plus confiance aux autres utilisateurs de la plateforme. Pour confirmer votre adresse email, vous devez simplement cliquer sur‘’je confirme mon email’’ dans l'email reçu lors de votre inscription. Si vous n’avez pas reçu d’email,nous vous invitons à vérifier votre email ou à consulter vos spams. A tout moment, vous avez la possibilité de modifier votre email et/ou de demander un nouvelle confirmation de votre email.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier votre adresse email :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mon profil</strong></li><li>Cliquez sur <strong>Confiance et vérification</strong></li><li>Modifiez votre email</li><li>Cliquez sur Enregistrer</li></ol><p style=\{\{width: \'100%\'\}\}>Pour demander une nouvelle vérification de votre adresse email :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mon profil</strong></li><li>Cliquez sur <strong>Confiance et vérification</strong></li><li>Cliquez sur Envoyer email de vérification</li><li>Vérifiez ensuite votre boîte d’emails et cliquez sur ‘’je confirme mon email’’ dans l'email que vous avez reçu.</li></ol>",
    }, {
      title: 'Comment vérifier mon téléphone ?',
      contents: '<p>Lors de votre inscription, vous êtes invité(s) à renseigner et à vérifier votre numéro de téléphoneportable. L’ajout d’un téléphone vérifié permet aux autres utilisateurs de la plateforme de disposer d’un moyen de vous contacter lors d’une réservation. Une vérification du numéro de téléphone portable est demandée aux Alfreds lors de la création de leur boutique de services et aux utilisateurs lors de la réservation d’un service auprès d’un Alfred. Vous pouvez à tout moment modifier ou demander une nouvelle vérification de votre téléphone portable.</p><p style=\{\{width: \'100%\'\}\}>Pour modifier votre téléphone portable :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mon profil</strong></li><li>Cliquez sur <strong>Confiance et vérification</strong></li><li>Modifiez votre téléphone portable</li><li>Cliquez sur Enregistrer</li></ol><p style=\{\{width: \'100%\'\}\}>Pour demander une nouvelle vérification de votre téléphone portable :</p><br/><ol style=\{\{fontFamily: \'Helvetica\', fontSize: \'0.9rem\'\}\}><li>Rendez-vous sur my-alfred.io, cliquez sur <strong>Mon profil</strong></li><li>Cliquez sur <strong>Confiance et vérification</strong></li><li>Cliquez sur Envoyer SMS de vérification</li><li>Saisir le code à 4 chiffres reçu par SMS sur votre téléphone</li></ol>',
    },
  ],

}

const FAQ = {
  'alfred': FAQ_ALFRED,
  'client': FAQ_CLIENT,
}
module.exports = {
  CESU_NOTICE,
  OUTSIDE_PERIMETER,
  SCHEDULE_TITLE,
  SCHEDULE_SUBTITLE,
  getMangopayMessage,
  SHOP_CREATION_SUCCESSFUL,
  ID_CARD_CONFIRM_DELETION,
  REGISTRATION_PROOF_CONFIRM_DELETION,
  INFOBAR_MESSAGE,
  SHOWMORE,
  SEARCHBAR,
  BANNER_PRESENTATION,
  B2B_BANNER_PRESENTATION,
  CATEGORY,
  BECOME_ALFRED,
  RESA_SERVICE,
  HOW_IT_WORKS,
  NEWS_LETTER,
  NAVBAR_MENU,
  SHOP,
  CMP_PRESENTATION,
  BOOKING,
  FAQ,
  INFOBARMOBILE_MESSAGE,
  AVOCOTES,
  PROFIL,
  OUR_ALFRED,
  TRUST_SECURITY,
  LOGIN,
  ABOUT,
  LAYOUT_ABOUT,
  EDIT_PROFIL,
  PAYMENT_METHOD,
  HANDLE_CB,
  HANDLE_RIB,
  PAYMENT_CARD,
  MY_ADDRESSES,
  HANDLE_ADDRESSES,
  TRUST_VERIFICATION,
  SECURITY,
  NOTIFICATIONS,
  ADD_SERVICES,
  SERVICES,
  ASK_QUESTION,
  SUMMARY_COMMENTARY,
  STATISTICS,
  MESSAGES,
  MESSAGE_DETAIL,
  MESSAGE_SUMMARY,
  REGISTER,
  REGISTER_FRIST_PAGE,
  REGISTER_SECOND_PAGE,
  REGISTER_THIRD_PAGE,
  SEARCH,
}
