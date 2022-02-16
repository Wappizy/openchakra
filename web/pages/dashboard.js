import axios from 'axios'
import {isLoggedUserAdmin, isUserSuperAdmin} from '../utils/context'
import {withTranslation} from 'react-i18next'
const {setAxiosAuthentication}=require('../utils/authentication')
import React from 'react'

import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import {Typography} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Router from 'next/router'
import DashboardLayout from '../hoc/Layout/DashboardLayout'
import {Link} from '@material-ui/core'

const styles = () => ({
  signupContainer: {
    alignItems: 'center',
    justifyContent: 'top',
    flexDirection: 'column',

  },
  card: {
    padding: '1.5rem 3rem',
    width: '90%',
    marginTop: '100px',
  },
  cardContant: {
    flexDirection: 'column',
  },
  linkText: {
    textDecoration: 'none',
    color: 'black',
    fontSize: 12,
    lineHeight: 4.15,
  },
})

class home extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      user: null,
    }
  }

  componentDidMount() {
    localStorage.setItem('path', Router.pathname)
    if (!isLoggedUserAdmin()) {
      Router.push('/login')
    }
    setAxiosAuthentication()
    axios.get('/myAlfred/api/users/current')
      .then(response => {
        this.setState({user: response.data})
      })
  }

  render() {
    const {classes} = this.props
    const {user}=this.state

    const superAdmin = isUserSuperAdmin(user)

    return (
      <DashboardLayout home={true}>
        <Grid container className={classes.signupContainer}>
          <Card className={classes.card}>
            <Grid container>
              <Grid item xs={6}>
                <Typography style={{fontSize: 30}}>Base de données</Typography>
                <Link href="/dashboard/users/all"><a>Comptes</a></Link><br/>
                <Link href="/dashboard/serviceusers/all"><a>Services ({this.props.t('DASHBOARD.alfred')})</a></Link><br/>
                <Link href="/dashboard/category/all"><a>Catégories</a></Link><br/>
                <Link href="/dashboard/billing/all"><a>Méthodes de facturation</a></Link><br/>
                <Link href="/dashboard/filterPresentation/all"><a>Filtres de présentation</a></Link><br/>
                <Link href="/dashboard/job/all"><a>Métiers</a></Link><br/>
                <Link href="/dashboard/equipments/all"><a>Equipements</a></Link><br/>
                <Link href="/dashboard/services/all"><a>Services</a></Link><br/>
                <Link href="/dashboard/prestations/all"><a>Prestations</a></Link><br/>
              </Grid>
              <Grid item xs={6}>
                <Typography style={{fontSize: 30}}>Maintenance</Typography>
                <Link href="/dashboard/logAsUser"><a>{this.props.t('DASHBOARD.logAs')}</a></Link><br/>
                <Link href="/dashboard/reviews"><a>Modération des commentaires</a></Link><br/>
                <Link href="/dashboard/invitation"><a>Envoi mail d'inscription</a></Link><br/>
                { superAdmin &&
                  <>
                    <Typography style={{fontSize: 30}}>Paramétrage</Typography>
                    <Link href="/dashboard/uiconfiguration"><a>Configuration UI</a></Link><br/>
                    <Link href="/dashboard/companies/all"><a>Entreprises</a></Link><br/>
                    <Link href="/dashboard/commissions"><a>Paramétrage des commissions</a></Link><br/>
                    <Link href="/dashboard/incomes"><a>Commissions perçues</a></Link><br/>
                  </>
                }

                <Typography style={{fontSize: 30}}>Moniteur</Typography>
                <Link href="/dashboard/statistics"><a>Statistiques</a></Link><br/>
                <Link href="/dashboard/map"><a>Carte des services</a></Link><br/>
                <Link href="/dashboard/bookings"><a>Réservations</a></Link><br/>
                <Link href="/dashboard/events"><a>Evénements</a></Link><br/>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </DashboardLayout>
    )
  }
}

export default withTranslation('custom', {withRef: true})(withStyles(styles)(home))
