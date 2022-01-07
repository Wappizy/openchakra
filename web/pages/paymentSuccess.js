const {clearAuthenticationToken, setAxiosAuthentication}=require('../utils/authentication')
import React from 'react'
import axios from 'axios'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Router from 'next/router'
import {withStyles} from '@material-ui/core/styles'
import io from 'socket.io-client'

import LayoutPayment from '../hoc/Layout/LayoutPayment'
import styles from '../static/css/pages/paymentSuccess/paymentSuccess'

const {BOOK_STATUS}=require('../utils/consts')

const {is_production, is_validation}=require('../config/config')
const {snackBarError}=require('../utils/notifications')

class paymentSuccess extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      booking: null,
      success: false,
    }
  }

  static getInitialProps({query: {booking_id, transactionId}}) {
    return {booking_id: booking_id, transaction_id: transactionId}
  }

  componentDidMount() {

    localStorage.setItem('path', Router.pathname)
    setAxiosAuthentication()
    axios.get('/myAlfred/api/users/current')
      .then(res => {
        let user = res.data
        this.setState({user: user})
      })
      .catch(err => {
        console.error(err)
      })
    axios.get(`/myAlfred/api/booking/${this.props.booking_id}`)
      .then(res => {
        const booking = res.data
        this.setState({booking: booking})
        axios.get(`/myAlfred/api/payment/payin/${booking.mangopay_payin_id}`)
          .then(result => {
            let transaction = result.data
            console.log(`Transaction:${JSON.stringify(transaction)}`)
            if (transaction.Status != 'SUCCEEDED') {
              return Router.push(`/paymentFailed?booking_id=${this.props.booking_id}`)
            }
            this.setState({success: true})
            const booking_id = this.props.booking_id
            this.socket = io()
            this.socket.on('connect', () => {
              this.socket.emit('booking', booking_id)
              const newStatus = booking.user.company_customer ? BOOK_STATUS.CUSTOMER_PAID : booking.status==BOOK_STATUS.PREAPPROVED ? BOOK_STATUS.CONFIRMED : BOOK_STATUS.TO_CONFIRM
              axios.put(`/myAlfred/api/booking/modifyBooking/${booking_id}`, {status: newStatus})
                .then(res => {
                  setTimeout(() => this.socket.emit('changeStatus', res.data), 100)
                  localStorage.removeItem('booking_id')
                  if (!booking.user.company_customer) {
                    setTimeout(() => Router.push('/reservations/reservations'), 4000)
                  }
                })
                .catch()
            })
          })
      })
      .catch(err => {
        console.error(err)
      })

  }


  render() {
    const {classes} = this.props
    const {success, booking} = this.state

    if (!success) {
      return null
    }
    return (
      <React.Fragment>
        <LayoutPayment>
          <Grid style={{display: 'flex', backgroundColor: 'rgba(249,249,249, 1)', width: '100%', justifyContent: 'center', padding: '10%', minHeight: '80vh'}}>
            <Grid className={classes.containerPaymentSuccess}>
              <Grid style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <Grid style={{display: 'flex', flexDirection: 'column'}}>
                  <Grid>
                    <h2>Votre service a été réservé avec succès !</h2>
                  </Grid>
                  <Grid>
                    <Typography>Merci de nous faire confiance.</Typography>
                  </Grid>
                </Grid>
                <Grid>
                  { booking.user.company_customer ?
                    <Grid>
                      <Typography>Nous allons maintenant chercher pour vous l'Alfred qui répondra à votre service.
                      Vous serez informé sous peu de la date de prestation.</Typography>
                    </Grid>
                    :
                    <>
                      <Grid>
                        <Typography>Vous allez être redirigé vers votre page Mes Réservations.</Typography>
                      </Grid>
                      <Grid>
                        <Typography>Si la redirection ne fonctionne pas <a href={'/reservations/reservations'}>cliquez ici</a></Typography>
                      </Grid>
                    </>
                  }
                </Grid>
              </Grid>

            </Grid>
          </Grid>
        </LayoutPayment>
      </React.Fragment>
    )
  }
}


export default withStyles(styles)(paymentSuccess)
