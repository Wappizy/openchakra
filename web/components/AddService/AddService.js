const {setAxiosAuthentication}=require('../../utils/authentication')
import React from 'react'
import Router from 'next/router'
import Grid from '@material-ui/core/Grid'
import {withStyles} from '@material-ui/core/styles'
import styles from '../../static/css/components/AddService/AddService'
import {Button} from '@material-ui/core'
import {SHOP, ADD_SERVICES} from '../../utils/i18n'
import Typography from '@material-ui/core/Typography'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
const {isLoggedUserAlfred}=require('../../utils/context')
import '../../static/assets/css/custom.css'

class AddService extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount = () => {
    setAxiosAuthentication()
  };

  clickService = () => {
    // Router.push(isLoggedUserAlfred() ? `/myShop/services?user=${this.props.user}` : '/creaShop/creaShop')
    Router.push('/creaShop/creaShop')
  };

  render() {
    const {classes}=this.props

    return (
      <Grid className={classes.containerAddService}>
        <Grid className={classes.containerTitle}>
          <h3 className={'customaddservicestitle'}>{ADD_SERVICES.title}</h3>
        </Grid>
        <Button classes={{root: `customaddservicesbutton ${classes.buttonAddService}`}} onClick={this.clickService} startIcon={<AddCircleOutlineIcon />}>
          { isLoggedUserAlfred() ?
            SHOP.addService
            :
            SHOP.createShop
          }
        </Button>
        <Typography className={`customaddservicessubtitle ${classes.descriptionAddService}`}>{ADD_SERVICES.add_service}</Typography>
      </Grid>
    )
  }
}

export default withStyles(styles)(AddService)
