import Grid from '@material-ui/core/Grid'
import React, {useEffect, useState} from 'react'
import {withStyles} from '@material-ui/core/styles'
import styles from '../../static/css/components/AlfredConditions/AlfredConditions'
import axios from 'axios'
import {toast} from 'react-toastify'
import {SHOP} from '../../utils/i18n'
import ButtonSwitch from '../ButtonSwitch/ButtonSwitch'
import moment from 'moment'
import {ALF_CONDS, CANCEL_MODE} from '../../utils/consts'
import {snackBarSuccess} from '../../utils/notifications'

const AlfredConditions = ({classes, shop}) => {
  console.log(shop.booking_request, 'shop')
  const[idCard, setIdCard] = useState(shop.identity_card)
  const[myAlfredConditions, setMyAlfredConditions] = useState(shop.my_alfred_conditions)
  const[profilePicture, setProfilePicture] = useState(shop.profile_picture)
  const[alfredRecommandations, setAlfredRecommandations] = useState(shop.recommandations)
  const[isFlexible, setFlexible] = useState(shop.flexible_cancel)
  const[isModerate, setModerate] = useState(shop.moderate_cancel)
  const[isStrict, setStrict] = useState(shop.strict_cancel)
  const[bookingRequest, setBookingRequest]= useState(shop.booking_request)
  const[noBookingRequest, setNoBookingRequest]= useState(shop.no_booking_request)
  const[welcomeMessage, setWelcomeMessage]= useState(shop.welcome_message)

  useEffect(() => {
    const data = {
      my_alfred_conditions: myAlfredConditions,
      profile_picture: profilePicture,
      identity_card: idCard,
      flexible_cancel: isFlexible,
      moderate_cancel: isModerate,
      strict_cancel: isStrict,
      recommandations: alfredRecommandations,
      booking_request: bookingRequest,
      no_booking_request: noBookingRequest,
      welcome_message: welcomeMessage,
    }
    axios.put('/myAlfred/api/shop/editParameters', {data})
      .then((res) => {
        console.log(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }, [])

  return (
    <Grid container spacing={3} style={{margin: 0, width: '100%'}}>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.titleContainer}>
        <h2 className={classes.policySizeTitle}>{SHOP.bookingCondition.title}</h2>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <h3 className={classes.policySizeSubtitle}>{SHOP.bookingCondition.subtitle}</h3>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <h4 className={classes.policySizeSubtitle}
          style={{margin: 0}}>{SHOP.bookingCondition.title_secondSection}</h4>
      </Grid>
      <Grid container spacing={1} style={{margin: 0, width: '100%'}} item xl={12} lg={12} md={12} sm={12} xs={12}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <ButtonSwitch
            key={moment()}
            id={ALF_CONDS.BASIC}
            label={SHOP.bookingCondition.conditions_bacsic}
            onChange={() => setMyAlfredConditions(!myAlfredConditions)}
            checked={myAlfredConditions}
          />
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <ButtonSwitch
            key={moment()}
            id={ALF_CONDS.PICTURE}
            label={SHOP.bookingCondition.conditions_picture}
            onChange={() => setProfilePicture(!profilePicture)}
            checked={profilePicture}
          />
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <ButtonSwitch
            key={moment()}
            id={ALF_CONDS.ID_CARD}
            label={SHOP.bookingCondition.conditions_idCard}
            onChange={() => setIdCard(!idCard)}
            checked={idCard}
          />
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <ButtonSwitch
            key={moment()}
            id={ALF_CONDS.RECOMMEND}
            label={SHOP.bookingCondition.conditions_recommend}
            onChange={() => setAlfredRecommandations(!alfredRecommandations)}
            checked={alfredRecommandations}
          />
        </Grid>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <h4 className={classes.policySizeSubtitle} style={{margin: 0}}>{SHOP.bookingCondition.title_thirdSection}</h4>
      </Grid>
      <Grid container spacing={1} style={{margin: 0, width: '100%'}} item xl={12} lg={12} md={12} sm={12} xs={12}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <ButtonSwitch
            key={moment()}
            id={CANCEL_MODE.FLEXIBLE}
            checked={isFlexible}
            label={SHOP.bookingCondition.condition_flexible}
            onChange={() => setFlexible(!isFlexible)}
          />
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <ButtonSwitch
            key={moment()}
            id={CANCEL_MODE.MODERATE}
            checked={isModerate}
            label={SHOP.bookingCondition.condition_moderate}
            onChange={() => setModerate(!isModerate)}
          />
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <ButtonSwitch
            key={moment()}
            id={CANCEL_MODE.STRICT}
            checked={isStrict}
            label={SHOP.bookingCondition.condition_strict}
            onChange={() => setStrict(!isStrict)}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withStyles(styles, {withTheme: true})(AlfredConditions)
