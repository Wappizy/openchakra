import ReactHtmlParser from 'react-html-parser'
import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import RadioGroup from '@material-ui/core/RadioGroup'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import PaymentPics from '../../PaymentPics/PaymentPics'
import HttpsIcon from '@material-ui/icons/Https'
import PaymentCard from '../PaymentCard/PaymentCard'
import withStyles from '@material-ui/core/styles/withStyles'
import styles from '../../../static/css/components/PaymentMode/PaymentMode'
import {PAYMENT_MODE} from '../../../utils/i18n'

class PaymentMode extends React.Component {
  constructor(props) {
    super(props)
  }

  handleCardSelected = e => {
    this.props.handleCardSelected(e.target.value)
  };

  render() {
    const {cards, currentUser, id_card, classes} = this.props
    let name = `${currentUser.firstname } ${ currentUser.name}`

    return(
      <Grid>
        <Grid style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <Grid style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Grid>
              <HttpsIcon/>
            </Grid>
            <Grid style={{marginLeft: '2vh'}}>
              <Typography>{ReactHtmlParser(this.props.t('PAYMENT_MODE.title'))}</Typography>
            </Grid>
          </Grid>
          <Grid className={classes.paymentPicsContainer}>
            <PaymentPics/>
          </Grid>
        </Grid>
        <Grid style={{marginTop: '3vh', marginBottom: '3vh'}}>
          <FormControl component="fieldset" style={{width: '100%'}}>
            <RadioGroup value={id_card ? id_card : ''} onChange={this.handleCardSelected} style={{backgroundColor: 'rgba(249,249,249, 1)', borderRadius: 14, padding: '5%'}}>
              <PaymentCard editable={false} cards={cards} userName={name}/>
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    )
  }
}

export default withTranslation(null, {withRef: true})(withStyles(styles)(PaymentMode))
