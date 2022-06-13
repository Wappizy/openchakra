const withParams = require('../components/withParams')
import Album from '../components/Album/Album'
import {Divider, Link} from '@material-ui/core'
const {
  getDeadLine,
  isDateAvailable,
  isMomentAvailable,
} = require('../utils/dateutils')
import {snackBarError} from '../utils/notifications'
import CustomButton from '../components/CustomButton/CustomButton'
import ReactHtmlParser from 'react-html-parser'
const axios = require('axios')
const PreviewBase = require('./previewBase')
import {withTranslation} from 'react-i18next'
import {withStyles} from '@material-ui/core/styles'
import styles from '../static/css/pages/userServicePreviewPage/userServicePreviewStyle'
import Grid from '@material-ui/core/Grid'
import Router from 'next/router'
import UserAvatar from '../components/Avatar/UserAvatar'
import Typography from '@material-ui/core/Typography'
import Schedule from '../components/Schedule/Schedule'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import MapComponent from '../components/map'
import {registerLocale} from 'react-datepicker'
import fr from 'date-fns/locale/fr'
import Head from 'next/head'
import Topic from '../hoc/Topic/Topic'
import ListAlfredConditions from '../components/ListAlfredConditions/ListAlfredConditions'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'
import SummaryCommentary from '../components/SummaryCommentary/SummaryCommentary'
import DrawerBooking from '../components/Drawer/DrawerBooking/DrawerBooking'
import LayoutMobile from '../hoc/Layout/LayoutMobile'

import ListIconsSkills from '../components/ListIconsSkills/ListIconsSkills'
import CustomListGrades from '../components/CustomListGrades/CustomListGrades'
import CustomIcon from '../components/CustomIcon/CustomIcon'
const {setAxiosAuthentication}=require('../utils/authentication')
const {BOOK_STATUS, MANAGER}=require('../utils/consts')
const isEmpty = require('../server/validation/is-empty')
const {computeDistanceKm} = require('../utils/functions')
const {roundCurrency} = require('../utils/converters')
const {computeBookingReference} = require('../utils/text')
const lodash = require('lodash')

const moment = require('moment')
const {getRole, isLoggedUserAdmin}=require('../utils/context')

moment.locale('fr')
registerLocale('fr', fr)

// TODO : gérer affichage si utilisateur non connecté
class UserServicesPreview extends React.Component {
  constructor(props) {
    super(props, false)
    this.hasWarningSelf=this.hasWarningSelf.bind(this)
  }

  // Converts 'all' to 'main'
  get_prop_address = () => {
    return this.props.params.address=='all' ? 'main' : this.props.params.address
  }

  componentDidMount() {

    const id = this.props.params.id

    setAxiosAuthentication()

    let bookingObj = JSON.parse(localStorage.getItem('bookingObj'))
    if (bookingObj && bookingObj.serviceUserId.toString() !== id) {
      console.warn('Incorrect bookingObj.serviceUserId')
      bookingObj = null
      localStorage.removeItem('bookingObj')
    }

    axios.get('/myAlfred/api/booking/avocotes')
      .then(res => {
        this.setState({all_avocotes: res.data})
      })
      .catch(err => {
        console.error(err)
      })
    axios.get(`/myAlfred/api/serviceUser/${id}`)
      .then(res => {
        let serviceUser = res.data
        let count = Object.fromEntries(serviceUser.prestations.map(p => [p._id, null]))

        if (bookingObj) {
          serviceUser.prestations.forEach(p => {
            const bookP = bookingObj.prestations.find(bp => {
              return bp.name === p.prestation.label
            })
            if (bookP) {
              count[p._id] = parseInt(bookP.value)
            }
          })
        }

        let st = []
        axios.get('/myAlfred/api/users/current')
          .catch(err => {
            console.error(err)
          })
          .then(res => {
            let user = res ? res.data : null
            // Filter private_company prestations
            serviceUser.prestations=serviceUser.prestations.filter(p => {
              const company=p.prestation.private_company
              if (company) {
                return isLoggedUserAdmin()
              }
              return true
            })
            // Mode compagnie : l'admin a un budget illimité comme un user standard, le manager a le budget de son département
            if (user && user.company) {
              axios.get(`/myAlfred/api/companies/budget/${user._id}/${getRole()}`)
                .then(res => {
                  this.setState({available_budget: res.data, role: getRole()})
                })
                .catch(err => {
                  console.error(err)
                  this.setState({available_budget: 0})
                })
              axios.get(`/myAlfred/api/companies/supported/${user._id}/${serviceUser.service._id}/${getRole()}`)
                .then(res => {
                  const percent=res.data
                  this.setState({company_percent: percent})
                })
                .catch(err => {
                  console.error(err)
                })

            }
            st.user=user
            const promise = Promise.resolve({data: user})
            promise
              .then(res => {
                if (res.data) {
                  let allAddresses = {'main': {...res.data.billing_address, label: this.props.t('USERSERVICEPREVIEW.at_home')}}
                  res.data.service_address.forEach(addr => {
                    allAddresses[addr._id] = addr
                  })
                  st.allAddresses=allAddresses
                }
                else {
                  st.allAddresses = {}
                }

                axios.get(`/myAlfred/api/availability/userAvailabilities/${serviceUser.user._id}`)
                  .then(res => {
                    let availabilities = res.data
                    st.availabilities=availabilities
                    const excludedDays = this.getExcludedDays(availabilities)
                    st.excludedDays=excludedDays
                    axios.get(`/myAlfred/api/reviews/${serviceUser.user._id}`)
                      .then(response => {
                        const skills = response.data
                        st.skills=skills
                        axios.get(`/myAlfred/api/shop/alfred/${ serviceUser.user._id}`)
                          .then(res => {
                            let shop = res.data
                            st.shop=shop
                            st.flexible=shop.flexible_cancel
                            st.moderate=shop.moderate_cancel
                            st.strict=shop.strict_cancel
                            st.use_cesu=shop.cesu !== 'Disabled'
                            axios.get(`/myAlfred/api/reviews/profile/customerReviewsCurrent/${serviceUser.user._id}`)
                              .then(res => {
                                let reviews = res.data
                                if (id) {
                                  reviews = reviews.filter(r => r.serviceUser._id === id)
                                }
                                st.reviews=reviews
                                const equipmentsPromise=serviceUser.service.equipments.map(res => axios.get(`/myAlfred/api/equipment/${res}`))
                                Promise.all(equipmentsPromise)
                                  .then(res => {
                                    st.allDetailEquipments=res.map(r => r.data)
                                    this.setState({
                                      serviceUser: serviceUser,
                                      service: serviceUser.service,
                                      equipments: serviceUser.equipments,
                                      prestations: serviceUser.prestations,
                                      allEquipments: serviceUser.service.equipments,
                                      alfred: serviceUser.user,
                                      count: count,
                                      pick_tax: null,
                                      date: bookingObj && bookingObj.prestation_date ? moment(bookingObj.prestation_date, 'DD/MM/YYYY').toDate() : null,
                                      time: bookingObj && bookingObj.prestation_date ? moment(bookingObj.prestation_date).toDate() : null,
                                      location: bookingObj ? bookingObj.location : null,
                                      customer_fee: bookingObj ? bookingObj.customer_fee : null,
                                      provider_fee: bookingObj ? bookingObj.provider_fee : null,
                                      ...st,
                                    }, () => {
                                      this.setDefaultLocation()
                                      this.computeTotal()
                                    })
                                  })
                              })
                          })
                      })
                  })
              })
              .catch(err => console.error(err))
          })
      })
      .catch(err => console.error(err))

  getPageDescription = () => {
    const {alfred, service}=this.state
    return !!alfred && !!service && `${service.label} par ${alfred.firstname}` || ''
  }

  getPagePicture = () => {
    const {service}=this.state
    return !!service && `/${service.picture}` || ''
  }

  getStuffTitle = () => {
    const {alfred}=this.state
    return alfred.firstname && ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_title_stuff_summary')) + alfred.firstname || ''
  }

  setDefaultLocation = () => {
    const {serviceUser, user} = this.state
    let location = serviceUser.location.client && (!user || this.isInPerimeter()) ? this.get_prop_address() || 'main' :
      serviceUser.location.alfred ? 'alfred' : serviceUser.location.visio ? 'visio' : serviceUser.location.elearning ? 'elearning' : null
    this.setState({location: location})
  }

  computeReservationDate = () => {
    let dt = moment(this.state.date)
    let tm = moment(this.state.time)
    if (!dt.isValid() || !tm.isValid()) {
      return null
    }
    dt.hour(tm.hour()).minute(tm.minute())
    return dt
  }

  getAvocotesBooking = () => {
    const {avocotes, all_avocotes}=this.state
    if (!avocotes) {
      return null
    }
    const avocotes_booking=all_avocotes.find(a => a._id==avocotes)
    if (!avocotes_booking) {
      console.error(`Can not find booking ${avocotes}`)
    }
    return avocotes_booking
  }

  onAvocotesChanged = event => {
    const {name, value}=event.target
    const {all_avocotes, serviceUser}=this.state
    const avocotes_booking=all_avocotes.find(a => a._id==value)
    if (!avocotes_booking) {
      return snackBarError(ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.snackbar_no_booking')))
    }
    const suPrestaNames=serviceUser.prestations.map(p => p.prestation.label)
    const avocotesPrestaNames=avocotes_booking.prestations.map(p => p.name)
    const diff=lodash.difference(avocotesPrestaNames, suPrestaNames)
    if (diff.length>0) {
      return snackBarError(ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.snackbar_error_avc')) + diff.join(','))
    }
    let count={}
    avocotes_booking.prestations.forEach(p => {
      const presta = serviceUser.prestations.find(pr => pr.prestation.label == p.name)
      count[presta._id]=p.value
    })
    const allAddresses={'main': avocotes_booking.address}
    this.setState({[name]: value, count: count, allAddresses: allAddresses, location: 'main'}, () => this.computeTotal())
  }

  checkBook = () => {
    let errors = {}
    if (Object.values(this.state.count).every(v => !v)) {
      errors.prestations = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_presta'))
    }
    else if (this.state.totalPrestations < this.state.serviceUser.minimum_basket) {
      errors.prestations = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_minimum_basket', {minimum_basket: this.state.serviceUser.minimum_basket}))
    }

    if (!errors.datetime && this.state.date == null) {
      errors.datetime = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_select_date'))
    }

    if (!errors.datetime && this.state.time == null) {
      errors.datetime = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_select_hour'))
    }

    const reservationDate = this.computeReservationDate()
    if (!errors.datetime && reservationDate.isValid() && !isMomentAvailable(reservationDate, this.state.availabilities)) {
      errors.datetime = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_not_available', {firstname: this.state.alfred.firstname}))
    }

    const minBookingDate = getDeadLine(this.state.serviceUser.deadline_before_booking)
    if (!errors.datetime && reservationDate.isBefore(minBookingDate)) {
      errors.datetime = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_delay_prevenance'))
    }

    if (reservationDate && reservationDate.isBefore(moment())) {
      errors.datetime = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_resa_now'))
    }

    if (!this.state.location) {
      errors.location = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_place'))
    }

    if (this.hasWarningBudget()) {
      errors.total = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_amount_too_high'))
    }
    if (this.hasWarningSelf()) {
      errors.user = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_resa_myself'))
    }
    if (this.hasWarningPerimeter()) {
      errors.alfred = ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.error_place_far_away'))
    }

    this.setState({errors: errors})
  }

  extractFilters = () => {
    let result = {}
    if (this.state.prestations.length === 0) {
      return result
    }
    this.state.prestations.forEach(p => {
      if (p.prestation == null) {
        // FIX : réaffecter les prestations persos
        console.error(`Error:${p.id} has a null prestation`)
      }
      else {
        let filter = p.prestation.filter_presentation
        let key = !filter || filter.label === 'Aucun' ? '' : filter.label
        if (key in result) {
          result[key].push(p)
        }
        else {
          result[key] = [p]
        }
      }
    })
    return result
  }

  convertPrestation = p => {
    return {
      label: p.prestation.label,
      cesu_eligible: p.prestation.cesu_eligible,
      billing: p.billing,
      price: p.price,
      _id: p._id,
    }
  }

  readOnly = () => {
    return !!this.getURLProps().booking_id
  }

  hasWarningSelf() {
    if (this.getURLProps().booking_id) {
      return false
    }
    if (isEmpty(this.state.location) && !this.getAvocotesBooking()) {
      return true
    }
    if (this.isServiceAtHome() && !this.isInPerimeter()) {
      return true
    }
    return false
  }

  hasWarningBudget = () => {
    if (getRole()==MANAGER) {
      const warningBudget = this.state.company_amount < this.state.total
      return warningBudget
    }
    return false
  }

  hasWarningSelf = () => {
    const {user, alfred}=this.state
    return user && alfred && user._id.toString()==alfred._id.toString()
  }

  getClientAddress = () => {
    const {user, allAddresses}=this.state
    if (!user) {
      return null
    }
    const{address}=this.props.params
    if (!address || ['client', 'main', 'all'].includes(address)) {
      return allAddresses.main
    }
    let res = user ? allAddresses[address] : null
    if (res) {
      res.gps = {lat: res.lat, lng: res.lng}
    }
    return res
  }

  getClientAddressLabel = () => {
    const avocotes_booking=this.getAvocotesBooking()
    if (avocotes_booking) {
      return `Chez ${avocotes_booking.user.full_name} (${avocotes_booking.user.billing_address.city})`
    }
    const {user, allAddresses}=this.state
    if (!user || !allAddresses) {
      return ''
    }
    return allAddresses? allAddresses[this.get_prop_address()].label : ''
  }

  getLocationLabel = () => {
    const titles = {
      'client': this.getClientAddressLabel(),
      'main': this.getClientAddressLabel(),
      'alfred': `Chez ${this.state.alfred.firstname}`,
      'visio': ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.at_remote')),
    }
    if (!this.state.location) {
      return ''
    }
    return titles[this.state.location]

  }

  book = actual => { // actual : true=> book, false=>infos request

    const {count, user, pending} = this.state

    if (pending) {
      snackBarError(ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.snackbar_error_resa')))
      return
    }

    let prestations = []
    this.state.prestations.forEach(p => {
      if (this.state.count[p._id]) {
        prestations.push({price: p.price, value: count[p._id], name: p.prestation.label})
      }
    })

    let place
    if (user) {
      switch (this.state.location) {
        case 'alfred':
          place = this.state.serviceUser.service_address
          break
        case 'visio':
          break
        default:
          place = this.getClientAddress()
      }
    }

    const avocotes_booking = this.getAvocotesBooking()

    const date=moment(this.state.date)
    const time=moment(this.state.time)
    const prestation_date=date.set('hours', time.hours()).set('minutes', time.minutes()).set('seconds', 0)

    let bookingObj = {
      reference: user ? computeBookingReference(user, this.state.serviceUser.user) : '',
      service: this.state.serviceUser.service.label,
      serviceId: this.state.serviceUser.service._id,
      address: avocotes_booking ? avocotes_booking.address : place,
      location: this.state.location,
      equipments: this.state.serviceUser.equipments,
      amount: this.state.total,
      company_amount: this.state.company_amount,
      prestation_date: prestation_date,
      alfred: this.state.serviceUser.user._id,
      user: user ? user._id : null,
      prestations: prestations,
      travel_tax: this.state.travel_tax,
      pick_tax: this.state.pick_tax,
      cesu_amount: this.state.cesu_total,
      customer_fee: this.state.customer_fee,
      provider_fee: this.state.provider_fee,
      customer_fees: this.state.customer_fees,
      provider_fees: this.state.provider_fees,
      status: avocotes_booking ? BOOK_STATUS.TO_CONFIRM : actual ? BOOK_STATUS.TO_PAY : BOOK_STATUS.INFO,
      serviceUserId: this.state.serviceUser._id,
      customer_booking: avocotes_booking ? avocotes_booking._id : null,
    }

    let chatPromise = !user ?
      Promise.resolve({res: null})
      :
      axios.post('/myAlfred/api/chatRooms/addAndConnect', {
        emitter: this.state.user._id,
        recipient: this.state.serviceUser.user._id,
      })

    chatPromise.then(res => {

      if (user) {
        bookingObj.chatroom = res.data._id
      }

      localStorage.setItem('bookingObj', JSON.stringify(bookingObj))

      if (!this.state.user) {
        localStorage.setItem('path', Router.asPath)
        Router.push('/?login=true')
        return
      }

      this.setState({pending: true})
      axios.post('/myAlfred/api/booking', bookingObj)
        .then(response => {
          const booking = response.data
          axios.put(`/myAlfred/api/chatRooms/addBookingId/${bookingObj.chatroom}`, {booking: booking._id})
            .then(() => {
              if (booking.customer_booking) {
                Router.push({pathname: '/paymentSuccess', query: {booking_id: booking._id}})
              }
              else if (actual) {
                Router.push({pathname: '/confirmPayment', query: {booking_id: booking._id}})
              }
              else {
                Router.push(`/profile/messages?user=${booking.user}&relative=${booking.alfred}`)
              }
            })
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  formatDeadline = dl => {
    if (!dl) {
      return dl
    }
    return dl.replace('jours', 'jour(s)').replace('semaines', 'semaine(s)').replace('heures', 'heure(s)')
  }

  computePricedPrestations = () => {
    const count = this.state.count
    let result = {}
    this.state.prestations.forEach(p => {
      if (count[p._id]) {
        result[p.prestation.label] = count[p._id] * p.price
      }
    })
    return result
  }

  // TODO : force computing disponibility
  scheduleDateChanged = (dates, mmt, mode) => {
    const dt = new Date([...dates][0])
    this.setState({date: dt, time: mode==='week' ? mmt : undefined}, () => this.checkBook())
  }

  loadAlbums = () => {
    axios.get(`/myAlfred/api/users/profile/albums/${this.state.alfred._id}`)
      .then(res => {
        this.setState({albums: res.data})
      })
      .catch(err => console.error(err))
  }

  getAlbum = id => {
    return this.state.albums.find(a => a._id===id)
  }

  content = classes => {
    const serviceAddress = this.state.serviceUser.service_address
    const filters = this.extractFilters()
    const pricedPrestations = this.computePricedPrestations()
    const avocotes_booking=this.getAvocotesBooking()
    const {shop, serviceUser, alfred}=this.state

    const showProfileEnabled = alfred && alfred._id

    const listCondition = [
      {
        label: alfred.firstname ? ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_list_label')) : '',
        summary: alfred.firstname ? this.state.alfred.firstname + ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_list_summary')) + this.formatDeadline(this.state.serviceUser.deadline_before_booking) + ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_list_summary_end')) : '',
        IconName: alfred.firstname ? <CustomIcon className={'custompreviewsmiley'} style={{height: 35, width: 35, backgroundSize: 'contain'}} materialIcon={<InsertEmoticonIcon fontSize="large"/> }/> : '',
      },
      {
        label: alfred.firstname ? ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_list_condition_label')) : '',
        summary: alfred.firstname ? this.state.alfred.firstname + ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_list_condition_summary')) + this.state.flexible ? ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.one_day')) : this.state.moderate ? `${
          ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.five_days'))}` : ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.ten_days')) + ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.before_end_date')) : '',
        IconName: alfred.firstname ? <CustomIcon className={'custompreviewcalendar'} style={{height: 35, width: 35, backgroundSize: 'contain'}} materialIcon={<CalendarTodayIcon fontSize="large"/>}/> : '',
      },
      {
        label: alfred.firstname ? ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.minimum_basket')) : '',
        summary: alfred.firstname ? ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.minimum_basket_of', {firstname: this.state.alfred.firstname, minimum_basket: this.state.serviceUser.minimum_basket})) : '',
        IconName: alfred.firstname ? <CustomIcon className={'custompreviewshopping'} style={{height: 35, width: 35, backgroundSize: 'contain'}} materialIcon={<ShoppingCartIcon fontSize="large"/>}/> : '',
      },
    ]

    return(
      <Grid style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Grid>
          <Grid className={`custompreviewmain ${classes.mainContainer}`}>
            <Grid container className={classes.widthContainer}>
              <Grid item lg={6} xs={12} className={classes.leftContainer}>
                <Grid container className={classes.avatarAnDescription}>
                  <Grid item sm={3} className={classes.avatarContainer}>
                    <Grid item className={classes.itemAvatar}>
                      <UserAvatar user={alfred} animateStartup={true}/>
                    </Grid>
                  </Grid>
                  <Grid item sm={9} className={classes.flexContentAvatarAndDescription}>
                    <Grid className={classes.marginAvatarAndDescriptionContent}>
                      <Grid container spacing={1} style={{margin: 0, width: '100%'}}>
                        <Grid item xl={10} lg={10} md={12} sm={12} xs={12}>
                          <Typography variant="h6">{alfred.firstname} - {this.state.service.label}</Typography>
                        </Grid>
                        <Grid item xl={2} lg={2} md={12} sm={12} xs={12} className={classes.containerListSkills}>
                          <ListIconsSkills data={{insurance_text: shop.insurance_text, grade_text: serviceUser.grade_text}}/>
                        </Grid>
                      </Grid>
                      {
                        serviceAddress &&
                          <Grid>
                            <Typography style={{color: 'rgba(39,37,37,35%)'}} className={'custompreviewplace'}>{serviceAddress.city}, {serviceAddress.country} - {this.state.serviceUser.perimeter}km autour de {serviceAddress.city}</Typography>
                          </Grid>
                      }
                      {
                        avocotes_booking &&
                          <Grid>
                            <Typography style={{color: 'rgba(39,37,37,35%)'}}>{`Réservation Avocotés pour ${avocotes_booking.user.full_name}`}</Typography>
                          </Grid>
                      }
                    </Grid>
                    <Grid container spacing={2} style={{margin: 0, width: '100%'}}>
                      <Grid item sm={6} xs={12}>
                        <CustomButton variant={'outlined'} classes={{root: 'custompreviewshowprofil'}} className={classes.userServicePreviewButtonProfil}
                          disabled={!showProfileEnabled} onClick={() => Router.push(`/profile/about?user=${alfred._id}`)}>
                          {ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.button_show_profil'))}
                        </CustomButton>
                      </Grid>
                      <Grid item sm={6} xs={12}>
                        <Link href="#availabilities">
                          <CustomButton variant={'outlined'} classes={{root: 'custompreviewshowprofil'}} className={classes.userServicePreviewButtonProfil}>
                            {ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.button_show_availabilities'))}
                          </CustomButton>
                        </Link>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid className={'custompreviewboxdescription'} style={{marginTop: '10%'}}>
                  <Grid className={classes.overrideCssChild}>
                    <Grid style={{width: '100%'}}>
                      <Grid>
                        <h3>{ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_description'))}</h3>
                      </Grid>
                      <Grid>
                        <Typography style={{color: 'rgba(39,37,37,35%)'}}>{this.state.serviceUser.description ? this.state.serviceUser.description : ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_description_summary'))}</Typography>
                      </Grid>
                      <Grid>
                        <CustomListGrades grade={this.state.serviceUser.grade_text} insurance={this.state.shop.insurance_text}/>
                      </Grid>
                      <Grid style={{marginTop: '2%'}}>
                        <Divider className={`customtopicdivider ${classes.topicDivider}`}/>
                      </Grid>
                      <Grid className={`customuserpreviewboxcustom ${classes.boxCustom}`}>
                        <ListAlfredConditions
                          columnsXl={12}
                          columnsLG={12}
                          columnsMD={12}
                          columnsSM={12}
                          columnsXS={12}
                          wrapperComponentProps={listCondition}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid className={`custompreviewschedulecont ${classes.scheduleContainer}`}>
                  <Topic
                    id={'availabilities'}
                    underline={true}
                    titleTopic={ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_title_date'))}
                    titleSummary={alfred.firstname ? ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_title_date_summary')) + alfred.firstname : ''}
                  >
                    <Schedule
                      availabilities={this.state.availabilities}
                      bookings={[]}
                      services={[]}
                      selectable={true}
                      height={400}
                      nbSchedule={1}
                      handleSelection={this.scheduleDateChanged}
                      singleSelection={true}
                      mode={'week'}
                      underline={true}
                      style={classes}
                    />
                  </Topic>
                </Grid>
                {this.state.allDetailEquipments.length !== 0 ?
                  <Grid className={classes.equipmentsContainer}>
                    <Topic
                      titleTopic={ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_title_stuff'))}
                      needBackground={true}
                      underline={true}
                      titleSummary={alfred.firstname ? ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_title_stuff_summary')) + alfred.firstname : ''}
                    >
                      <ListAlfredConditions
                        columnsXl={6}
                        columnsLG={6}
                        columnsMD={6}
                        columnsSM={6}
                        columnsXS={6}
                        wrapperComponentProps={this.state.allDetailEquipments}
                        equipmentsSelected={this.state.equipments}
                      />
                    </Topic>
                  </Grid> : null
                }
                <Grid className={`custompreviewbookingmap ${classes.perimeterContent}`}>
                  {
                    this.state.serviceUser && this.state.serviceUser.service_address ?
                      <Grid style={{width: '100%'}}>
                        <Topic
                          underline={true}
                          titleTopic={ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_place'))}
                          titleSummary={alfred.firstname ? ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_zone_intervention')) + alfred.firstname + ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_zone_intervention_end')) : ''}
                        >
                          <MapComponent
                            position={[this.state.serviceUser.service_address.gps.lat, this.state.serviceUser.service_address.gps.lng]}
                            perimeter={this.state.serviceUser.perimeter * 1000}
                          />
                        </Topic>
                      </Grid> : ''
                  }
                </Grid>
                <Grid style={{height: '300px'}}>
                  <Album user={alfred._id} key={moment()} underline={true} readOnly={true}/>
                </Grid>
                <Hidden only={['xl', 'lg']} implementation={'css'} className={classes.hidden}>
                  <Grid className={classes.showReservation}>
                    <CustomButton
                      variant="contained"
                      color="primary"
                      aria-label="add"
                      classes={{root: classes.buttonReservation}}
                      onClick={this.toggleDrawer('bottom', true)}
                    >
                      {ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.button_show_services'))}
                    </CustomButton>
                  </Grid>
                  <Hidden only={['xl', 'lg']} implementation={'css'} className={classes.hidden}>
                    <Drawer anchor="bottom" open={this.state.bottom} onClose={this.toggleDrawer('bottom', false)} classes={{root: 'custompreviewdrawer'}}>
                      <Grid className={classes.drawerContent}>
                        <DrawerBooking
                          side={'bottom'}
                          filters={filters}
                          pricedPrestations={pricedPrestations}
                          toggleDrawer={this.toggleDrawer}
                          onChangeDate={this.onChangeDate}
                          onChangeTime={this.onChangeTime}
                          isInPerimeter={this.isInPerimeter}
                          onQtyChanged={this.onQtyChanged}
                          onLocationChanged={this.onLocationChanged}
                          travelTax={this.state.travel_tax}
                          getLocationLabel={this.getLocationLabel}
                          onAvocotesChanged={this.onAvocotesChanged}
                          warningPerimeter={this.hasWarningPerimeter()}
                          warningBudget={this.hasWarningBudget()}
                          warningSelf={this.hasWarningSelf()}
                          clientAddress={this.getClientAddressLabel()}
                          clientAddressId={this.get_prop_address()}
                          book={this.book}
                          alfred_pro={shop.is_professional}
                          {...this.state}
                        />
                      </Grid>
                    </Drawer>
                  </Hidden>
                </Hidden>
              </Grid>
              {/* ------------------------------------------------------- ici content right ---------------------------------------------------*/}
              <Grid className={classes.contentRightContainer} item xl={6} lg={6} md={12} sm={12} xs={12}>
                <Grid className={classes.contentRight}>
                  <DrawerBooking
                    filters={filters}
                    pricedPrestations={pricedPrestations}
                    toggleDrawer={this.toggleDrawer}
                    onChangeDate={this.onChangeDate}
                    onChangeTime={this.onChangeTime}
                    onQtyChanged={this.onQtyChanged}
                    isInPerimeter={this.isInPerimeter}
                    onLocationChanged={this.onLocationChanged}
                    travelTax={this.state.travel_tax}
                    getLocationLabel={this.getLocationLabel}
                    onAvocotesChanged={this.onAvocotesChanged}
                    warningPerimeter={this.hasWarningPerimeter()}
                    warningBudget={this.hasWarningBudget()}
                    warningSelf={this.hasWarningSelf()}
                    clientAddress={this.getClientAddressLabel()}
                    clientAddressId={this.get_prop_address()}
                    book={this.book}
                    alfred_pro={shop.is_professional}
                    {...this.state}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid style={{display: 'flex', justifyContent: 'center'}}>
            <Grid style={{width: '80%', paddingLeft: '5%', paddingRight: '5%'}}>
              {
                this.state.reviews.length === 0 ? null :
                  <Grid style={{marginTop: '5%'}}>
                    <Topic
                      underline={true}
                      titleTopic={ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_commentary'))}
                      titleSummary={alfred.firstname ?
                        ReactHtmlParser(this.props.t('USERSERVICEPREVIEW.topic_commentary_summary', {firstname: alfred.firstname}))
                        :
                        ''}
                    >
                      <SummaryCommentary user={this.state.alfred._id} serviceUser={this.props.params.id}/>
                    </Topic>
                  </Grid>
              }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  render() {
    const {classes} = this.props
    const {address} = this.props.params
    const {service, alfred, user} = this.state

    if (!this.state.serviceUser) {
      return null
    }

    const res = (
      <React.Fragment>
        <Head>
          <title>{service.label} par {alfred.full_name}</title>
          <meta property="og:image" content={`/${service.picture}`}/>
          <meta property="og:image:secure_url" content={`/${service.picture}`}/>
          <meta property="og:description" content={`${service.label} par ${alfred.firstname}`}/>
          <meta property="description" content={`${service.label} par ${alfred.firstname}`}/>
          <meta property="og:type" content="website"/>
          <meta property="og:url" content="https://my-alfred.io"/>
        </Head>
        <Hidden only={['xs']} implementation={'css'} className={classes.hidden}>
          <Layout user={user} selectedAddress={address}>
            {this.content(classes)}
          </Layout>
        </Hidden>
        <Hidden only={['lg', 'xl', 'sm', 'md']} implementation={'css'} className={classes.hidden}>
          <LayoutMobile>
            {this.content(classes)}
          </LayoutMobile>
        </Hidden>
      </React.Fragment>
    )
    return res
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(withParams(UserServicesPreview)))
