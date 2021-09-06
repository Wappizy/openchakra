import {withTranslation} from 'react-i18next'
import React from 'react'
import Grid from '@material-ui/core/Grid'
import ScrollMenu from '../../components/ScrollMenu/ScrollMenu'
import Layout from './Layout'
import axios from 'axios'
const {setAxiosAuthentication}=require('../../utils/authentication')
import {isB2BAdmin} from '../../utils/context'
import styles from '../../static/css/components/LayoutAccount/LayoutAccount'
import '../../static/assets/css/custom.css'
import {withStyles} from '@material-ui/core/styles'

class LayoutAccount extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
    }
  }

  componentDidMount() {
    setAxiosAuthentication()
    axios.get('/myAlfred/api/users/current')
      .then(res => {
        const user = res.data
        this.setState({
          items: [
            {
              label: 'Mes Informations',
              url: isB2BAdmin(user) ? '/editProfileCompany' : '/editProfile',
            },
            {
              label: 'Modes de paiement',
              url: '/paymentMethod',
            },
            {
              label: isB2BAdmin(user) ? 'Mes sites' : 'Mes adresses',
              url: '/myAddresses',
            },
            {
              label: 'Vérification',
              url: '/trustAndVerification',
            },
            {
              label: 'Sécurité',
              url: '/security',
            },
            {
              label: 'Notifications',
              url: '/notifications',
            },
          ],
        })
      })
      .catch(err => {
        console.error(err)
      })
  }

  render() {
    const {items} = this.state
    const {children, classes} = this.props

    return (
      <Layout>
        <Grid style={{display: 'flex', justifyContent: 'center'}}>
          <Grid style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}>
            <Grid style={{display: 'flex', justifyContent: 'center'}}>
              <h2>Mes paramètres</h2>
            </Grid>
            <Grid>
              <ScrollMenu categories={items} mode={'account'}/>
            </Grid>
            <Grid className={`customlayoutaccountbackground ${classes.layoutaccountBackground}` }>
              <Grid className={`customboxlayoutaccount ${classes.boxlayout}`}>
                {children}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Layout>
    )
  }
}

export default withTranslation()(withStyles(styles)(LayoutAccount))
