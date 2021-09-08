import {withTranslation} from 'react-i18next'
const {setAxiosAuthentication}=require('../../utils/authentication')
import React from 'react'
import styles from '../../static/css/components/Layout/LayoutReserations/LayoutReservations'
import withStyles from '@material-ui/core/styles/withStyles'
import Grid from '@material-ui/core/Grid'
import Layout from './Layout'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import '../../static/assets/css/custom.css'

class LayoutReservations extends React.Component {

  constructor(props) {
    super(props)
    this.state={
      reservationStatus: 0,
      reservationType: 1,
    }
  }

  componentDidMount = () => {
    setAxiosAuthentication()
  };

  render() {
    const {user} = this.state
    const {classes, children, reservationType, userInfo} = this.props

    return(
      <Layout user={user}>
        <Grid style={{display: 'flex', justifyContent: 'center'}}>
          <Grid style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
            <Grid style={{display: 'flex', justifyContent: 'center'}}>
              <h2 className={'customlayoutresatitle'}>Mes réservations</h2>
            </Grid>
            <Grid>
              <Tabs
                value={userInfo && !userInfo.is_alfred ? 0 : reservationType}
                onChange={userInfo && !userInfo.is_alfred ? null : this.props.onReservationTypeChanged}
                aria-label="scrollable force tabs"
                scrollButtons="on"
                classes={{indicator: classes.scrollMenuIndicator}}
              >
                {
                  userInfo && userInfo.is_alfred ?
                    <Tab label={"Mes réservations d'Alfred"} className={classes.scrollMenuTab} />
                    : null
                }
                <Tab label={"Mes réservations d'utilisateur"} className={classes.scrollMenuTab} />
              </Tabs>
            </Grid>
            <Grid style={{backgroundColor: 'rgba(249,249,249, 1)', width: '100%'}}>
              <Grid className={classes.containerChildren}>
                {children}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Layout>
    )
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(LayoutReservations))
