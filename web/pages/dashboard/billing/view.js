import { snackBarSuccess } from '../../../utils/notifications'

const {clearAuthenticationToken, setAxiosAuthentication} = require('../../../utils/authentication')
import React from 'react'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import {Typography} from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import {withStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Layout from '../../../hoc/Layout/Layout'
import axios from 'axios'
import Router from 'next/router'


const styles = theme => ({
  loginContainer: {
    alignItems: 'center',
    height: '100vh',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  card: {
    padding: '1.5rem 3rem',
    width: 400,
  },
  cardContant: {
    flexDirection: 'column',
  },
  linkText: {
    textDecoration: 'none',
    color: 'black',
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
  },
})

class view extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      billing: {},
      label: '',

    }

    this.handleClick = this.handleClick.bind(this)
  }

  static getInitialProps({query: {id}}) {
    return {billing_id: id}

  }

  componentDidMount() {
    localStorage.setItem('path', Router.pathname)
    const id = this.props.billing_id
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/admin/billing/all/${id}`)
      .then(response => {
        let billing = response.data
        this.setState({billing: billing})

      })
      .catch(err => {
        console.error(err)
        if (err.response.status === 401 || err.response.status === 403) {
          clearAuthenticationToken()
          Router.push({pathname: '/'})
        }
      })
  }

  onChange = e => {
    const state = this.state.billing
    state[e.target.name] = e.target.value
    this.setState({billing: state})
  };

  onSubmit = e => {
    e.preventDefault()

    const {label} = this.state.billing
    const id = this.props.billing_id
    axios.put(`/myAlfred/api/admin/billing/all/${id}`, {label})
      .then(() => {
        snackBarSuccess('Méthode de facturation modifié avec succès')
        Router.push({pathname: '/dashboard/billing/all'})
      })
      .catch(err => {
        console.error(err)
      })
  };

  handleClick() {
    const id = this.props.billing_id
    axios.delete(`/myAlfred/api/admin/billing/all/${id}`)
      .then(() => {
        snackBarSuccess('Méthode de facturation supprimée avec succès')
        Router.push({pathname: '/dashboard/billing/all'})
      })
      .catch(err => {
        console.error(err)
        clearAuthenticationToken()
        Router.push({pathname: '/'})
      })
  }


  render() {
    const {classes} = this.props
    const {billing} = this.state


    return (
      <Layout>
        <Grid container className={classes.loginContainer}>
          <Card className={classes.card}>
            <Grid>
              <Grid item style={{display: 'flex', justifyContent: 'center'}}>
                <Typography style={{fontSize: 30}}>{billing.label}</Typography>
              </Grid>
              <form onSubmit={this.onSubmit}>
                <Grid item>
                  <TextField
                    id="standard-with-placeholder"
                    margin="normal"
                    style={{width: '100%'}}
                    type="text"
                    name="label"
                    value={billing.label}
                    onChange={this.onChange}

                  />
                </Grid>
                <Grid item style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
                  <Button type="submit" variant="contained" color="primary" style={{width: '100%'}}>
                    Modifier
                  </Button>
                  <Button type="button" variant="contained" classes={{root: classes.cancelButton}} style={{width: '100%'}}
                    onClick={this.handleClick}>
                    Supprimer
                  </Button>
                </Grid>
              </form>
            </Grid>
          </Card>
        </Grid>
      </Layout>
    )
  }
}


export default withStyles(styles)(view)
