import {withTranslation} from 'react-i18next'
import ReactHtmlParser from 'react-html-parser'
import AddIcon from '@material-ui/icons/Add'
import Divider from '@material-ui/core/Divider'
import FormHelperText from '@material-ui/core/FormHelperText'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import React, {useState, useEffect} from 'react'
import RemoveIcon from '@material-ui/icons/Remove'
import Router from 'next/router'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import axios from 'axios'
import withStyles from '@material-ui/core/styles/withStyles'
import CustomButton from '../../CustomButton/CustomButton'
import {isEmailOk, isPhoneOk} from '../../../utils/sms'
import LocationSelect from '../../Geo/LocationSelect'
import styles from '../../../static/css/components/FormAvocotes/FormAvocotes'

const moment = require('moment')
const {snackBarError} = require('../../../utils/notifications')

const {AVOCOTES_COMPANY_NAME}=require('../../../utils/consts')

moment.locale('fr')


function Form({classes, booking_id, t}) {
  const [email, setEmail] = useState('')
  const [firstname, setFirstname] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState({
    city: null,
    address: null,
    zip_code: null,
    country: null,
    gps: {
      lat: null,
      lng: null,
    },
  })
  const [phone, setPhone] = useState('')
  const [quantities, setQuantities] = useState({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [service, setService] = useState(null)

  function updateTotalPrice() {
    let total=0
    for (const [key, value] of Object.entries(quantities)) {
      if (value) {
        const price=service.prestations.find(p => p._id==key).company_price
        total+=price*value
      }
    }
    setTotalPrice(total)
  }

  function onChangeQuantity(prestation_id, mode) {
    let qties={...quantities}
    if(mode === 'remove' && qties[prestation_id] > 0) {
      qties[prestation_id]=qties[prestation_id]-1
      setQuantities(qties)
      return
    }
    if(mode === 'add') {
      qties[prestation_id]=qties[prestation_id]+1
      setQuantities(qties)
    }
  }

  function onAddressChanged(suggestion) {
    const newAddress = suggestion ?
      {
        city: suggestion.city,
        address: suggestion.name,
        zip_code: suggestion.postcode,
        country: suggestion.country,
        gps: {
          lat: suggestion.latlng.lat,
          lng: suggestion.latlng.lng,
        },
      }
      :
      null
    setAddress(newAddress)
  }

  function emailValidator() {
    return !!isEmailOk(email)
  }

  function phoneValidator() {
    return !!isPhoneOk(phone)
  }

  function payEnabled() {
    return (totalPrice>0 && firstname.length > 0 && name.length > 0 && address.gps.lat !== null && address.gps.lng !== null && emailValidator() && phoneValidator())

  }

  const onSubmit = () => {
    let prestations=[]
    service.prestations.forEach(p => {
      if (quantities[p._id]) {
        prestations.push({name: p.label, price: p.company_price, value: quantities[p._id]})
      }
    })
    axios.post('/myAlfred/api/booking/avocotes', {
      email: email,
      firstname: firstname,
      name: name,
      address: address,
      phone: phone,
      service: service,
      totalPrice: totalPrice,
      prestations: prestations,
    })
      .then(res => {
        const booking=res.data
        axios.post('/myAlfred/api/payment/avocotesPayIn', {bookingId: booking._id})
          .then(res => {
            const payInResult=res.data
            console.log(`Got payIn result:${JSON.stringify(payInResult, null, 2)}`)
            if (payInResult.SecureModeNeeded) {
              Router.push(payInResult.SecureModeRedirectURL)
            }
            else if (payInResult.RedirectURL) {
              Router.push(payInResult.RedirectURL)
            }
            else {
              Router.push(`/paymentSuccess?booking_id=${booking_id}`)
            }
          })

          .catch(err => {
            console.error(err)
            snackBarError(err)
          })
      })
      .catch(err => {
        const errors=err.response.data
        snackBarError(Object.values(errors))
      })
  }

  useEffect(() => {
    if (service) {
      updateTotalPrice()
      return
    }


    axios.get(`/myAlfred/api/service/partner/${AVOCOTES_COMPANY_NAME}`)
      .then(res => {
        setQuantities(res.data.prestations.map(p => p._id.toString()).reduce((acc, curr) => ({...acc, [curr]: 0}), {}))
        setService(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }, [service, quantities])

  const totalPriceTxt=`${Number(totalPrice||0).toFixed(2)} €`
  return(
    <>
      <Grid container className={classes.mainContainer} spacing={2}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <h2 className={classes.title}>{ReactHtmlParser(t('AVOCOTES.titleCordonnates'))}</h2>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <TextField id="standard-basic" label="Email" classes={{root: classes.textField}} value={email} onChange={e => setEmail(e.target.value)} error={email.length === 0 || !emailValidator()} helperText={email.length === 0 ? 'Veuillez entrer un e-mail' : !emailValidator() ? 'Veuillez entrer un e-mail valide' : null}/>
        </Grid>
        <Grid item xl={6} lg={6} md={12} sm={6} xs={12}>
          <TextField id="standard-basic" label="Prénom" classes={{root: classes.textField}} value={firstname} onChange={e => setFirstname(e.target.value)} helperText={firstname.length === 0 ? 'Veuillez entrer votre prénom' : null} error={firstname.length==0}/>
        </Grid>
        <Grid item xl={6} lg={6} md={12} sm={6} xs={12}>
          <TextField id="standard-basic" label="Nom" classes={{root: classes.textField}} value={name} onChange={e => setName(e.target.value)} helperText={name.length === 0 ? 'Veuillez entrer votre nom' : null} error={name.length==0}/>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <LocationSelect
            className={classes.algoliaplaces}
            placeholder='Adresse'
            onChange={({query, rawAnswer, suggestion, suggestionIndex}) => onAddressChanged(suggestion)}
            onClear={() => setAddress({
              city: null,
              address: null,
              zip_code: null,
              country: null,
              gps: {
                lat: null,
                lng: null,
              },
            })}
          />
          {!address.gps.lat || !address.gps.lng ? <FormHelperText style={{color: '#B26879'}}>Veuillez sélectionner une adresse dans la liste.</FormHelperText>:null}
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <TextField id="standard-basic" label="Téléphone" classes={{root: classes.textField}} value={phone} onChange={e => setPhone(e.target.value)} error={phone.length == 0 || !phoneValidator()} helperText={phone.length === 0 ? 'Veuillez entrer un n° téléphone' : !phoneValidator() ? 'Veuillez entrer un n° téléphone valide' : null}/>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <h2 className={classes.title}>{ReactHtmlParser(t('AVOCOTES.titleDetails'))}</h2>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          { service && service.prestations.map(p => (
            <Grid style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Grid container spacing={3} style={{width: '100%', margin: 0}}>
                <Grid item>
                  <Typography>{p.label}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={3} style={{width: '100%', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                <Grid item>
                  <IconButton aria-label="RemoveIcon" onClick={() => onChangeQuantity(p._id, 'remove')}>
                    <RemoveIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <Typography>{quantities[p._id]||0}</Typography>
                </Grid>
                <Grid item>
                  <IconButton aria-label="AddIcon" onClick={() => onChangeQuantity(p._id, 'add')}>
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          ))
          }
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Divider/>
        </Grid>
        <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} spacing={3} className={classes.containerPrice}>
          <Grid item>
            <Typography>{ReactHtmlParser(t('AVOCOTES.totalText'))}</Typography>
          </Grid>
          <Grid item>
            <Typography>{totalPriceTxt}</Typography>
          </Grid>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <CustomButton variant="contained" classes={{root: classes.buttonPaid}} disabled={!payEnabled()} onClick={onSubmit}>
            {ReactHtmlParser(t('AVOCOTES.paidButton'))}
          </CustomButton>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Typography>{ReactHtmlParser(t('AVOCOTES.helperText'))}</Typography>
        </Grid>
      </Grid>
    </>
  )
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(Form))
